import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "ok" | "danger" | "gold";
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  const tones = {
    neutral: "bg-surface-2 text-foreground",
    ok: "bg-[color-mix(in_srgb,var(--ok)_16%,white)] text-ok",
    danger: "bg-[color-mix(in_srgb,var(--danger)_14%,white)] text-danger",
    gold: "bg-[color-mix(in_srgb,var(--gold)_28%,white)] text-accent",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}
