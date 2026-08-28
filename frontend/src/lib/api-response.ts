import { NextResponse } from "next/server";
import { BackendUnavailableError } from "@/lib/backend-fetch";

/** Map backend connection failures to a 503 JSON response; rethrow other errors. */
export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof BackendUnavailableError) {
    return NextResponse.json(
      {
        error: "HR API backend is not reachable.",
        details: [
          err.message,
          "Start the Python API (port 8000): npm run dev:backend — or run npm run dev:all.",
        ],
      },
      { status: 503 }
    );
  }
  throw err;
}

/**
 * Wrap a route handler so fetch failures to the FastAPI backend return 503 instead of 500.
 * Uses loose `any` args so Next.js App Router handler signatures stay assignable.
 */
export function withBackendRoute(
  handler: (...args: any[]) => Promise<Response | NextResponse>
): (...args: any[]) => Promise<Response | NextResponse> {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      return handleRouteError(err);
    }
  };
}

/** Parse numeric ID from route param; returns null if invalid. */
export function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

/** Parse JSON body from request; returns error response on failure. */
export async function parseJsonBody(
  request: Request
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    const body = await request.json();
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body.", details: [] },
        { status: 400 }
      ),
    };
  }
}

export function badRequest(error: string, details: string[]): NextResponse {
  return NextResponse.json({ error, details }, { status: 400 });
}

export function notFound(error: string, details: string[] = []): NextResponse {
  return NextResponse.json({ error, details }, { status: 404 });
}
