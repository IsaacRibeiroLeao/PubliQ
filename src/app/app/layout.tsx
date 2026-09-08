import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { getCurrentSession } from "@/modules/auth/session";
import { getBrandRepository } from "@/modules/brands/service";
import { getCurrentWorkspaceContext } from "@/modules/workspaces/context";

export interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?redirectTo=/app");
  }
  const context = await getCurrentWorkspaceContext(session);
  const brands = await (await getBrandRepository()).list(context.workspace.id);
  const currentBrand = brands[0];

  return (
    <AppShell
      contextLabel={currentBrand?.name ?? context.workspace.name}
      title="Visão geral"
      userName={session.user.name}
      workspaceName={context.workspace.name}
    >
      {children}
    </AppShell>
  );
}
