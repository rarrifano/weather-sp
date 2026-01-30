"use client";

import {
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

type WeatherCondition = "rain" | "clear" | "clouds" | "thunderstorm" | "unknown";

const ICON_MAP: Record<WeatherCondition, LucideIcon> = {
  rain: CloudRain,
  clear: Sun,
  clouds: Cloud,
  thunderstorm: CloudLightning,
  unknown: HelpCircle,
};

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

export function WeatherIcon({ condition, className = "" }: WeatherIconProps) {
  const Icon = ICON_MAP[condition] || HelpCircle;

  return <Icon className={className} strokeWidth={1.5} />;
}
