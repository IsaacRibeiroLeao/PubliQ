import { getServiceClient } from "../_shared/auth.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

interface ScheduledPost {
  id: string;
  user_id: string;
  media_url: string;
  instagram_caption: string | null;
  tiktok_caption: string | null;
}

async function publishInstagram(post: ScheduledPost, accessToken: string, igUserId: string) {
  const container = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media?media_type=REELS&video_url=${encodeURIComponent(post.media_url)}&caption=${encodeURIComponent(post.instagram_caption ?? "")}&access_token=${accessToken}`,
    { method: "POST" },
  );
  const containerJson = (await container.json()) as { id?: string; error?: { message: string } };
  if (!container.ok || !containerJson.id) {
    throw new Error(containerJson.error?.message ?? "Falha ao criar container do Reels.");
  }

  const publish = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media_publish?creation_id=${containerJson.id}&access_token=${accessToken}`,
    { method: "POST" },
  );
  const publishJson = (await publish.json()) as { id?: string; error?: { message: string } };
  if (!publish.ok || !publishJson.id) {
    throw new Error(publishJson.error?.message ?? "Falha ao publicar o Reels.");
  }
  return publishJson.id;
}

async function publishTikTok(post: ScheduledPost, accessToken: string) {
  const init = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: (post.tiktok_caption ?? "").slice(0, 150),
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: post.media_url,
      },
    }),
  });
  const json = (await init.json()) as { data?: { publish_id?: string }; error?: { message: string } };
  if (!init.ok || !json.data?.publish_id) {
    throw new Error(json.error?.message ?? "Falha no TikTok Direct Post.");
  }
  return json.data.publish_id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  const service = getServiceClient();
  const { data: claimed, error } = await service.rpc("claim_due_posts", { batch_size: 10 });
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const posts = (claimed ?? []) as ScheduledPost[];
  const results = [];

  for (const post of posts) {
    try {
      const { data: accounts } = await service
        .from("social_accounts")
        .select("id, platform, account_id")
        .eq("user_id", post.user_id);

      let igMediaId: string | null = null;
      let tiktokPublishId: string | null = null;
      const errors: string[] = [];

      for (const account of accounts ?? []) {
        const { data: secret } = await service
          .schema("private")
          .from("social_account_secrets")
          .select("access_token")
          .eq("account_id", account.id)
          .maybeSingle();

        if (!secret?.access_token) {
          errors.push(`${account.platform}: token ausente`);
          continue;
        }

        try {
          if (account.platform === "INSTAGRAM") {
            igMediaId = await publishInstagram(post, secret.access_token, account.account_id);
          }
          if (account.platform === "TIKTOK") {
            tiktokPublishId = await publishTikTok(post, secret.access_token);
          }
        } catch (platformError) {
          errors.push(`${account.platform}: ${platformError instanceof Error ? platformError.message : "falha"}`);
        }
      }

      const failed = !igMediaId && !tiktokPublishId;
      await service
        .from("scheduled_posts")
        .update({
          status: failed ? "FAILED" : "PUBLISHED",
          ig_media_id: igMediaId,
          tiktok_publish_id: tiktokPublishId,
          error_log: errors.join(" | ") || null,
        })
        .eq("id", post.id);

      results.push({ id: post.id, status: failed ? "FAILED" : "PUBLISHED" });
    } catch (postError) {
      await service
        .from("scheduled_posts")
        .update({
          status: "FAILED",
          error_log: postError instanceof Error ? postError.message : "falha",
        })
        .eq("id", post.id);
    }
  }

  return jsonResponse({ processed: results.length, results });
});
