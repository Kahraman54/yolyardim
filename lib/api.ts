async function apiFetch(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "İstek başarısız");
  return json;
}

export const apiPost = (table: string, data: Record<string, unknown>) =>
  apiFetch(`/api/${table}`, "POST", data);

export const apiPatch = (table: string, id: string, updates: Record<string, unknown>) =>
  apiFetch(`/api/${table}`, "PATCH", { id, ...updates });

export const apiDelete = (table: string, id: string) =>
  apiFetch(`/api/${table}?id=${id}`, "DELETE");
