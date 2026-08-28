/**
 * Initials from a display name (e.g. table avatars). Splits on whitespace; empty-safe.
 */
export function getInitialsFromName(name: string, maxLen = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, maxLen);
}
