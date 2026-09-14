import { requireUserId } from "../_shared/auth.ts";
import { generateScripts } from "../_shared/generate.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

interface RequestBody {
  prompt?: string;
  targetDate?: string;
  scope?: "day" | "week" | "month";
  threadId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  try {
    const { userId, client } = await requireUserId(req);
    const body = (await req.json()) as RequestBody;
    const prompt = body.prompt?.trim() ?? "";
    const targetDate = body.targetDate ?? new Date().toISOString().slice(0, 10);

    if (prompt.length < 8) {
      return jsonResponse({ error: "Descreva o pedido com um pouco mais de contexto." }, 400);
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("id, name, profession, niche, plan_tier, timezone")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Perfil não encontrado." }, 400);
    }

    const requestedDays = body.scope === "month" ? 30 : body.scope === "week" ? 7 : 1;
    const days = profile.plan_tier === "STARTER" ? 1 : requestedDays;

    const { data: allowed, error: creditError } = await client.rpc("consume_prompt_credit");
    if (creditError) {
      return jsonResponse({ error: creditError.message }, 400);
    }
    if (allowed !== true) {
      return jsonResponse(
        {
          quotaExceeded: true,
          error: "Você usou os 3 créditos de hoje. O Starter reseta à meia-noite no seu fuso.",
        },
        402,
      );
    }

    const { data: rules } = await client
      .from("compliance_rules")
      .select("code, title, instruction")
      .eq("profession", profile.profession);

    const generated = await generateScripts({
      prompt,
      profile,
      targetDate,
      days,
      rules: rules ?? [],
    });

    let threadId = body.threadId;
    if (!threadId) {
      const { data: thread } = await client
        .from("chat_threads")
        .select("id")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      threadId = thread?.id;
    }
    if (!threadId) {
      const { data: created } = await client
        .from("chat_threads")
        .insert({ user_id: userId, title: prompt.slice(0, 80) })
        .select("id")
        .single();
      threadId = created?.id;
    }

    const insertedScripts = [];
    for (const script of generated.scripts) {
      const { data } = await client
        .from("content_scripts")
        .insert({
          user_id: userId,
          title: script.title,
          hook_text: script.hookText,
          body_text: script.bodyText,
          cta_text: script.ctaText,
          instagram_caption: script.instagramCaption,
          tiktok_caption: script.tiktokCaption,
          ethical_theme: script.ethicalTheme,
          ethical_framing: script.ethicalFraming,
          compliance_notes: script.complianceNotes,
          target_date: script.targetDate,
          compliance_passed: script.compliancePassed,
          status: "IDEA",
        })
        .select("id")
        .single();

      insertedScripts.push({
        id: data?.id,
        ...script,
      });
    }

    if (threadId) {
      await client.from("chat_messages").insert([
        { thread_id: threadId, user_id: userId, role: "user", content: prompt, payload: {} },
        {
          thread_id: threadId,
          user_id: userId,
          role: "assistant",
          content: generated.message,
          payload: { scripts: insertedScripts },
        },
      ]);
      await client.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
    }

    return jsonResponse({
      message: generated.message,
      scripts: insertedScripts,
      threadId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message === "unauthenticated" ? 401 : 500;
    return jsonResponse({ error: message }, status);
  }
});
