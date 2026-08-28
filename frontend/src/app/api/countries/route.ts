import { NextResponse } from "next/server";
import { normalizeRestCountriesPayload } from "@/lib/rest-countries.adapter";

const REST_COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,idd";

export async function GET() {
  try {
    const res = await fetch(REST_COUNTRIES_URL, {
      next: { revalidate: 86_400 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Country list service unavailable.", details: [] as string[] },
        { status: 502 }
      );
    }
    const data: unknown = await res.json();
    const parsed = normalizeRestCountriesPayload(data);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error, details: [] as string[] },
        { status: 502 }
      );
    }
    return NextResponse.json({ countries: parsed.countries });
  } catch {
    return NextResponse.json(
      { error: "Failed to load countries.", details: [] as string[] },
      { status: 502 }
    );
  }
}
