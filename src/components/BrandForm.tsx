"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import type { BrandFormValues } from "@/modules/brands/schemas";

export interface BrandFormState {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Partial<Record<keyof BrandFormValues, string[]>>;
}

export type BrandFormAction = (
  previousState: BrandFormState,
  formData: FormData,
) => Promise<BrandFormState>;

export interface BrandFormProps {
  action: BrandFormAction;
  defaults?: BrandFormValues;
  submitLabel: string;
}

const initialState: BrandFormState = { status: "idle" };

export function BrandForm({
  action,
  defaults,
  submitLabel,
}: BrandFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const error = (field: keyof BrandFormValues) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="grid gap-8">
      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-sm bg-critical-soft p-3 text-sm text-critical">
          {state.message}
        </p>
      ) : null}

      <fieldset className="grid gap-5 rounded-md border border-border bg-surface p-5 sm:p-6">
        <legend className="px-2 text-base font-semibold text-ink">
          Identidade da marca
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Nome da marca"
            name="name"
            defaultValue={defaults?.name}
            error={error("name")}
            required
          />
          <Input
            label="Nicho"
            name="niche"
            defaultValue={defaults?.niche}
            error={error("niche")}
            required
          />
        </div>
        <Textarea
          label="Proposta de valor"
          name="valueProposition"
          defaultValue={defaults?.valueProposition}
          error={error("valueProposition")}
          required
        />
        <Textarea
          label="Público-alvo"
          name="targetAudience"
          defaultValue={defaults?.targetAudience}
          error={error("targetAudience")}
          required
        />
        <Textarea
          label="Persona"
          name="persona"
          hint="Descreva contexto, objetivos, dores e hábitos."
          defaultValue={defaults?.persona}
          error={error("persona")}
          required
        />
      </fieldset>

      <fieldset className="grid gap-5 rounded-md border border-border bg-surface p-5 sm:p-6">
        <legend className="px-2 text-base font-semibold text-ink">
          Brand voice
        </legend>
        <Textarea
          label="Tom de voz"
          name="toneOfVoice"
          defaultValue={defaults?.toneOfVoice}
          error={error("toneOfVoice")}
          required
        />
        <Textarea
          label="Exemplos de voz"
          name="voiceExamples"
          hint="Use uma linha para cada exemplo."
          defaultValue={defaults?.voiceExamples.join("\n")}
          error={error("voiceExamples")}
          required
        />
        <Textarea
          label="Palavras proibidas"
          name="forbiddenWords"
          hint="Separe por linha ou vírgula. Deixe vazio se não houver restrições."
          defaultValue={defaults?.forbiddenWords.join("\n")}
          error={error("forbiddenWords")}
        />
      </fieldset>

      <div className="flex justify-end gap-3">
        <Link
          href="/app/marcas"
          className="inline-flex min-h-10 items-center rounded-sm px-4 text-sm font-semibold text-ink-muted hover:bg-surface-inset"
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
