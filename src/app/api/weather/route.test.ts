import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/weather/route";

// Helper to build a mock OWM API response
function mockOwmResponse(weatherId: number, temp: number, icon = "10d") {
  return {
    weather: [{ id: weatherId, icon }],
    main: { temp },
  };
}

describe("GET /api/weather", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, OPENWEATHER_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns 500 when API key is not configured", async () => {
    delete process.env.OPENWEATHER_API_KEY;

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("API key not configured");
  });

  it("returns weather data for a rain condition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOwmResponse(500, 18.7, "10d")),
      }),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      condition: "rain",
      vibe: "Typical SP. Gray, wet, and miserable. Bring an umbrella or suffer.",
      temp: 19,
      icon: "10d",
    });
  });

  it("returns weather data for a clear condition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOwmResponse(800, 32.2, "01d")),
      }),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.condition).toBe("clear");
    expect(body.temp).toBe(32);
    expect(body.icon).toBe("01d");
  });

  it("returns weather data for a thunderstorm condition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOwmResponse(211, 15.3, "11d")),
      }),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.condition).toBe("thunderstorm");
    expect(body.temp).toBe(15);
  });

  it("rounds temperature correctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOwmResponse(800, 22.5)),
      }),
    );

    const response = await GET();
    const body = await response.json();

    expect(body.temp).toBe(23); // Math.round(22.5) = 23
  });

  it("falls back to icon 01d when icon is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            weather: [{ id: 800 }],
            main: { temp: 25 },
          }),
      }),
    );

    const response = await GET();
    const body = await response.json();

    expect(body.icon).toBe("01d");
  });

  it("returns 500 when the upstream API returns a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch weather data");
  });

  it("returns 500 when fetch throws a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure")),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch weather data");
  });

  it("calls the OpenWeatherMap API with the correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOwmResponse(800, 25)),
    });
    vi.stubGlobal("fetch", mockFetch);

    await GET();

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("api.openweathermap.org");
    expect(url).toContain("appid=test-key");
    expect(url).toContain("units=metric");
  });
});
