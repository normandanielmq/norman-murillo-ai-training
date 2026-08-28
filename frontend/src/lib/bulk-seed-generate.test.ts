import { generateBulkEmployeeRows } from "@/lib/bulk-seed-generate";
import { validateEmployeeInput } from "@/lib/validators";

describe("generateBulkEmployeeRows", () => {
  it("returns empty array for non-positive count", () => {
    expect(generateBulkEmployeeRows(0)).toEqual([]);
    expect(generateBulkEmployeeRows(-5)).toEqual([]);
  });

  it("caps at 1000 rows", () => {
    expect(generateBulkEmployeeRows(5000)).toHaveLength(1000);
  });

  it("produces unique national IDs and passes employee validation", () => {
    const rows = generateBulkEmployeeRows(50);
    expect(rows).toHaveLength(50);
    const ids = new Set(rows.map((r) => r.nationalId));
    expect(ids.size).toBe(50);

    for (const row of rows) {
      const v = validateEmployeeInput(row, false);
      expect(v.valid).toBe(true);
      expect(v.errors).toEqual([]);
    }
  });

  it("uses distinct emails", () => {
    const rows = generateBulkEmployeeRows(20);
    const emails = new Set(rows.map((r) => r.email));
    expect(emails.size).toBe(20);
  });
});
