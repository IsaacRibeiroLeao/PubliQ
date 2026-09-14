import { requireUserId } from "../_shared/auth.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

interface RequestBody {
  scriptId?: string;
  mediaPath?: string;
  scheduledFor?: string;
  platforms?: Array<"INSTAGRAM" | "TIKTOK">;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  try {
    const { userId, client } = await requireUserId(req);
    const body = (await req.json()) as RequestBody;

    if (!body.scriptId || !body.mediaPath || !body.scheduledFor) {
      return jsonResponse({ error: "scriptId, mediaPath e scheduledFor são obrigatórios." }, 400);
    }

    const { data: profile } = await client.from("profiles").select("plan_tier").eq("id", userId).single();
    if (!profile || !["PRO", "AGENCY"].includes(profile.plan_tier)) {
      return jsonResponse({ error: "Auto-post é exclusivo dos planos Pro e Agency." }, 403);
    }

    const { data: script } = await client.from("content_scripts").select("*").eq("id", body.scriptId).single();
    if (!script) {
      return jsonResponse({ error: "Pauta não encontrada." }, 404);
    }

    const publicPath = body.mediaPath;
    const { data: original, error: downloadError } = await client.storage.from("media-raw").download(body.mediaPath);
    if (downloadError || !original) {
      return jsonResponse({ error: downloadError?.message ?? "Não foi possível ler o vídeo." }, 400);
    }

    const { error: uploadError } = await client.storage.from("media-public").upload(publicPath, original, {
      upsert: true,
      contentType: original.type || "video/mp4",
    });
    if (uploadError) {
      return jsonResponse({ error: uploadError.message }, 400);
    }

    const { data: publicUrl } = client.storage.from("media-public").getPublicUrl(publicPath);
    const { data: signed } = await client.storage.from("media-public").createSignedUrl(publicPath, 60 * 60 * 24 * 5);
    const mediaUrl = signed?.signedUrl ?? publicUrl.publicUrl;

    const { data: post, error } = await client
      .from("scheduled_posts")
      .insert({
        user_id: userId,
        script_id: script.id,
        media_path: publicPath,
        media_url: mediaUrl,
        instagram_caption: script.instagram_caption,
        tiktok_caption: script.tiktok_caption,
        scheduled_for: body.scheduledFor,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    await client.from("content_scripts").update({ status: "RECORDED" }).eq("id", script.id);

    return jsonResponse({ id: post?.id, platforms: body.platforms ?? ["INSTAGRAM", "TIKTOK"] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return jsonResponse({ error: message }, message === "unauthenticated" ? 401 : 500);
  }
});
