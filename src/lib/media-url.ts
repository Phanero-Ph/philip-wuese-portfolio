const managedMediaPath = /^\/(?:storage\/media|uploads)\//i;

export function normalizeMediaUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (managedMediaPath.test(trimmed)) return trimmed;
  if (/^(?:storage\/media|uploads)\//i.test(trimmed)) return `/${trimmed}`;
  try {
    const parsed = new URL(trimmed);
    if (managedMediaPath.test(parsed.pathname)) return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch { /* A relative non-media URL should be left unchanged. */ }
  return trimmed;
}

export function normalizeStoredMediaUrls<T>(value: T): T {
  if (typeof value === "string") return normalizeMediaUrl(value) as T;
  if (Array.isArray(value)) return value.map(normalizeStoredMediaUrls) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, normalizeStoredMediaUrls(child)]),
    ) as T;
  }
  return value;
}
