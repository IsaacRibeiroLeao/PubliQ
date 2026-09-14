"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useProfile } from "@/hooks/useProfile";
import type { PostAnalytics } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { isPaidPlan } from "@/utils/plans";
import { invokeFunction } from "@/utils/invokeFunction";

export function AnalyticsDashboard() {
  const { profile } = useProfile();
  const [rows, setRows] = useState<PostAnalytics[]>([]);
  const [remoteSummary, setRemoteSummary] = useState<string | null>(null);
  const paid = profile ? isPaidPlan(profile.plan_tier) : false;
  const summary = paid
    ? (remoteSummary ?? "Carregando leitura executiva...")
    : "O dashboard analítico entra no plano Pro.";

  useEffect(() => {
    if (!paid) {
      return;
    }

    const supabase = createClient();
    void supabase
      .from("post_analytics")
      .select("*")
      .order("synced_at", { ascending: false })
      .limit(40)
      .then(({ data }) => setRows((data as PostAnalytics[] | null) ?? []));

    void invokeFunction<{ summary: string }>("summarize-analytics", {}).then(({ data, error }) => {
      setRemoteSummary(data?.summary ?? error ?? "Sem dados suficientes nesta semana.");
    });
  }, [paid]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          views: acc.views + row.views_count,
          likes: acc.likes + row.likes_count,
          comments: acc.comments + row.comments_count,
        }),
        { views: 0, likes: 0, comments: 0 },
      ),
    [rows],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl">Métricas consolidadas</h1>
        <p className="text-muted">Instagram e TikTok no mesmo quadro, com leitura clara da performance.</p>
      </div>
      <Card>
        <p className="text-sm leading-7">{summary}</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <p className="text-xs text-muted uppercase">Views</p>
          <p className="font-serif text-4xl">{totals.views}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted uppercase">Curtidas</p>
          <p className="font-serif text-4xl">{totals.likes}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted uppercase">Comentários</p>
          <p className="font-serif text-4xl">{totals.comments}</p>
        </Card>
      </div>
    </div>
  );
}
