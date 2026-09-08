import type { Metadata } from "next";
import Link from "next/link";
import { BrandForm } from "@/components/BrandForm";
import { requireWorkspaceAccess } from "@/modules/auth/session";
import { createBrandAction } from "@/modules/brands/actions";
import { getCurrentWorkspaceContext } from "@/modules/workspaces/context";

export const metadata: Metadata = {
  title: "Nova marca | PubliQ",
};

export default async function NewBrandPage() {
  const context = await getCurrentWorkspaceContext();
  await requireWorkspaceAccess(context.workspace.id, [
    "OWNER",
    "ADMIN",
    "EDITOR",
  ]);
  const action = createBrandAction.bind(null, context.workspace.id);

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
