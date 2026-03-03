export type WeatherCondition = "rain" | "clear" | "clouds" | "thunderstorm" | "unknown";

export interface WeatherData {
  condition: WeatherCondition;
  vibe: string;
  temp: number;
}

export interface WeatherApiData extends WeatherData {
  icon: string;
}
