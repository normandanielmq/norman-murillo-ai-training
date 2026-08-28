/**
 * Maps REST Countries API (v3.1) JSON to sorted `{ name, callingCode }[]`.
 * Calling codes come from `idd.root` / `idd.suffixes` (see restcountries.com fields).
 */

export type CountryWithCallingCode = {
  name: string;
  /** E.g. "+1", "+44", "+49". Empty if missing in payload. */
  callingCode: string;
};

export type RestCountriesParseResult =
  | { ok: true; countries: CountryWithCallingCode[] }
  | { ok: false; error: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pickCommonName(entry: unknown): string | null {
  if (!isRecord(entry)) return null;
  const name = entry.name;
  if (!isRecord(name)) return null;
  const common = name.common;
  return typeof common === "string" && common.trim() ? common.trim() : null;
}

/**
 * Derive international dialing prefix from REST Countries `idd` object.
 * When there is a single suffix, it is combined with `root` (e.g. +4 + 4 → +44).
 * When there are multiple suffixes, `root` only (e.g. +1 with NANP area codes).
 */
export function callingCodeFromIdd(idd: unknown): string | null {
  if (!isRecord(idd)) return null;
  const root = idd.root;
  if (typeof root !== "string" || !root.startsWith("+")) return null;
  const r = root.trim();
  const suffixes = idd.suffixes;
  if (!Array.isArray(suffixes) || suffixes.length === 0) return r;
  if (suffixes.length === 1 && typeof suffixes[0] === "string") {
    return `${r}${suffixes[0]}`;
  }
  return r;
}

/**
 * Accepts the JSON array from `GET /v3.1/all?fields=name,idd` and returns sorted unique countries.
 */
export function normalizeRestCountriesPayload(data: unknown): RestCountriesParseResult {
  if (!Array.isArray(data)) {
    return { ok: false, error: "Invalid response: expected an array." };
  }
  const byName = new Map<string, CountryWithCallingCode>();

  for (const item of data) {
    const name = pickCommonName(item);
    if (!name) continue;
    const idd = isRecord(item) ? item.idd : undefined;
    const cc = callingCodeFromIdd(idd) ?? "";
    if (!byName.has(name)) {
      byName.set(name, { name, callingCode: cc });
    }
  }

  if (byName.size === 0) {
    return { ok: false, error: "No country names in response." };
  }

  const countries = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  return { ok: true, countries };
}
