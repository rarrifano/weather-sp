import { RegenerateButton } from "@/components/regenerate-button";
import { WeatherIcon } from "@/components/weather-icon";
import type { WeatherData } from "@/lib/types";
import { BG_CLASS_MAP, VIBE_MAP } from "@/lib/vibe-map";
import { mapWeatherCodeToCondition } from "@/lib/weather-utils";

// Force dynamic rendering at runtime (not build time)
export const dynamic = "force-dynamic";

async function getWeather(): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return {
      condition: "unknown",
      vibe: "The weather gods are silent. Try again later.",
      temp: 0,
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=São Paulo,BR&appid=${apiKey}&units=metric`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const weatherCode = data.weather[0]?.id || 0;
    const condition = mapWeatherCodeToCondition(weatherCode);

    return {
      condition,
      vibe: VIBE_MAP[condition],
      temp: Math.round(data.main.temp),
    };
  } catch {
    return {
      condition: "unknown",
      vibe: "The weather gods are silent. Try again later.",
      temp: 0,
    };
  }
}

export default async function Home() {
  const weather = await getWeather();
  const bgClass = BG_CLASS_MAP[weather.condition];

  return (
    <main
      className={`grainy transition-bg relative flex min-h-screen flex-col items-center justify-center px-6 py-12 ${bgClass}`}
    >
      {/* Content layer - above the grain overlay */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-12 text-center">
        {/* Location badge */}
        <div className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium tracking-wide text-white/60 backdrop-blur-sm">
          SAO PAULO, BR
        </div>

        {/* Weather icon */}
        <WeatherIcon
          condition={weather.condition}
          className="h-24 w-24 text-white/80 sm:h-32 sm:w-32"
        />

        {/* The vibe - the star of the show */}
        <h1 className="font-sans text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {weather.vibe}
        </h1>

        {/* Temperature - subtle, secondary info */}
        {weather.temp !== 0 && (
          <p className="text-6xl font-extralight tracking-tighter text-white/40 sm:text-7xl md:text-8xl">
            {weather.temp}°
          </p>
        )}

        {/* Regenerate button */}
        <RegenerateButton />
      </div>
    </main>
  );
}
