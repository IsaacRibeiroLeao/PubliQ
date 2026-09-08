import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppNavigation } from "@/components/AppNavigation";
import { Badge } from "@/components/Badge";
import { ContextHeader } from "@/components/ContextHeader";
import { Input } from "@/components/Input";
import { Progress } from "@/components/Progress";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";

const navigationState = vi.hoisted(() => ({ pathname: "/app" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

describe("design system behavior", () => {
  it("marks the nested route section from the current pathname", () => {
    navigationState.pathname = "/app/marcas/nova";
    render(<AppNavigation />);

    const dashboard = screen.getByRole("link", { name: "Visão geral" });
    const brands = screen.getByRole("link", { name: "Marcas" });

    expect(dashboard).not.toHaveAttribute("aria-current");
    expect(brands).toHaveAttribute("aria-current", "page");
  });

  it.each([
    ["Em análise", "info"],
    ["Aguardando aprovação", "warning"],
    ["Publicado", "success"],
    ["Falhou", "critical"],
  ] as const)("maps %s to the %s semantic tone", (status, tone) => {
    render(<Badge status={status} />);
    expect(screen.getByText(status)).toHaveAttribute("data-tone", tone);
  });

  it("clamps quota progress and exposes its accessible value", () => {
    render(<Progress value={137} label="Cota mensal" />);
    const progress = screen.getByRole("progressbar", { name: "Cota mensal" });

    expect(progress).toHaveAttribute("aria-valuenow", "100");
    expect(progress.firstElementChild).toHaveStyle({ width: "100%" });
  });

  it("associates input help and error text with the field", () => {
    render(
      <Input
        label="E-mail"
        name="email"
        type="email"
        hint="Use seu e-mail de trabalho."
        error="Informe um e-mail válido."
      />,
    );

    const input = screen.getByRole("textbox", { name: "E-mail" });
    expect(input).toHaveAccessibleDescription(
      "Use seu e-mail de trabalho. Informe um e-mail válido.",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("associates labels when form controls have no id or name", () => {
    render(
      <>
        <Input label="E-mail alternativo" />
        <Textarea label="Resumo" />
        <Select
          label="Canal"
          options={[{ label: "Feed", value: "feed" }]}
        />
      </>,
    );

    expect(screen.getByLabelText("E-mail alternativo")).toHaveAttribute("id");
    expect(screen.getByLabelText("Resumo")).toHaveAttribute("id");
    expect(screen.getByLabelText("Canal")).toHaveAttribute("id");
  });

  it("renders the explicit header context", () => {
    render(
      <ContextHeader
        contextLabel="Estúdio Norte"
        title="Criativos"
        userName="Isaac Demo"
      />,
    );

    expect(screen.getByText("Estúdio Norte")).toBeInTheDocument();
    expect(screen.queryByText("Café Aurora")).not.toBeInTheDocument();
  });
});
