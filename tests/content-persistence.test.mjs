import assert from "node:assert/strict";
import { test } from "node:test";
import { createContentPersistence } from "../src/content-persistence.ts";

test("hydration and dashboard polling do not write content", async () => {
  const writes = [];
  const persistence = createContentPersistence(async (sections) => writes.push(sections));
  const state = { projects: [{ id: "p1", name: "Original" }], hero: { title: "Hello" } };
  persistence.hydrate(state);
  await persistence.save({ ...state, analytics: {}, leads: [], pageViews: 2, ctaClicks: {}, users: [], activity: [] });
  assert.deepEqual(writes, []);
  const projects = [{ id: "p1", name: "Edited" }];
  await persistence.save({ ...state, projects });
  assert.deepEqual(writes, [{ projects }]);
});

test("save waits for acknowledgement and serializes overlapping writes", async () => {
  const writes = [];
  let acknowledge;
  const persistence = createContentPersistence(async (sections) => {
    writes.push(sections);
    if (writes.length === 1) await new Promise((resolve) => { acknowledge = resolve; });
  });
  const first = persistence.save({ projects: ["first"] });
  const second = persistence.save({ projects: ["second"] });
  let saved = false;
  void second.then(() => { saved = true; });
  await Promise.resolve();
  assert.equal(saved, false);
  assert.deepEqual(writes, [{ projects: ["first"] }]);
  acknowledge();
  await Promise.all([first, second]);
  assert.equal(saved, true);
  assert.deepEqual(writes, [{ projects: ["first"] }, { projects: ["second"] }]);
});

test("failed saves reject, permit a retry, and do not block later saves", async () => {
  let attempts = 0;
  const persistence = createContentPersistence(async () => {
    if (++attempts === 1) throw new Error("Session expired");
  });
  const projects = [{ id: "p1", name: "Edit" }];
  await assert.rejects(persistence.save({ projects }), /Session expired/);
  await persistence.save({ projects });
  assert.equal(attempts, 2);
  await persistence.save({ projects });
  assert.equal(attempts, 2);
});

test("a failed earlier write does not discard a newer queued edit", async () => {
  const writes = [];
  const persistence = createContentPersistence(async (sections) => {
    writes.push(sections);
    if (writes.length === 1) throw new Error("Network error");
  });
  const oldProjects = ["old"];
  const projects = ["new"];
  const first = persistence.save({ projects: oldProjects });
  const second = persistence.save({ projects });
  await assert.rejects(first, /Network error/);
  await second;
  await persistence.save({ projects });
  assert.deepEqual(writes, [{ projects: oldProjects }, { projects }]);
});
