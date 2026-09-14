import { getServiceClient } from "../_shared/auth.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  const service = getServiceClient();
  const { data: posts } = await service
    .from("scheduled_posts")
    .select("id, user_id, ig_media_id, tiktok_publish_id")
    .eq("status", "PUBLISHED")
    .limit(50);

  let synced = 0;
  for (const post of posts ?? []) {
    if (post.ig_media_id) {
      await service.from("post_analytics").upsert(
        {
          post_id: post.id,
          user_id: post.user_id,
          platform: "INSTAGRAM",
          views_count: 0,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          watch_time_avg_sec: 0,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "post_id,platform" },
      );
      synced += 1;
    }
    if (post.tiktok_publish_id) {
      await service.from("post_analytics").upsert(
        {
          post_id: post.id,
          user_id: post.user_id,
          platform: "TIKTOK",
          views_count: 0,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          watch_time_avg_sec: 0,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "post_id,platform" },
      );
      synced += 1;
    }
  }

  return jsonResponse({ synced });
});
