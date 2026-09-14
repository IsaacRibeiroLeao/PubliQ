"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ContentScript } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { addUtcDays, formatDateLabel, toISODate } from "@/utils/formatDate";

export function EditorialCalendar() {
  const [scripts, setScripts] = useState<ContentScript[]>([]);
  const start = toISODate(new Date());
  const days = useMemo(
    () => Array.from({ length: 14 }, (_, index) => addUtcDays(start, index)),
    [start],
  );

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("content_scripts")
      .select("*")
      .gte("target_date", start)
      .lte("target_date", addUtcDays(start, 13))
      .order("target_date")
      .then(({ data }) => setScripts((data as ContentScript[] | null) ?? []));
  }, [start]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-4xl">Calendário editorial</h1>
        <p className="text-muted">Pautas salvas a partir do copiloto, prontas para gravar.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => {
          const items = scripts.filter((script) => script.target_date === day);
          return (
            <Card key={day} className="min-h-40">
              <p className="text-xs tracking-wide text-muted uppercase">{formatDateLabel(day)}</p>
              {items.length === 0 ? (
                <p className="mt-6 text-sm text-muted">Sem pauta ainda.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-2xl bg-surface-2 p-3">
                      <p className="font-medium">{item.title}</p>
                      <Badge className="mt-2">{item.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
