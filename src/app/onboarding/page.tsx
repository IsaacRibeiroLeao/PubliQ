import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Progress } from "@/components/Progress";
import { PubliQLogo } from "@/components/PubliQLogo";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { getCurrentSession } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Configurar workspace | PubliQ",
  description: "Prepare sua agência e sua primeira marca no PubliQ.",
};

export default async function OnboardingPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?redirectTo=/onboarding");
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-border bg-surface px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-5">
          <PubliQLogo />
          <span className="text-[13px] text-ink-muted">
            Olá, {session.user.name.split(" ")[0]}
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-16">
        <aside>
          <p className="font-mono text-[13px] text-signal">Etapa 1 de 3</p>
          <h1 className="mt-3 font-display text-[31px] font-semibold leading-tight text-ink">
            Prepare sua primeira marca
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Essas informações orientam as copies e mantêm a voz da marca
            consistente.
          </p>
          <div className="mt-6">
            <Progress value={33} label="Progresso da configuração" />
          </div>
        </aside>

        <section className="rounded-md border border-border bg-surface p-5 sm:p-8">
          <form className="grid gap-6">
            <Input
              label="Nome da marca"
              name="brandName"
              placeholder="Ex.: Café Aurora"
              required
            />
            <Select
              label="Segmento"
              name="niche"
              options={[
                { label: "Alimentação e bebidas", value: "food" },
                { label: "Moda e beleza", value: "fashion" },
                { label: "Casa e decoração", value: "home" },
                { label: "Serviços profissionais", value: "services" },
              ]}
            />
            <Textarea
              label="Proposta de valor"
              name="valueProposition"
              hint="Explique em uma frase por que clientes escolhem esta marca."
              placeholder="Café especial brasileiro, simples e acolhedor."
              required
            />
            <div className="flex justify-end border-t border-border pt-6">
              <Button type="submit">
                Continuar
                <ArrowRight aria-hidden="true" size={18} />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
