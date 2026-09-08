"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/Avatar";

export interface ContextHeaderProps {
  contextLabel: string;
  title: string;
  userName: string;
}

export function ContextHeader({
  contextLabel,
  title,
  userName,
}: ContextHeaderProps) {
  const pathname = usePathname();
  const isBrands = pathname.startsWith("/app/marcas");
  const usesShellDefaults = title === "Visão geral";
  const currentTitle =
    !usesShellDefaults
      ? title
      : pathname === "/app/marcas"
      ? "Marcas"
      : pathname === "/app/marcas/nova"
        ? "Nova marca"
        : isBrands
          ? "Detalhe da marca"
          : title;
  const currentContext =
    usesShellDefaults && isBrands ? "Gestão de marcas" : contextLabel;

  return (
    <header className="flex min-h-16 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-ink-muted">{currentContext}</p>
        <h1 className="truncate text-base font-semibold text-ink">
          {currentTitle}
        </h1>
      </div>
      <button
        type="button"
        aria-label="Buscar"
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-ink-muted hover:bg-surface-inset focus-visible:outline-2 focus-visible:outline-signal"
      >
        <Search aria-hidden="true" size={19} />
      </button>
      <button
        type="button"
        aria-label="Notificações, 2 novas"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm text-ink-muted hover:bg-surface-inset focus-visible:outline-2 focus-visible:outline-signal"
      >
        <Bell aria-hidden="true" size={19} />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ember" />
      </button>
      <Avatar name={userName} size="sm" />
    </header>
  );
}
