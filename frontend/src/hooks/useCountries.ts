"use client";

import { useCallback, useEffect, useState } from "react";
import type { CountryWithCallingCode } from "@/lib/rest-countries.adapter";
import { fetchJsonResult } from "@/lib/client-fetch-json";

export type UseCountriesState = {
  countries: CountryWithCallingCode[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function parseCountriesBody(data: unknown): CountryWithCallingCode[] {
  const obj = data as { countries?: unknown };
  if (!Array.isArray(obj.countries)) return [];
  const out: CountryWithCallingCode[] = [];
  for (const row of obj.countries) {
    if (row && typeof row === "object" && "name" in row && typeof (row as { name: unknown }).name === "string") {
      const r = row as { name: string; callingCode?: unknown };
      out.push({
        name: r.name,
        callingCode: typeof r.callingCode === "string" ? r.callingCode : "",
      });
    }
  }
  return out;
}

/**
 * Loads `{ name, callingCode }[]` from `GET /api/countries` (REST Countries via server route).
 * On failure, `error` is set and `countries` is empty — callers should fall back to manual entry.
 */
export function useCountries(): UseCountriesState {
  const [countries, setCountries] = useState<CountryWithCallingCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchJsonResult("/api/countries");
    if (!result.ok) {
      setCountries([]);
      setError(
        result.status === 0
          ? "Could not load countries."
          : result.error || "Could not load countries."
      );
      setLoading(false);
      return;
    }
    setCountries(parseCountriesBody(result.data));
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { countries, loading, error, reload: load };
}
