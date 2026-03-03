import { NextResponse } from "next/server";

import type { WeatherApiData } from "@/lib/types";
import { VIBE_MAP } from "@/lib/vibe-map";
import { mapWeatherCodeToCondition } from "@/lib/weather-utils";

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

    const weatherData: WeatherApiData = {
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
      { status: 500 },
    );
  }
}
