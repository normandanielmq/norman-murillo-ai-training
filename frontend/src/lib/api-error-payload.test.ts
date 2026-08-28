import { parseApiErrorPayload } from "@/lib/api-error-payload";

describe("parseApiErrorPayload", () => {
  it("uses fallback when body is empty", () => {
    expect(parseApiErrorPayload({}, "Failed.")).toEqual({
      error: "Failed.",
      details: [],
    });
  });

  it("uses error and details from body", () => {
    expect(
      parseApiErrorPayload({ error: "Bad", details: ["a", "b"] }, "Fallback")
    ).toEqual({
      error: "Bad",
      details: ["a", "b"],
    });
  });

  it("uses error as single detail when details missing", () => {
    expect(parseApiErrorPayload({ error: "Only" }, "x")).toEqual({
      error: "Only",
      details: ["Only"],
    });
  });
});
