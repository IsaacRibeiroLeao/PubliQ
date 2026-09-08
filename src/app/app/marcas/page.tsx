import { Plus, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { getBrandRepository } from "@/modules/brands/service";
import { getCurrentWorkspaceContext } from "@/modules/workspaces/context";

export const metadata: Metadata = {
  title: "Marcas | PubliQ",
  description: "Gerencie identidades, públicos e brand voices.",
};

export interface BrandsPageProps {
  searchParams: Promise<{ metaError?: string }>;
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const context = await getCurrentWorkspaceContext();
  const brands = await (await getBrandRepository()).list(context.workspace.id);
  const canWrite = ["OWNER", "ADMIN", "EDITOR"].includes(
    context.membership.role,
  );
  const metaError = (await searchParams).metaError;

  return (
    <div className="grid gap-7">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Marcas
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Centralize posicionamento, público e tom antes de criar conteúdo.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/app/marcas/nova"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-signal px-4 py-2 text-sm font-semibold text-on-signal"
          >
            <Plus aria-hidden="true" size={18} />
            Nova marca
          </Link>
        ) : null}
      </header>

      {metaError ? (
        <p role="alert" className="rounded-sm bg-critical-soft p-3 text-sm text-critical">
          A conexão com a Meta expirou ou não pôde ser validada. Inicie novamente.
        </p>
      ) : null}

      {brands.length === 0 ? (
        <EmptyState
          title="Nenhuma marca cadastrada"
          description={
            canWrite
              ? "Crie a primeira marca para registrar o contexto usado nos criativos."
              : "Seu acesso é somente leitura. Peça a um editor para cadastrar a primeira marca."
          }
          action={
            canWrite ? (
              <Link
                href="/app/marcas/nova"
                className="inline-flex min-h-10 items-center rounded-sm bg-signal px-4 text-sm font-semibold text-on-signal"
              >
                Criar primeira marca
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/app/marcas/${brand.id}`}
                className="group block min-h-48 rounded-md border border-border bg-surface p-5 outline-none transition-colors hover:border-signal focus-visible:ring-2 focus-visible:ring-signal"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-ember-soft text-ember">
                  <Store aria-hidden="true" size={20} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink group-hover:text-signal">
                  {brand.name}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{brand.niche}</p>
                <p className="mt-4 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
                  {brand.valueProposition}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
