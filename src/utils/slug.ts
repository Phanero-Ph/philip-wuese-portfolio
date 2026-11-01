/** Normalize a route slug, including invisible Unicode spacing characters. */
export function normalizeSlug(value: string): string {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // The value may already be decoded or contain a malformed percent sign.
  }

  return decoded
    .normalize("NFKC")
    .replace(/[\p{Cf}\p{Zs}\s]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
