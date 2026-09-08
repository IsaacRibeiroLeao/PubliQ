import { z } from "zod";

const requiredText = (label: string, minimum = 2) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} deve ter pelo menos ${minimum} caracteres.`);

export const brandFormSchema = z.object({
  name: requiredText("Nome"),
  niche: requiredText("Nicho"),
  valueProposition: requiredText("Proposta de valor", 10),
  targetAudience: requiredText("Público-alvo", 10),
  persona: requiredText("Persona", 10),
  toneOfVoice: requiredText("Tom de voz", 5),
  voiceExamples: z
    .array(requiredText("Exemplo de voz", 5))
    .min(1, "Informe pelo menos um exemplo de voz."),
  forbiddenWords: z.array(z.string().trim().min(1)),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

type BrandFormRawValues = Record<keyof BrandFormValues, string>;

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseBrandFormData(
  formData: FormData,
  overrides: Partial<BrandFormRawValues> = {},
): unknown {
  const value = (key: keyof BrandFormValues) =>
    overrides[key] ?? String(formData.get(key) ?? "");

  return {
    name: value("name").trim(),
    niche: value("niche").trim(),
    valueProposition: value("valueProposition").trim(),
    targetAudience: value("targetAudience").trim(),
    persona: value("persona").trim(),
    toneOfVoice: value("toneOfVoice").trim(),
    voiceExamples: splitLines(value("voiceExamples")),
    forbiddenWords: splitLines(value("forbiddenWords")),
  };
}
