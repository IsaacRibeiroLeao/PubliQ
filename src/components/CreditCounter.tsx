"use client";

import { Badge } from "@/components/ui/Badge";
import type { UsageSnapshot } from "@/shared/schemas";

export interface CreditCounterProps {
  usage: UsageSnapshot;
}

export function CreditCounter({ usage }: CreditCounterProps) {
  if (usage.unlimited) {
    return <Badge tone="gold">Créditos ilimitados · {usage.plan_tier}</Badge>;
  }

  const remaining = usage.remaining ?? 0;
  const limit = usage.daily_prompt_limit ?? 3;

  return (
    <Badge tone={remaining === 0 ? "danger" : "neutral"}>
      Créditos restantes hoje: {remaining} / {limit}
    </Badge>
  );
}
