import { getInitialsFromName } from "@/lib/format-name";

describe("getInitialsFromName", () => {
  it("returns up to two letters from first tokens", () => {
    expect(getInitialsFromName("Jane Doe")).toBe("JD");
    expect(getInitialsFromName("John Smith")).toBe("JS");
  });

  it("handles extra whitespace", () => {
    expect(getInitialsFromName("  Alice   Smith  ")).toBe("AS");
  });

  it("returns empty for empty string", () => {
    expect(getInitialsFromName("")).toBe("");
  });

  it("respects maxLen", () => {
    expect(getInitialsFromName("A B C D", 3)).toBe("ABC");
  });
});
