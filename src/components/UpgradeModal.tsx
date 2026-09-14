"use client";

import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/utils/plans";

export interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const pro = PLANS.PRO;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Você usou os 3 créditos de hoje"
      description="O plano Starter reseta à meia-noite no seu fuso. No Pro, a geração fica ilimitada e o auto-post entra no ar."
    >
      <div className="rounded-2xl bg-surface-2 p-4">
        <p className="font-serif text-2xl">{pro.name}</p>
        <p className="text-sm text-muted">{pro.priceLabel}/mês</p>
        <ul className="mt-3 space-y-1 text-sm">
          {pro.features.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
        </ul>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/pricing">Assinar Pro</Link>
        </Button>
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Continuar no Starter
        </Button>
      </div>
    </Dialog>
  );
}
