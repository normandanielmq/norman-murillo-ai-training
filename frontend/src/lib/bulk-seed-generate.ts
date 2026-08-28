import type { SeedEmployee } from "@/lib/seed-employees";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Spain",
  "Japan",
  "Nigeria",
] as const;

const GENDERS = ["Male", "Female", "Other"] as const;

const TITLES = [
  "Software Engineer",
  "Product Manager",
  "UX Designer",
  "Backend Engineer",
  "HR Operations Manager",
  "Frontend Lead",
  "Principal Designer",
  "Senior Systems Architect",
] as const;

const MAX_BULK = 1000;

/**
 * Deterministic extra employees for local/demo load testing. Satisfies schema and validator rules
 * (unique nationalId per row, phone with + prefix, ISO dates, hire after DOB).
 */
export function generateBulkEmployeeRows(count: number): SeedEmployee[] {
  const n = Math.min(Math.max(0, Math.floor(count)), MAX_BULK);
  const out: SeedEmployee[] = [];
  for (let i = 1; i <= n; i++) {
    const country = COUNTRIES[(i - 1) % COUNTRIES.length];
    const dob = isoDateFromDayIndex(3650 + i);
    const hire = isoDateFromDayIndex(8000 + i * 2);
    out.push({
      name: `Bulk Employee ${i}`,
      email: `bulk.employee.${i}@example.test`,
      nationalId: `BULK-${String(i).padStart(8, "0")}`,
      phone: `+1 555-${String(200 + (i % 700)).padStart(3, "0")}-${String(10000 + i).slice(-4)}`,
      country,
      gender: GENDERS[(i - 1) % GENDERS.length],
      dateOfBirth: dob,
      officialTitle: TITLES[(i - 1) % TITLES.length],
      hireDate: hire,
    });
  }
  return out;
}

/** YYYY-MM-DD from days since 1970-01-01 (approx), stable for tests. */
function isoDateFromDayIndex(dayIndex: number): string {
  const d = new Date(Date.UTC(1970, 0, 1 + dayIndex));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
