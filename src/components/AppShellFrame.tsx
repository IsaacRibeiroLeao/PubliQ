"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, CalendarDays, MessageSquareText, Settings2, Video } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/utils/cn";
import { createClient } from "@/utils/supabase/client";

const NAV = [
  { href: "/chat", label: "Copiloto", icon: MessageSquareText },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/studio", label: "Estúdio", icon: Video },
  { href: "/analytics", label: "Métricas", icon: BarChart3 },
  { href: "/settings", label: "Conta", icon: Settings2 },
];

export function AppShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="paper-grid min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-surface/90 p-5 lg:flex lg:flex-col">
        <BrandMark />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all duration-300",
                  active ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface-2/70",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl bg-surface-2 p-3 text-sm">
          <p className="font-medium">{profile?.name ?? "Sua conta"}</p>
          <p className="text-muted">{profile?.plan_tier ?? "STARTER"}</p>
          <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => void signOut()}>
            Sair
          </Button>
        </div>
      </aside>
      <div className="lg:pl-60">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <BrandMark />
          <div className="flex gap-2 overflow-x-auto">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full bg-surface px-3 py-1 text-xs">
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="animate-fade-in min-h-screen p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
