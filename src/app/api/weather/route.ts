import { NextResponse } from "next/server";

type WeatherCondition = "rain" | "clear" | "clouds" | "thunderstorm" | "unknown";

interface WeatherData {
  condition: WeatherCondition;
  vibe: string;
  temp: number;
  icon: string;
}

const VIBE_MAP: Record<WeatherCondition, string> = {
  rain: "Typical SP. Gray, wet, and miserable. Bring an umbrella or suffer.",
  clear:
    "Wait, is that the sun? In São Paulo? Go outside before it disappears in 5 minutes.",
  clouds: "The sky is a concrete slab. Very on-brand for the city.",
  thunderstorm:
    "Maximum chaos mode. Stay inside and pray for the power grid.",
  unknown: "Even the weather API doesn't know what's happening. Classic SP.",
};

function mapWeatherCodeToCondition(code: number): WeatherCondition {
  // OpenWeatherMap weather condition codes
  // https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) return "thunderstorm";
  if (code >= 300 && code < 600) return "rain"; // Drizzle (3xx) and Rain (5xx)
  if (code >= 800 && code < 801) return "clear";
  if (code >= 801) return "clouds";
  return "unknown";
}

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=São Paulo,BR&appid=${apiKey}&units=metric`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const weatherCode = data.weather[0]?.id || 0;
    const condition = mapWeatherCodeToCondition(weatherCode);

    const weatherData: WeatherData = {
      condition,
      vibe: VIBE_MAP[condition],
      temp: Math.round(data.main.temp),
      icon: data.weather[0]?.icon || "01d",
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Weather fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
