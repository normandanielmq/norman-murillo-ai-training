/**
 * Shared GET + JSON handling for browser hooks (reduces duplicated fetch/error parsing).
 */

function parseErrorPayload(body: unknown): { error: string; details: string[] } {
  if (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string") {
    const err = (body as { error: string }).error;
    const raw = (body as { details?: unknown }).details;
    const details = Array.isArray(raw) ? raw.filter((d): d is string => typeof d === "string") : [];
    return { error: err, details };
  }
  return { error: "", details: [] };
}

export type FetchJsonResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; error: string; details: string[] };

/**
 * `fetch` + `res.json()` with consistent error shape from API bodies.
 */
export async function fetchJsonResult(url: string): Promise<FetchJsonResult> {
  try {
    const res = await fetch(url);
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      const { error, details } = parseErrorPayload(data);
      return {
        ok: false,
        status: res.status,
        error,
        details,
      };
    }
    return { ok: true, status: res.status, data };
  } catch {
    return { ok: false, status: 0, error: "Network error.", details: [] };
  }
}
