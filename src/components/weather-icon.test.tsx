import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WeatherIcon } from "@/components/weather-icon";

describe("WeatherIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<WeatherIcon condition="clear" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies the provided className", () => {
    const { container } = render(
      <WeatherIcon condition="rain" className="h-24 w-24 text-white" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-24", "w-24", "text-white");
  });

  it("renders without crashing for every condition", () => {
    const conditions = ["rain", "clear", "clouds", "thunderstorm", "unknown"] as const;

    for (const condition of conditions) {
      const { container } = render(<WeatherIcon condition={condition} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    }
  });

  it("uses strokeWidth of 1.5", () => {
    const { container } = render(<WeatherIcon condition="clear" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("stroke-width", "1.5");
  });

  it("defaults className to empty string", () => {
    // Should not throw when no className is provided
    expect(() => render(<WeatherIcon condition="clouds" />)).not.toThrow();
  });
});
