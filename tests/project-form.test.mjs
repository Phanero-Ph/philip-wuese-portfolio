import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";

// Exercise the real form's save callback with controlled hook state and API
// acknowledgements, including the numeric years returned by production MySQL.
const source = readFileSync(new URL("../src/site-pages/Admin.tsx", import.meta.url), "utf8");
const compile = (code) => ts.transpileModule(`${code}\nexport { ProjectForm };`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const compiled = compile(source);

function form(project, { failSave = false, upload = async () => ({ media: { url: "/uploads/cover.png" } }) } = {}) {
  const hooks = [];
  const writes = [];
  let closed = false;
  let hookIndex = 0;
  const imports = {
    "react/jsx-runtime": jsxRuntime,
    react: { useState(initial) {
      const index = hookIndex++;
      const slot = hooks[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slot.value, (value) => { slot.value = typeof value === "function" ? value(slot.value) : value; }];
    } },
    "@/utils/cn": { cn: (...values) => values.filter(Boolean).join(" ") },
    "@/store": { useStore: () => ({ state: { projects: [project] }, saveProjects: async (projects) => {
      if (failSave) throw new Error("Database unavailable");
      writes.push(projects);
    } }) },
    "@/router": {}, "@/data/site": {}, "@/data/adminUsers": {}, "@/components/ui": {}, "@/api": { apiForm: upload },
  };
  const loaded = {};
  new Function("require", "exports", compiled)((name) => {
    assert.ok(imports[name], `Unexpected import: ${name}`);
    return imports[name];
  }, loaded);
  const render = () => {
    hookIndex = 0;
    return loaded.ProjectForm({ editing: { index: 0 }, onClose: () => { closed = true; } });
  };
  const find = (node, match) => {
    if (!node || typeof node !== "object") return undefined;
    if (match(node)) return node;
    for (const child of [node.props?.footer, ...[node.props?.children].flat()]) {
      const result = find(child, match);
      if (result) return result;
    }
  };
  const saveButton = () => find(render(), (node) => node.type === "button" && node.props.children === "Save changes");
  return {
    save: () => saveButton().props.onClick(),
    saveDisabled: () => saveButton().props.disabled,
    upload: (file) => find(render(), (node) => node.props?.type === "file").props.onChange({ currentTarget: { files: [file], value: "cover.png" } }),
    removeCover: () => find(render(), (node) => node.type === "button" && node.props.children === "Remove cover").props.onClick(),
    cover: () => hooks[0].value.cover,
    writes, error: () => hooks[1].value, saving: () => hooks[2].value, closed: () => closed,
  };
}

for (const year of [2024, "2024", "2025 — now", null]) {
  test(`an existing project with year ${JSON.stringify(year)} saves without editing the year field`, async () => {
    const editor = form({ id: "p1", name: "Edited project", slug: "project", year });
    await editor.save();
    assert.equal(editor.error(), null);
    assert.equal(editor.closed(), true);
    assert.equal(editor.writes.length, 1);
    assert.equal(editor.writes[0][0].year, String(year ?? new Date().getFullYear()));
    assert.equal(editor.writes[0][0].name, "Edited project");
    assert.equal(editor.saving(), false);
  });
}

test("request failures stay visible and keep the editor open", async () => {
  const editor = form({ id: "p1", name: "Project", year: 2024 }, { failSave: true });
  await editor.save();
  assert.equal(editor.error(), "Database unavailable");
  assert.equal(editor.closed(), false);
  assert.equal(editor.saving(), false);
});

test("errors preparing the payload also stay visible and keep the editor open", async () => {
  const editor = form({ id: "p1", name: "Project", year: 2024, domain: 42 });
  await editor.save();
  assert.match(editor.error(), /trim is not a function/);
  assert.equal(editor.writes.length, 0);
  assert.equal(editor.closed(), false);
  assert.equal(editor.saving(), false);
});

test("uploading a cover sends the file to the media API and saves its returned URL", async () => {
  const file = new File(["image bytes"], "cover.png", { type: "image/png" });
  const editor = form({ id: "p1", name: "Project", year: 2024 }, { upload: async (url, body) => {
    assert.equal(url, "/api/media");
    assert.equal(body.get("file"), file);
    assert.equal(body.get("alt"), "Project");
    return { media: { url: "/uploads/cover.png" } };
  } });
  await editor.upload(file);
  assert.equal(editor.cover(), "/uploads/cover.png");
  await editor.save();
  assert.equal(editor.writes[0][0].cover, "/uploads/cover.png");
});

test("a failed upload preserves the existing cover and reports the error", async () => {
  const editor = form({ id: "p1", name: "Project", cover: "/uploads/old.png" }, { upload: async () => { throw new Error("Upload failed"); } });
  await editor.upload(new File(["image"], "cover.png", { type: "image/png" }));
  assert.equal(editor.cover(), "/uploads/old.png");
  assert.equal(editor.error(), "Upload failed");
  assert.equal(editor.saveDisabled(), false);
});

test("saving waits until the cover upload is finished", async () => {
  let finish;
  const editor = form({ id: "p1", name: "Project" }, { upload: () => new Promise((resolve) => { finish = resolve; }) });
  const pending = editor.upload(new File(["image"], "cover.png", { type: "image/png" }));
  assert.equal(editor.saveDisabled(), true);
  await editor.save();
  assert.deepEqual(editor.writes, []);
  finish({ media: { url: "/uploads/new.png" } });
  await pending;
  assert.equal(editor.saveDisabled(), false);
});

test("unsupported and oversized cover files are rejected without uploading", async () => {
  let uploads = 0;
  const editor = form({ id: "p1", name: "Project" }, { upload: async () => { uploads++; } });
  await editor.upload(new File(["document"], "document.txt", { type: "text/plain" }));
  assert.match(editor.error(), /no larger than 5 MB/);
  await editor.upload(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }));
  assert.equal(uploads, 0);
});

test("removing a cover clears it when saving the project", async () => {
  const editor = form({ id: "p1", name: "Project", cover: "/uploads/old.png" });
  editor.removeCover();
  await editor.save();
  assert.equal(editor.writes[0][0].cover, undefined);
});
