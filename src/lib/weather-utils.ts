import type { WeatherCondition } from "@/lib/types";

// OpenWeatherMap weather condition codes
// https://openweathermap.org/weather-conditions
export function mapWeatherCodeToCondition(code: number): WeatherCondition {
  if (code >= 200 && code < 300) return "thunderstorm";
  if (code >= 300 && code < 600) return "rain"; // Drizzle (3xx) and Rain (5xx)
  if (code >= 800 && code < 801) return "clear";
  if (code >= 801) return "clouds";
  return "unknown";
}
