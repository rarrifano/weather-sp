import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

import { RegenerateButton } from "@/components/regenerate-button";

describe("RegenerateButton", () => {
  afterEach(() => {
    cleanup();
    mockRefresh.mockClear();
  });

  it("renders a button with default text", () => {
    render(<RegenerateButton />);
    expect(screen.getByRole("button", { name: /regenerate vibe/i })).toBeInTheDocument();
  });

  it("is not disabled by default", () => {
    render(<RegenerateButton />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("calls router.refresh when clicked", async () => {
    render(<RegenerateButton />);
    const button = screen.getByRole("button");

    await userEvent.click(button);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("contains a RefreshCw icon (SVG)", () => {
    const { container } = render(<RegenerateButton />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
