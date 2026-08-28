import { mergePhoneWithCallingCode, stripLeadingCallingCodePrefix } from "@/lib/phone-calling-code";

describe("stripLeadingCallingCodePrefix", () => {
  it("removes leading +cc when followed by space", () => {
    expect(stripLeadingCallingCodePrefix("+1 555-000-0000")).toBe("555-000-0000");
    expect(stripLeadingCallingCodePrefix("+44 20 7946 0958")).toBe("20 7946 0958");
  });

  it("returns string unchanged when no +prefix+space pattern", () => {
    expect(stripLeadingCallingCodePrefix("555-1234")).toBe("555-1234");
    expect(stripLeadingCallingCodePrefix("+1555")).toBe("+1555");
  });
});

describe("mergePhoneWithCallingCode", () => {
  it("prepends code when phone empty", () => {
    expect(mergePhoneWithCallingCode("", "+44")).toBe("+44 ");
    expect(mergePhoneWithCallingCode("   ", "+1")).toBe("+1 ");
  });

  it("replaces prefix and keeps local part when switching country", () => {
    expect(mergePhoneWithCallingCode("+1 555-000-0000", "+44")).toBe("+44 555-000-0000");
  });

  it("prepends when number had no + prefix", () => {
    expect(mergePhoneWithCallingCode("555-1234", "+1")).toBe("+1 555-1234");
  });

  it("returns existing when callingCode empty", () => {
    expect(mergePhoneWithCallingCode("+1 555", "")).toBe("+1 555");
  });
});
