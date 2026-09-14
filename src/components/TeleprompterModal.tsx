"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { useTeleprompter } from "@/hooks/useTeleprompter";

export interface TeleprompterModalProps {
  open: boolean;
  title: string;
  text: string;
  onOpenChange: (open: boolean) => void;
}

export function TeleprompterModal({ open, title, text, onOpenChange }: TeleprompterModalProps) {
  const [wpm, setWpm] = useState(145);
  const { playing, offset, toggle, reset } = useTeleprompter({ text, wordsPerMinute: wpm });

  const translate = useMemo(() => `translateY(${-offset * 70}%)`, [offset]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
      title={title}
      description="Ajuste a velocidade e grave olhando para a câmera."
      className="w-[min(92vw,560px)]"
    >
      <div className="space-y-4">
        <label className="flex items-center justify-between text-sm">
          Velocidade: {wpm} palavras/min
        </label>
        <Slider value={wpm} min={80} max={220} onValueChange={setWpm} />
        <div className="relative h-72 overflow-hidden rounded-3xl bg-[#11100d] text-[#f6f1e6]">
          <div
            className="absolute inset-x-6 top-10 text-center font-serif text-3xl leading-relaxed"
            style={{ transform: translate }}
          >
            {text}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-[#11100d] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#11100d] to-transparent" />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={toggle}>
            {playing ? "Pausar" : "Iniciar"}
          </Button>
          <Button type="button" variant="secondary" onClick={reset}>
            Reiniciar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
