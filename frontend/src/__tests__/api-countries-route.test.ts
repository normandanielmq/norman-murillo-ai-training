/**
 * @jest-environment node
 */
import { GET } from "@/app/api/countries/route";

describe("GET /api/countries", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns sorted countries with calling codes when upstream JSON is valid", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { name: { common: "Zland" }, idd: { root: "+9", suffixes: ["9"] } },
          { name: { common: "Aland" }, idd: { root: "+3", suffixes: ["5"] } },
        ]),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      countries: { name: string; callingCode: string }[];
    };
    expect(body.countries).toEqual([
      { name: "Aland", callingCode: "+35" },
      { name: "Zland", callingCode: "+99" },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://restcountries.com/v3.1/all?fields=name,idd",
      expect.objectContaining({
        headers: { Accept: "application/json" },
      })
    );
  });

  it("returns 502 when upstream response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    const res = await GET();
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Country list service unavailable.");
  });

  it("returns 502 when adapter rejects the payload", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ notAnArray: true }),
    });

    const res = await GET();
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("array");
  });

  it("returns 502 when fetch throws", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network"));

    const res = await GET();
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Failed to load countries.");
  });
});
