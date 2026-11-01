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

function form(project, { failSave = false } = {}) {
  const hooks = [];
  const writes = [];
  let closed = false;
  const imports = {
    "react/jsx-runtime": jsxRuntime,
    react: { useState(initial) {
      const slot = { value: typeof initial === "function" ? initial() : initial };
      hooks.push(slot);
      return [slot.value, (value) => { slot.value = value; }];
    } },
    "@/utils/cn": { cn: (...values) => values.filter(Boolean).join(" ") },
    "@/store": { useStore: () => ({ state: { projects: [project] }, saveProjects: async (projects) => {
      if (failSave) throw new Error("Database unavailable");
      writes.push(projects);
    } }) },
    "@/router": {}, "@/data/site": {}, "@/data/adminUsers": {}, "@/components/ui": {}, "@/api": {},
  };
  const loaded = {};
  new Function("require", "exports", compiled)((name) => {
    assert.ok(imports[name], `Unexpected import: ${name}`);
    return imports[name];
  }, loaded);
  const dialog = loaded.ProjectForm({ editing: { index: 0 }, onClose: () => { closed = true; } });
  const saveButton = dialog.props.footer.props.children.find((child) => child?.props?.children === "Save changes");
  return { save: saveButton.props.onClick, writes, error: () => hooks[1].value, saving: () => hooks[2].value, closed: () => closed };
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
