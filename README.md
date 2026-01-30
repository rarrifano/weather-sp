# SP Vibes

The brutally honest weather app for São Paulo. No fluff, just vibes.

## What is this?

Instead of showing you boring weather data like "Cloudy, 18°C", this app tells you what São Paulo weather actually *feels* like:

| Weather | Vibe |
|---------|------|
| Rain | "Typical SP. Gray, wet, and miserable. Bring an umbrella or suffer." |
| Clear | "Wait, is that the sun? In São Paulo? Go outside before it disappears in 5 minutes." |
| Clouds | "The sky is a concrete slab. Very on-brand for the city." |
| Thunderstorm | "Maximum chaos mode. Stay inside and pray for the power grid." |

## Features

- **Zero clutter** — One giant text block, one icon, one button
- **Dynamic backgrounds** — Grainy gradients that match the weather mood
- **Mobile-first** — Looks like a high-end app on your phone
- **Server Components** — Fast initial load with Next.js 14+

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- Lucide React (icons)
- OpenWeatherMap API

## Getting Started

1. Clone the repo

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your OpenWeatherMap API key:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your key
   ```

   Get a free API key at [openweathermap.org](https://openweathermap.org/api)

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/weather/route.ts   # OpenWeatherMap API handler
│   ├── globals.css            # Grainy gradients + dynamic backgrounds
│   ├── layout.tsx             # Root layout with Geist font
│   └── page.tsx               # Main page (Server Component)
└── components/
    ├── regenerate-button.tsx  # Refresh button (Client Component)
    └── weather-icon.tsx       # Weather icons (Client Component)
```

## Docker

### Pull from GitHub Container Registry

```bash
docker pull ghcr.io/rarrifano/weather-sp:latest
```

### Run with environment variable

```bash
docker run -p 3000:3000 -e OPENWEATHER_API_KEY=your_key_here ghcr.io/rarrifano/weather-sp:latest
```

### Run with env file

```bash
# Create .env.local with your API key
echo "OPENWEATHER_API_KEY=your_key_here" > .env.local

docker run -p 3000:3000 --env-file .env.local ghcr.io/rarrifano/weather-sp:latest
```

### Docker Compose

```bash
# Make sure .env.local exists with OPENWEATHER_API_KEY
docker compose up --build
```

Or use the pre-built image:

```yaml
# docker-compose.yml
services:
  app:
    image: ghcr.io/rarrifano/weather-sp:latest
    ports:
      - "3000:3000"
    env_file:
      - .env.local
```

## License

GPL-2.0
