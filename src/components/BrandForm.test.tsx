import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  BrandForm,
  type BrandFormAction,
} from "@/components/BrandForm";

describe("BrandForm", () => {
  it("submits the complete brand voice profile through its action", async () => {
    const action = vi.fn<BrandFormAction>(async () => ({
      status: "success" as const,
    }));
    render(<BrandForm action={action} submitLabel="Criar marca" />);

    fireEvent.change(screen.getByLabelText("Nome da marca"), {
      target: { value: "Café Horizonte" },
    });
    fireEvent.change(screen.getByLabelText("Nicho"), {
      target: { value: "Cafeteria" },
    });
    fireEvent.change(screen.getByLabelText("Proposta de valor"), {
      target: { value: "Café rastreável entregue sem complicação." },
    });
    fireEvent.change(screen.getByLabelText("Público-alvo"), {
      target: { value: "Pessoas que valorizam café brasileiro de origem." },
    });
    fireEvent.change(screen.getByLabelText("Persona"), {
      target: { value: "Marina, 34 anos, compra café especial para casa." },
    });
    fireEvent.change(screen.getByLabelText("Tom de voz"), {
      target: { value: "Próximo, claro e otimista." },
    });
    fireEvent.change(screen.getByLabelText("Exemplos de voz"), {
      target: { value: "Café bom tem história." },
    });
    fireEvent.change(screen.getByLabelText("Palavras proibidas"), {
      target: { value: "milagre" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Criar marca" }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    const submitted = action.mock.calls[0]?.[1] as FormData;
    expect(submitted.get("name")).toBe("Café Horizonte");
    expect(submitted.get("toneOfVoice")).toBe("Próximo, claro e otimista.");
    expect(submitted.get("forbiddenWords")).toBe("milagre");
  });
});
