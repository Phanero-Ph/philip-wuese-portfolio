import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/app/uploads/[...path]/route.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
function handler(readFile) {
  const loaded = {};
  const imports = { "node:fs/promises": { readFile }, "node:path": path, "@/lib/http": { errorResponse: () => new Response(null, { status: 500 }) } };
  new Function("require", "exports", outputText)((name) => imports[name], loaded);
  return (segments) => loaded.GET(new Request("https://example.com/uploads/image"), { params: Promise.resolve({ path: segments }) });
}

test("new uploads can be read at runtime with the correct content type", async () => {
  const filename = `${"a".repeat(36)}.png`;
  const get = handler(async (file) => {
    assert.equal(file, path.join(process.cwd(), "public", "uploads", "2026", "11", filename));
    return Buffer.from("image content");
  });
  const response = await get(["2026", "11", filename]);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.equal(await response.text(), "image content");
});

test("invalid upload paths cannot read files outside the upload directory", async () => {
  const get = handler(async () => assert.fail("Invalid paths must not reach the filesystem"));
  for (const segments of [["..", "..", ".env.local"], ["2026", "11", "../secret.png"], ["2026", "11", "file.svg"], ["2026", "13", `${"a".repeat(36)}.png`]]) {
    assert.equal((await get(segments)).status, 404);
  }
});

test("missing upload files return 404", async () => {
  const get = handler(async () => { throw Object.assign(new Error("Missing"), { code: "ENOENT" }); });
  assert.equal((await get(["2026", "11", `${"b".repeat(36)}.jpg`])).status, 404);
});
