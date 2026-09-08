import type { ReactNode } from "react";

export type BadgeStatus =
  | "Rascunho"
  | "Em análise"
  | "Aguardando aprovação"
  | "Aprovado"
  | "Publicado"
  | "Falhou";

export interface BadgeProps {
  status: BadgeStatus;
  children?: ReactNode;
}

const statusTones: Record<
  BadgeStatus,
  { className: string; tone: "neutral" | "info" | "warning" | "success" | "critical" }
> = {
  Rascunho: {
    className: "bg-surface-inset text-ink-muted",
    tone: "neutral",
  },
  "Em análise": {
    className: "bg-signal-soft text-signal",
    tone: "info",
  },
  "Aguardando aprovação": {
    className: "bg-warning-soft text-warning",
    tone: "warning",
  },
  Aprovado: {
    className: "bg-success-soft text-success",
    tone: "success",
  },
  Publicado: {
    className: "bg-success-soft text-success",
    tone: "success",
  },
  Falhou: {
    className: "bg-critical-soft text-critical",
    tone: "critical",
  },
};

export function Badge({ children, status }: BadgeProps) {
  const semantics = statusTones[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-semibold ${semantics.className}`}
      data-tone={semantics.tone}
    >
      {children ?? status}
    </span>
  );
}
