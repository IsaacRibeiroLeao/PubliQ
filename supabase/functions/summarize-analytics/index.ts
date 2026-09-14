import { requireUserId } from "../_shared/auth.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  try {
    const { userId, client } = await requireUserId(req);
    const { data: profile } = await client.from("profiles").select("plan_tier, profession").eq("id", userId).single();
    if (!profile || !["PRO", "AGENCY"].includes(profile.plan_tier)) {
      return jsonResponse({ summary: "O resumo executivo com IA entra no plano Pro." });
    }

    const { data: rows } = await client
      .from("post_analytics")
      .select("platform, views_count, likes_count, comments_count, shares_count, watch_time_avg_sec")
      .eq("user_id", userId);

    const totalViews = (rows ?? []).reduce((sum, row) => sum + (row.views_count ?? 0), 0);
    const summary =
      totalViews === 0
        ? "Ainda não há métricas sincronizadas. Publique um Reel ou TikTok pelo estúdio e o cron de 15 minutos consolida os números."
        : `Nas últimas coletas, seus vídeos somaram ${totalViews} views. Mantenha o tom educativo da ${profile.profession} e evite CTAs de resultado. O gancho dos 3 primeiros segundos continua sendo o principal alavanca de retenção.`;

    return jsonResponse({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return jsonResponse({ error: message }, message === "unauthenticated" ? 401 : 500);
  }
});
