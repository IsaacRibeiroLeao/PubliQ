import type { Metadata } from "next";
import Link from "next/link";
import { Dashboard } from "@/components/Dashboard";
import { EmptyState } from "@/components/EmptyState";
import { getBrandRepository } from "@/modules/brands/service";
import { getCurrentWorkspaceContext } from "@/modules/workspaces/context";

export const metadata: Metadata = {
  title: "Visão geral | PubliQ",
  description: "Acompanhe sua esteira de publicação e os criativos recentes.",
};

export default async function DashboardPage() {
  const context = await getCurrentWorkspaceContext();
  const brands = await (await getBrandRepository()).list(context.workspace.id);
  const brand = brands[0];

  if (!brand) {
    return (
      <EmptyState
        title="Crie sua primeira marca"
        description="Cadastre o contexto da marca antes de iniciar a esteira de criativos."
        action={
          context.membership.role === "VIEWER" ? undefined : (
            <Link
              href="/app/marcas/nova"
              className="inline-flex min-h-10 items-center rounded-sm bg-signal px-4 text-sm font-semibold text-on-signal"
            >
              Nova marca
            </Link>
          )
        }
      />
    );
  }

  return <Dashboard user={context.user} brand={brand} />;
}
