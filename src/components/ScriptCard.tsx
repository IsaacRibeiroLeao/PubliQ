"use client";

import { CalendarPlus, Clapperboard, Copy, Upload } from "lucide-react";
import { useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ContentScriptCard } from "@/shared/schemas";
import { formatDateLabel } from "@/utils/formatDate";

export interface ScriptCardProps {
  script: ContentScriptCard;
  onOpenTeleprompter: (script: ContentScriptCard) => void;
  onAddToCalendar: (script: ContentScriptCard) => void;
  onUpload: (script: ContentScriptCard) => void;
  canAutoPost: boolean;
}

export function ScriptCard({
  script,
  onOpenTeleprompter,
  onAddToCalendar,
  onUpload,
  canAutoPost,
}: ScriptCardProps) {
  const copy = useCallback(async (value: string) => {
    await navigator.clipboard.writeText(value);
  }, []);

  return (
    <Card className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">{formatDateLabel(script.targetDate)}</p>
          <h3 className="mt-1 font-serif text-2xl">{script.title}</h3>
        </div>
        <Badge tone={script.compliancePassed ? "ok" : "danger"}>
          {script.compliancePassed ? "Tom responsável" : "Revisar tom"}
        </Badge>
      </div>

      <section className="rounded-2xl bg-surface-2 p-4">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Tema e enquadramento</p>
        <p className="mt-1 font-medium">{script.ethicalTheme}</p>
        <p className="mt-1 text-sm text-muted">{script.ethicalFraming}</p>
        {script.complianceNotes ? <p className="mt-2 text-sm">{script.complianceNotes}</p> : null}
      </section>

      <ol className="grid gap-3 md:grid-cols-3">
        <li className="rounded-2xl border border-border p-4">
          <p className="text-xs text-muted">0–3s · Gancho</p>
          <p className="mt-2 text-sm">{script.hookText}</p>
        </li>
        <li className="rounded-2xl border border-border p-4">
          <p className="text-xs text-muted">4–45s · Desenvolvimento</p>
          <p className="mt-2 text-sm">{script.bodyText}</p>
        </li>
        <li className="rounded-2xl border border-border p-4">
          <p className="text-xs text-muted">46–60s · CTA</p>
          <p className="mt-2 text-sm">{script.ctaText}</p>
        </li>
      </ol>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs tracking-wide text-muted uppercase">Instagram</p>
            <Button type="button" size="sm" variant="ghost" onClick={() => void copy(script.instagramCaption)}>
              <Copy className="size-3.5" />
              Copiar
            </Button>
          </div>
          <p className="whitespace-pre-wrap text-sm">{script.instagramCaption}</p>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs tracking-wide text-muted uppercase">TikTok</p>
            <Button type="button" size="sm" variant="ghost" onClick={() => void copy(script.tiktokCaption)}>
              <Copy className="size-3.5" />
              Copiar
            </Button>
          </div>
          <p className="whitespace-pre-wrap text-sm">{script.tiktokCaption}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => onOpenTeleprompter(script)}>
          <Clapperboard className="size-4" />
          Abrir Teleprompter
        </Button>
        <Button type="button" variant="outline" onClick={() => onAddToCalendar(script)}>
          <CalendarPlus className="size-4" />
          Adicionar ao Calendário
        </Button>
        <Button type="button" onClick={() => onUpload(script)} disabled={!canAutoPost}>
          <Upload className="size-4" />
          Upload e Auto-Post
        </Button>
      </div>
    </Card>
  );
}
