import { requireUserId } from "../_shared/auth.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  try {
    const { userId } = await requireUserId(req);
    const body = (await req.json()) as { platform?: "INSTAGRAM" | "TIKTOK" };
    const origin = req.headers.get("origin") ?? Deno.env.get("SITE_URL") ?? "http://127.0.0.1:3000";
    const redirect = `${origin}/auth/social/callback`;

    if (body.platform === "INSTAGRAM") {
      const clientId = Deno.env.get("META_APP_ID");
      if (!clientId) {
        return jsonResponse({ message: "Defina META_APP_ID e META_APP_SECRET para iniciar o OAuth oficial da Meta." });
      }
      const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", redirect);
      url.searchParams.set("state", `${userId}:INSTAGRAM`);
      url.searchParams.set("scope", "instagram_content_publish,instagram_basic,pages_show_list");
      return jsonResponse({ url: url.toString() });
    }

    const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    if (!clientKey) {
      return jsonResponse({ message: "Defina TIKTOK_CLIENT_KEY e TIKTOK_CLIENT_SECRET para o Direct Post." });
    }
    const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
    url.searchParams.set("client_key", clientKey);
    url.searchParams.set("redirect_uri", redirect);
    url.searchParams.set("state", `${userId}:TIKTOK`);
    url.searchParams.set("scope", "video.upload,video.publish");
    url.searchParams.set("response_type", "code");
    return jsonResponse({ url: url.toString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return jsonResponse({ error: message }, message === "unauthenticated" ? 401 : 500);
  }
});
