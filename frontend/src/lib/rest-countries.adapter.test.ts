import {
  callingCodeFromIdd,
  normalizeRestCountriesPayload,
} from "@/lib/rest-countries.adapter";

describe("callingCodeFromIdd", () => {
  it("combines root and single suffix", () => {
    expect(callingCodeFromIdd({ root: "+4", suffixes: ["4"] })).toBe("+44");
    expect(callingCodeFromIdd({ root: "+4", suffixes: ["9"] })).toBe("+49");
  });

  it("uses root only when multiple suffixes (e.g. NANP)", () => {
    expect(callingCodeFromIdd({ root: "+1", suffixes: ["201", "202", "212"] })).toBe("+1");
  });

  it("uses root when suffixes empty", () => {
    expect(callingCodeFromIdd({ root: "+358", suffixes: [] })).toBe("+358");
  });

  it("returns null when idd invalid", () => {
    expect(callingCodeFromIdd(null)).toBeNull();
    expect(callingCodeFromIdd({})).toBeNull();
  });
});

describe("normalizeRestCountriesPayload", () => {
  it("returns sorted countries with calling codes", () => {
    const result = normalizeRestCountriesPayload([
      { name: { common: "United States" }, idd: { root: "+1", suffixes: ["201", "202"] } },
      { name: { common: "Canada" }, idd: { root: "+1", suffixes: ["204", "226"] } },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.countries).toEqual([
      { name: "Canada", callingCode: "+1" },
      { name: "United States", callingCode: "+1" },
    ]);
  });

  it("dedupes by country name", () => {
    const result = normalizeRestCountriesPayload([
      { name: { common: "France" }, idd: { root: "+3", suffixes: ["3"] } },
      { name: { common: "France" }, idd: { root: "+3", suffixes: ["3"] } },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.countries).toHaveLength(1);
    expect(result.countries[0].name).toBe("France");
  });

  it("uses empty callingCode when idd missing", () => {
    const result = normalizeRestCountriesPayload([{ name: { common: "Nowhere" } }]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.countries[0]).toEqual({ name: "Nowhere", callingCode: "" });
  });

  it("rejects non-array payloads", () => {
    const result = normalizeRestCountriesPayload({});
    expect(result.ok).toBe(false);
  });
});
