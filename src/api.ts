const csrf = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";

export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrf(),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : { message: (await response.text().catch(() => "")).trim() };
  if (!response.ok) {
    const errors = body?.errors as Record<string, string[]> | undefined;
    const message = body?.message || (errors ? Object.values(errors)[0]?.[0] : undefined) || `${options.method || "GET"} ${url} failed with HTTP ${response.status}.`;
    throw new Error(String(message));
  }
  return body as T;
}

export async function apiForm<T>(url: string, form: FormData): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf() },
    body: form,
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json().catch(() => ({})) : { message: (await response.text().catch(() => "")).trim() };
  if (!response.ok) throw new Error(body?.message || `Upload failed with HTTP ${response.status}.`);
  return body as T;
}
