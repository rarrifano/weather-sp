import type { WeatherCondition } from "@/lib/types";

export const VIBE_MAP: Record<WeatherCondition, string> = {
  rain: "Typical SP. Gray, wet, and miserable. Bring an umbrella or suffer.",
  clear: "Wait, is that the sun? In São Paulo? Go outside before it disappears in 5 minutes.",
  clouds: "The sky is a concrete slab. Very on-brand for the city.",
  thunderstorm: "Maximum chaos mode. Stay inside and pray for the power grid.",
  unknown: "Even the weather API doesn't know what's happening. Classic SP.",
};

export const BG_CLASS_MAP: Record<WeatherCondition, string> = {
  rain: "bg-rain",
  clear: "bg-clear",
  clouds: "bg-clouds",
  thunderstorm: "bg-thunderstorm",
  unknown: "bg-unknown",
};
