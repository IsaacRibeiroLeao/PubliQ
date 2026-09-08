"use client";

import {
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { usePathname } from "next/navigation";

export interface AppNavigationProps {
  compact?: boolean;
  orientation?: "horizontal" | "vertical";
}

const navigationItems = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard },
  { href: "/app/marcas", label: "Marcas", icon: Building2 },
] as const;

export function AppNavigation({
  compact = false,
  orientation = "vertical",
}: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal">
      <ul
        className={
          orientation === "horizontal"
            ? "flex items-center justify-around"
            : "grid gap-1"
        }
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={`flex min-h-11 items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-signal ${
                  isActive
                    ? "bg-signal-soft text-signal"
                    : "text-ink-muted hover:bg-surface-inset hover:text-ink"
                } ${compact ? "justify-center" : ""}`}
              >
                <Icon aria-hidden="true" size={20} />
                <span className={compact ? "sr-only" : ""}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
