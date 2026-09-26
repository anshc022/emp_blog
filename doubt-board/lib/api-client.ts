/** Tiny fetch wrapper for the browser: JSON in/out, throws Error(message) on `{ error }`. */
export async function api<T>(path: string, init?: Omit<RequestInit, "body"> & { body?: unknown }): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.body !== undefined && { "Content-Type": "application/json" }), ...init?.headers },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || `Request failed (${res.status})`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return data as T;
}
