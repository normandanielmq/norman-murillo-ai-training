/** Base URL for the FastAPI SQLite backend (no trailing slash). */
export function getBackendUrl(): string {
  const raw = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}
