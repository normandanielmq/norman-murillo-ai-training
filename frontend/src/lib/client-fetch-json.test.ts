import { fetchJsonResult } from "./client-fetch-json";

describe("fetchJsonResult", () => {
  it("returns ok with parsed data on 200", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hello: "world" }),
    });

    const r = await fetchJsonResult("/api/x");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ hello: "world" });
  });

  it("returns error and details on non-ok with API body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Bad", details: ["a"] }),
    });

    const r = await fetchJsonResult("/api/x");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe("Bad");
      expect(r.details).toEqual(["a"]);
    }
  });
});
