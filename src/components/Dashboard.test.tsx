import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dashboard } from "@/components/Dashboard";
import { DEMO_BRAND, DEMO_USER } from "@/shared/demo-fixtures";

describe("Dashboard", () => {
  it("shows the four-stage publication pipeline with demo data", () => {
    render(<Dashboard user={DEMO_USER} brand={DEMO_BRAND} />);

    expect(
      screen.getByRole("heading", { name: `Olá, ${DEMO_USER.name.split(" ")[0]}` }),
    ).toBeInTheDocument();
    expect(screen.getByText(DEMO_BRAND.name)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem", { name: /etapa/i })).toHaveLength(4);
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Análise")).toBeInTheDocument();
    expect(screen.getByText("Aprovação")).toBeInTheDocument();
    expect(screen.getByText("Publicação")).toBeInTheDocument();
  });

  it("reports monthly quota usage as a percentage", () => {
    render(<Dashboard user={DEMO_USER} brand={DEMO_BRAND} />);

    expect(
      screen.getByRole("progressbar", { name: "Uso da cota mensal" }),
    ).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getByText("34 de 50 publicações")).toBeInTheDocument();
  });
});
