import type { Metadata } from "next";
import Link from "next/link";
import { BrandForm } from "@/components/BrandForm";
import { requireSession } from "@/modules/auth/session";
import { createBrandAction } from "@/modules/brands/actions";

export const metadata: Metadata = {
  title: "Nova marca | PubliQ",
};

export default async function NewBrandPage() {
  const session = await requireSession();
  const membership = session.memberships[0];
  if (!membership) {
    throw new Error("Nenhum workspace disponível.");
  }
  const action = createBrandAction.bind(null, membership.workspaceId);

  return (
    <div className="mx-auto grid max-w-4xl gap-7">
      <header>
        <Link href="/app/marcas" className="text-sm font-semibold text-signal">
          Voltar para marcas
        </Link>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
          Nova marca
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Defina o contexto que orientará análise, copy e revisão de cada peça.
        </p>
      </header>
      <BrandForm action={action} submitLabel="Criar marca" />
    </div>
  );
}
