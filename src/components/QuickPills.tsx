"use client";

import { memo } from "react";
import { Button } from "@/components/ui/Button";

export interface QuickPill {
  id: string;
  emoji: string;
  label: string;
  prompt: string;
}

export const DEFAULT_PILLS: QuickPill[] = [
  {
    id: "week",
    emoji: "📅",
    label: "Roteiro para postar nesta segunda",
    prompt:
      "Gere um roteiro de até 60 segundos para eu postar nesta segunda-feira, com gancho, desenvolvimento e CTA claro, sem prometer resultado milagroso.",
  },
  {
    id: "carousel",
    emoji: "🖼️",
    label: "Carrossel educativo do meu tema",
    prompt:
      "Crie um carrossel educativo sobre o meu nicho, em linguagem acessível, com 3 atos e legendas para Instagram e TikTok.",
  },
  {
    id: "analytics",
    emoji: "📈",
    label: "O que performou na última semana",
    prompt: "Analise a performance dos meus vídeos da última semana e sugira o próximo tema com um roteiro pronto.",
  },
];

export interface QuickPillsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickPills = memo(function QuickPills({ onSelect, disabled }: QuickPillsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {DEFAULT_PILLS.map((pill, index) => (
        <Button
          key={pill.id}
          type="button"
          variant="outline"
          className="animate-fade-up h-auto max-w-xs whitespace-normal px-4 py-3 text-left transition-transform duration-300 hover:-translate-y-0.5"
          style={{ animationDelay: `${180 + index * 90}ms` }}
          disabled={disabled}
          onClick={() => onSelect(pill.prompt)}
        >
          <span className="mr-1">{pill.emoji}</span>
          {pill.label}
        </Button>
      ))}
    </div>
  );
});
