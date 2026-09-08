import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

vi.mock("@/modules/auth/actions", () => ({
  login: vi.fn(),
}));

describe("LoginPage", () => {
  it("propagates a safe onboarding return path to the form", async () => {
    const page = await LoginPage({
      searchParams: Promise.resolve({ redirectTo: "/onboarding" }),
    });

    render(page);

    expect(screen.getByDisplayValue("/onboarding")).toHaveAttribute(
      "name",
      "redirectTo",
    );
  });

  it("replaces an external return URL with the application fallback", async () => {
    const page = await LoginPage({
      searchParams: Promise.resolve({
        redirectTo: "https://attacker.example/steal",
      }),
    });

    render(page);

    expect(screen.getByDisplayValue("/app")).toHaveAttribute(
      "name",
      "redirectTo",
    );
  });
});
