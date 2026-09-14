"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useProfile } from "@/hooks/useProfile";
import { PLANS, type PlanTier } from "@/utils/plans";
import { invokeFunction } from "@/utils/invokeFunction";
import { cn } from "@/utils/cn";

export function PlanBillingCard() {
  const { profile } = useProfile();
  const [message, setMessage] = useState<string | null>(null);

  async function checkout(tier: PlanTier, provider: "STRIPE" | "ASAAS") {
    const { data, error } = await invokeFunction<{ url?: string; message?: string }>("create-checkout", {
      tier,
      provider,
    });
    if (data?.url) {
      window.location.assign(data.url);
      return;
    }
    setMessage(error ?? data?.message ?? "Checkout ainda não configurado neste ambiente.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {(Object.keys(PLANS) as PlanTier[]).map((tier) => {
        const plan = PLANS[tier];
        const current = profile?.plan_tier === tier;
        return (
          <Card key={tier} className={cn(current && "ring-2 ring-gold")}>
            <p className="text-xs tracking-wide text-muted uppercase">{plan.name}</p>
            <p className="mt-2 font-serif text-4xl">{plan.priceLabel}</p>
            <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
            <ul className="mt-4 space-y-1 text-sm">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            {tier === "STARTER" ? (
              <Button className="mt-5 w-full" variant="secondary" disabled>
                {current ? "Plano atual" : "Gratuito"}
              </Button>
            ) : (
              <div className="mt-5 space-y-2">
                <Button className="w-full" disabled={current} onClick={() => void checkout(tier, "STRIPE")}>
                  Assinar com Stripe
                </Button>
                <Button className="w-full" variant="outline" disabled={current} onClick={() => void checkout(tier, "ASAAS")}>
                  Assinar com Asaas
                </Button>
              </div>
            )}
          </Card>
        );
      })}
      {message ? <p className="text-sm text-muted lg:col-span-3">{message}</p> : null}
    </div>
  );
}
