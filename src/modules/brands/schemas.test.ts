import { describe, expect, it } from "vitest";
import {
  brandFormSchema,
  parseBrandFormData,
} from "@/modules/brands/schemas";

describe("brandFormSchema", () => {
  it("normalizes multiline voice fields into non-empty lists", () => {
    const result = parseBrandFormData(
      new FormData(),
      {
        name: " Café Horizonte ",
        niche: " Cafeteria ",
        valueProposition: "Café rastreável entregue sem complicação.",
        targetAudience: "Pessoas que valorizam café brasileiro de origem.",
        persona: "Marina, 34 anos, compra café especial para casa.",
        toneOfVoice: "Próximo, claro e otimista.",
        voiceExamples: "Café bom tem história.\n\nConheça quem cultiva.",
        forbiddenWords: "imperdível\n milagre ",
      },
    );

    expect(result).toEqual({
      name: "Café Horizonte",
      niche: "Cafeteria",
      valueProposition: "Café rastreável entregue sem complicação.",
      targetAudience: "Pessoas que valorizam café brasileiro de origem.",
      persona: "Marina, 34 anos, compra café especial para casa.",
      toneOfVoice: "Próximo, claro e otimista.",
      voiceExamples: ["Café bom tem história.", "Conheça quem cultiva."],
      forbiddenWords: ["imperdível", "milagre"],
    });
  });

  it("rejects an incomplete brand voice profile", () => {
    const result = brandFormSchema.safeParse({
      name: "",
      niche: "",
      valueProposition: "",
      targetAudience: "",
      persona: "",
      toneOfVoice: "",
      voiceExamples: [],
      forbiddenWords: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
      expect(result.error.flatten().fieldErrors.persona).toBeDefined();
      expect(result.error.flatten().fieldErrors.voiceExamples).toBeDefined();
    }
  });
});
