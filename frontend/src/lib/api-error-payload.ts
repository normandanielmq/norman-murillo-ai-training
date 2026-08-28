/**
 * Maps failed API JSON `{ error?, details? }` to a consistent shape (project conventions).
 */
export function parseApiErrorPayload(
  data: unknown,
  fallbackError: string
): { error: string; details: string[] } {
  const obj = data as { error?: string; details?: string[] };
  return {
    error: obj.error ?? fallbackError,
    details: obj.details ?? (obj.error ? [obj.error] : []),
  };
}
