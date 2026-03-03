import { describe, expect, it } from "vitest";

import { mapWeatherCodeToCondition } from "@/lib/weather-utils";

describe("mapWeatherCodeToCondition", () => {
  describe("thunderstorm codes (200-299)", () => {
    it("maps code 200 (thunderstorm with light rain) to thunderstorm", () => {
      expect(mapWeatherCodeToCondition(200)).toBe("thunderstorm");
    });

    it("maps code 211 (thunderstorm) to thunderstorm", () => {
      expect(mapWeatherCodeToCondition(211)).toBe("thunderstorm");
    });

    it("maps code 299 (upper boundary) to thunderstorm", () => {
      expect(mapWeatherCodeToCondition(299)).toBe("thunderstorm");
    });
  });

  describe("rain codes (300-599)", () => {
    it("maps code 300 (light drizzle) to rain", () => {
      expect(mapWeatherCodeToCondition(300)).toBe("rain");
    });

    it("maps code 500 (light rain) to rain", () => {
      expect(mapWeatherCodeToCondition(500)).toBe("rain");
    });

    it("maps code 502 (heavy rain) to rain", () => {
      expect(mapWeatherCodeToCondition(502)).toBe("rain");
    });

    it("maps code 599 (upper boundary) to rain", () => {
      expect(mapWeatherCodeToCondition(599)).toBe("rain");
    });
  });

  describe("clear code (800)", () => {
    it("maps code 800 (clear sky) to clear", () => {
      expect(mapWeatherCodeToCondition(800)).toBe("clear");
    });
  });

  describe("clouds codes (801+)", () => {
    it("maps code 801 (few clouds) to clouds", () => {
      expect(mapWeatherCodeToCondition(801)).toBe("clouds");
    });

    it("maps code 802 (scattered clouds) to clouds", () => {
      expect(mapWeatherCodeToCondition(802)).toBe("clouds");
    });

    it("maps code 804 (overcast) to clouds", () => {
      expect(mapWeatherCodeToCondition(804)).toBe("clouds");
    });
  });

  describe("unknown codes", () => {
    it("maps code 0 to unknown", () => {
      expect(mapWeatherCodeToCondition(0)).toBe("unknown");
    });

    it("maps code 100 (not a real OWM code) to unknown", () => {
      expect(mapWeatherCodeToCondition(100)).toBe("unknown");
    });

    it("maps code 600 (snow) to unknown", () => {
      expect(mapWeatherCodeToCondition(600)).toBe("unknown");
    });

    it("maps code 700 (atmosphere) to unknown", () => {
      expect(mapWeatherCodeToCondition(700)).toBe("unknown");
    });

    it("maps code 781 (tornado) to unknown", () => {
      expect(mapWeatherCodeToCondition(781)).toBe("unknown");
    });

    it("maps negative code to unknown", () => {
      expect(mapWeatherCodeToCondition(-1)).toBe("unknown");
    });
  });
});
