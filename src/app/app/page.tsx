import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";
import { getCurrentSession } from "@/modules/auth/session";
import { DEMO_BRAND, DEMO_USER } from "@/shared/demo-fixtures";

export const metadata: Metadata = {
  title: "Visão geral | PubliQ",
  description: "Acompanhe sua esteira de publicação e os criativos recentes.",
};

export default async function DashboardPage() {
  const session = await getCurrentSession();

  return <Dashboard user={session?.user ?? DEMO_USER} brand={DEMO_BRAND} />;
}
