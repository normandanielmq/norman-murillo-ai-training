import { renderHook, waitFor, act } from "@testing-library/react";
import { useCountries } from "@/hooks/useCountries";

const sampleCountries = [
  { name: "France", callingCode: "+33" },
  { name: "Germany", callingCode: "+49" },
];

describe("useCountries", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("loads countries on mount when API succeeds", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ countries: sampleCountries }),
    });

    const { result } = renderHook(() => useCountries());

    expect(result.current.loading).toBe(true);
    expect(result.current.countries).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.countries).toEqual(sampleCountries);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith("/api/countries");
  });

  it("sets error and clears countries when API returns not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Country list service unavailable." }),
    });

    const { result } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.countries).toEqual([]);
    expect(result.current.error).toBe("Country list service unavailable.");
  });

  it("sets generic error when JSON has no error field on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Could not load countries.");
  });

  it("reload refetches from the API", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ countries: [{ name: "One", callingCode: "+1" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            countries: [
              { name: "Two", callingCode: "+2" },
              { name: "Three", callingCode: "+3" },
            ],
          }),
      });

    const { result } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.countries).toEqual([{ name: "One", callingCode: "+1" }]);
    });

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.countries).toEqual([
        { name: "Two", callingCode: "+2" },
        { name: "Three", callingCode: "+3" },
      ]);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
