import { describe, expect, it } from "vitest";

import { BG_CLASS_MAP, VIBE_MAP } from "@/lib/vibe-map";

const ALL_CONDITIONS = ["rain", "clear", "clouds", "thunderstorm", "unknown"] as const;

describe("VIBE_MAP", () => {
  it("has an entry for every weather condition", () => {
    for (const condition of ALL_CONDITIONS) {
      expect(VIBE_MAP[condition]).toBeDefined();
      expect(typeof VIBE_MAP[condition]).toBe("string");
      expect(VIBE_MAP[condition].length).toBeGreaterThan(0);
    }
  });

  it("returns distinct vibes for each condition", () => {
    const vibes = ALL_CONDITIONS.map((c) => VIBE_MAP[c]);
    expect(new Set(vibes).size).toBe(ALL_CONDITIONS.length);
  });
});

describe("BG_CLASS_MAP", () => {
  it("has a CSS class for every weather condition", () => {
    for (const condition of ALL_CONDITIONS) {
      expect(BG_CLASS_MAP[condition]).toBeDefined();
      expect(BG_CLASS_MAP[condition]).toMatch(/^bg-/);
    }
  });

  it("maps each condition to bg-{condition}", () => {
    for (const condition of ALL_CONDITIONS) {
      expect(BG_CLASS_MAP[condition]).toBe(`bg-${condition}`);
    }
  });
});
