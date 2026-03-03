# AGENTS.md — Coding Agent Instructions for weather-sp

## Project Overview

**SP Vibes** — A Next.js 16 (App Router) weather app for São Paulo using TypeScript, React 19,
Tailwind CSS 4, and the OpenWeatherMap API. Deployed as a standalone Docker container to
GitHub Container Registry. Licensed under GPL-2.0.

## Build / Lint / Test Commands

```bash
npm ci                          # Install deps (use npm, not yarn/pnpm)
npm run dev                     # Development server
npm run build                   # Production build
npm run start                   # Start production server
npm run lint                    # ESLint 9 (core-web-vitals + typescript)
npx tsc --noEmit                # Type check (strict mode)
docker compose up --build       # Docker build & run
```

### Testing

Uses **Vitest** + **React Testing Library** (`@testing-library/react`, `@testing-library/user-event`).
Test files live next to the source they test with a `.test.ts` / `.test.tsx` suffix.

```bash
npm test                                    # run all tests once
npm run test:watch                          # watch mode
npm run test:coverage                       # with coverage report
npx vitest run src/lib/weather-utils.test.ts          # single file
npx vitest run -t "maps code 800"                     # by test name
npx vitest run src/components/                        # by directory
```

#### Test conventions

- **Unit tests** for pure logic in `src/lib/` — no mocks needed.
- **API route tests** import the `GET` handler directly, mock `fetch` via `vi.stubGlobal`,
  and assert on `Response` status/body.
- **Component tests** use `render` / `screen` from RTL. Call `cleanup()` in `afterEach`
  for client components. Mock Next.js hooks (`next/navigation`) via `vi.mock`.
- Keep `describe` / `it` blocks focused. Use `vi.restoreAllMocks()` in `afterEach`.

### CI Pipeline (`.github/workflows/ci.yml`)

On push/PR to `main`: install → ESLint → `tsc --noEmit` → **Vitest** → `next build`.
Always ensure these four pass before committing.

## Code Style Guidelines

### Language & Runtime

- **TypeScript** with `strict: true`. **Node.js 22**. **ES2017** target, ESNext modules.

### Formatting

- **2-space indentation**, **double quotes**, **trailing commas**, **semicolons**.
- No Prettier — follow existing file style.

### Imports

1. **Framework/library imports first** (`next`, `react`, `lucide-react`).
2. **Local imports second**, using the `@/` path alias (mapped to `./src/*`).
3. **Type-only imports** use `import type { ... }` syntax.
4. Separate groups with a blank line.

```ts
import { NextResponse } from "next/server";
import type { Metadata, Viewport } from "next";

import { WeatherIcon } from "@/components/weather-icon";
```

### Naming Conventions

| Element                | Convention        | Example                          |
|------------------------|-------------------|----------------------------------|
| Files                  | kebab-case        | `weather-icon.tsx`               |
| Components             | PascalCase        | `WeatherIcon`, `RegenerateButton`|
| Functions / variables  | camelCase         | `getWeather`, `isPending`        |
| Types / Interfaces     | PascalCase        | `WeatherData`, `WeatherCondition`|
| Constant lookup maps   | SCREAMING_SNAKE   | `VIBE_MAP`, `BG_CLASS_MAP`      |
| CSS classes (custom)   | kebab-case        | `bg-rain`, `transition-bg`      |

### Types

- Use `interface` (preferred) or `type` for all data shapes.
- Union literal types for constrained strings: `type WeatherCondition = "rain" | "clear" | ...`.
- `Record<K, V>` for key-value mappings. Explicit return types on async functions.
- `Readonly<{}>` for layout component props destructuring.

### Components

- **Server Components** (default): async functions, `export default async function`.
- **Client Components**: `"use client"` directive at the top of the file.
- **Named exports** for reusable components; **default exports** only for page components.
- Props defined via an `interface` in the same file.

### Error Handling

- `try/catch` with **graceful fallback values** — never let errors crash the page.
- Server components: return a safe default object on failure.
- API routes: return proper HTTP status codes via `NextResponse.json()`.
- Bare `catch` when the error is not logged; `catch (error)` only when using `console.error`.

```ts
// Server component — graceful fallback
try {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return processData(await response.json());
} catch {
  return { condition: "unknown", vibe: "Fallback message", temp: 0 };
}

// API route — structured error response
try {
  // ...
} catch (error) {
  console.error("Descriptive context:", error);
  return NextResponse.json({ error: "User-facing message" }, { status: 500 });
}
```

### CSS & Styling

- **Tailwind CSS 4** utility classes inline on JSX elements.
- Custom CSS only in `src/app/globals.css` (grainy textures, dynamic gradients).
- Uses Tailwind v4 `@theme inline` syntax for custom CSS properties.
- Responsive design via breakpoint prefixes (`sm:`, `md:`, `lg:`).

### Comments

- **No JSDoc.** Keep code self-documenting.
- Inline comments sparingly to explain "why", not "what".
- Link to external references when relevant (e.g., OpenWeatherMap docs).

## Project Structure

```
src/
├── app/
│   ├── api/weather/route.ts    # API route (OpenWeatherMap proxy)
│   ├── globals.css             # Global styles, gradients, grain overlay
│   ├── layout.tsx              # Root layout (fonts, metadata, viewport)
│   └── page.tsx                # Main page (Server Component, data fetching)
└── components/
    ├── regenerate-button.tsx   # Client Component — refresh button with transitions
    └── weather-icon.tsx        # Client Component — maps condition to Lucide icon
```

- Pages in `src/app/` following App Router conventions.
- API routes use `route.ts` handler pattern (`export async function GET()`).
- Shared components in `src/components/` with kebab-case filenames.
- Path alias `@/` maps to `src/` — always use it instead of relative paths.

## Environment & Infrastructure

- **`OPENWEATHER_API_KEY`** (required) — never commit `.env*` files (gitignored).
  Copy `.env.example` to `.env.local` for development.
- **Docker**: Multi-stage build (Node.js 22 Alpine), `output: "standalone"`, non-root user.
  Published to `ghcr.io/rarrifano/weather-sp` on GitHub Release.

## Key Dependencies

`next` 16.1.6 (App Router/RSC) · `react` 19 (with React Compiler via `babel-plugin-react-compiler`) ·
`lucide-react` (icons) · `tailwindcss` 4 (via PostCSS) · `eslint-config-next` · `typescript` 5.
