import { unstable_cache } from "next/cache";
import { db, parseJson, type DbRow } from "@/lib/db";

const PRIVATE_KEYS = new Set(["users", "leads", "activity", "ctaClicks", "pageViews"]);

export const getSiteState = unstable_cache(async () => {
  const [rows] = await db.query<DbRow[]>("SELECT payload FROM cms_states WHERE `key` = ? LIMIT 1", ["site"]);
  if (!rows[0]) throw new Error("Website content has not been initialized.");
  return parseJson<Record<string, unknown>>(rows[0].payload);
}, ["site-state-v2"], { tags: ["site-state"] });

export async function getPublicState() {
  const state = await getSiteState();
  return Object.fromEntries(Object.entries(state).filter(([key]) => !PRIVATE_KEYS.has(key)));
}
