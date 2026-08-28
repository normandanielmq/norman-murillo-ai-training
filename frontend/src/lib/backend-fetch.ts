import { getBackendUrl } from "./backend-url";

const JSON_HEADERS = { "Content-Type": "application/json" };

/** Thrown when the FastAPI process is not listening (e.g. ECONNREFUSED). */
export class BackendUnavailableError extends Error {
  constructor(
    message = "Cannot reach the HR API backend.",
    options?: Readonly<{ cause?: unknown }>
  ) {
    super(message);
    this.name = "BackendUnavailableError";
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

async function readBackendErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text.slice(0, 200);
  } catch {
    return "";
  }
}

export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getBackendUrl()}${path}`;
  try {
    return await fetch(url, init);
  } catch (err) {
    throw new BackendUnavailableError(
      `Cannot connect to ${getBackendUrl()}. Start it with npm run dev:backend or npm run dev:all.`,
      { cause: err }
    );
  }
}

export async function backendGetJson<T>(path: string): Promise<T> {
  const res = await backendFetch(path);
  if (!res.ok) {
    throw new Error(`Backend GET ${path} failed: ${res.status} ${await readBackendErrorBody(res)}`);
  }
  return res.json() as Promise<T>;
}

/** GET where HTTP 404 maps to `null` (repository get-by-id parity). */
export async function backendGetJsonOrNull<T>(path: string): Promise<T | null> {
  const res = await backendFetch(path);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Backend GET ${path} failed: ${res.status} ${await readBackendErrorBody(res)}`);
  }
  return res.json() as Promise<T>;
}

export async function backendPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await backendFetch(path, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Backend POST ${path} failed: ${res.status} ${await readBackendErrorBody(res)}`);
  }
  return res.json() as Promise<T>;
}

export async function backendPatchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await backendFetch(path, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Backend PATCH ${path} failed: ${res.status} ${await readBackendErrorBody(res)}`);
  }
  return res.json() as Promise<T>;
}

/** PATCH where HTTP 404 means `null` (update when row missing). */
export async function backendPatchJsonOrNull<T>(path: string, body: unknown): Promise<T | null> {
  const res = await backendFetch(path, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Backend PATCH ${path} failed: ${res.status} ${await readBackendErrorBody(res)}`);
  }
  return res.json() as Promise<T>;
}

export async function backendDeleteStatus(path: string): Promise<boolean> {
  const res = await backendFetch(path, { method: "DELETE" });
  if (res.status === 204) return true;
  if (res.status === 404) return false;
  throw new Error(`Backend DELETE ${path} failed: ${res.status} ${await readBackendErrorBody(res)}`);
}
