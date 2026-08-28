/**
 * Safe JSON parse for fetch `Response` bodies (invalid JSON → empty object).
 */
export function parseJsonSafe(res: Response): Promise<unknown> {
  return res.json().catch(() => ({}));
}
