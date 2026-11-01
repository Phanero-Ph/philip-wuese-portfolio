import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

function handler({ failWrite = false, authenticated = true } = {}) {
  const events = [];
  const original = { projects: [{ id: "p1", name: "Before" }], hero: { title: "Keep this" } };
  let stored;
  const connection = {
    beginTransaction: async () => events.push("begin"),
    query: async () => [[{ payload: JSON.stringify(original) }]],
    execute: async (sql, values) => {
      if (sql.startsWith("UPDATE")) {
        if (failWrite) throw new Error("Database unavailable");
        stored = JSON.parse(values[0]);
      }
      events.push(sql.startsWith("INSERT") ? "revision" : "update");
    },
    commit: async () => events.push("commit"),
    rollback: async () => events.push("rollback"),
    release: () => events.push("release"),
  };
  const imports = {
    "next/server": { NextResponse: { json: Response.json } },
    "next/cache": { revalidateTag: (...args) => events.push(args) },
    "@/lib/db": { db: { getConnection: async () => connection }, parseJson: JSON.parse },
    "@/lib/session": { requireSession: async () => {
      if (!authenticated) throw new Error("Unauthenticated");
      return { id: 1 };
    } },
    "@/lib/http": { errorResponse: (error) => Response.json({ message: error.message }, { status: 500 }) },
    "@/lib/security": { assertRequestSize() {} },
  };
  const source = readFileSync(new URL("../src/app/api/state/sections/route.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const loaded = { exports: {} };
  new Function("require", "exports", outputText)((name) => {
    assert.ok(imports[name], `Unexpected import: ${name}`);
    return imports[name];
  }, loaded.exports);
  return { PUT: loaded.exports.PUT, events, getStored: () => stored };
}

const request = (sections) => new Request("https://portfolio.example/api/state/sections", {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sections }),
});

test("project changes persist atomically, preserve other content, and expire the public cache", async () => {
  const { PUT, events, getStored } = handler();
  const projects = [{ id: "p1", name: "After", slug: "after" }];
  const response = await PUT(request({ projects }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { saved: true, sections: ["projects"] });
  assert.deepEqual(getStored(), { projects, hero: { title: "Keep this" } });
  assert.deepEqual(events, ["begin", "revision", "update", "commit", ["site-state", { expire: 0 }], "release"]);
});

test("a database failure rolls back and never reports a successful save", async () => {
  const { PUT, events } = handler({ failWrite: true });
  const response = await PUT(request({ projects: [] }));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: "Database unavailable" });
  assert.deepEqual(events, ["begin", "revision", "rollback", "release"]);
});

test("unauthenticated edits never write content", async () => {
  const { PUT, events, getStored } = handler({ authenticated: false });
  const response = await PUT(request({ projects: [] }));
  assert.equal(response.status, 500);
  assert.equal(getStored(), undefined);
  assert.deepEqual(events, ["rollback", "release"]);
});
