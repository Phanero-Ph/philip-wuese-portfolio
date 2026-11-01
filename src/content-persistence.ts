const privateKeys = new Set(["leads", "users", "activity", "ctaClicks", "pageViews", "analytics"]);

// Serialize writes and send only edited sections so delayed saves cannot replace
// unrelated content with an older snapshot.
export function createContentPersistence(send: (sections: Record<string, unknown>) => Promise<unknown>) {
  let baseline: Record<string, unknown> = {};
  let pending = Promise.resolve();
  let latest = pending;
  return {
    hydrate(state: Record<string, unknown>) { baseline = { ...state }; },
    save(state: Record<string, unknown>) {
      const sections = Object.fromEntries(Object.entries(state).filter(
        ([key, value]) => !privateKeys.has(key) && value !== baseline[key],
      ));
      if (!Object.keys(sections).length) return latest;
      Object.assign(baseline, sections);
      const result = pending.then(() => send(sections)).then(() => undefined);
      latest = result;
      pending = result.catch(() => {
        // Keep failed edits eligible for a retry, without discarding newer edits.
        for (const [key, value] of Object.entries(sections)) {
          if (baseline[key] === value) delete baseline[key];
        }
      });
      return result;
    },
  };
}
