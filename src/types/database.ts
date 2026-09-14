import type { PlanTier } from "@/utils/plans";

export type ProfessionId =
  | "criador"
  | "empreendedor"
  | "marca"
  | "educador"
  | "coach"
  | "advogado"
  | "medico"
  | "dentista"
  | "psicologo"
  | "contador"
  | "corretor";

export type ScriptStatus = "IDEA" | "READY_TO_RECORD" | "RECORDED";
export type PostStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";
export type SocialPlatform = "INSTAGRAM" | "TIKTOK";
export type ChatRole = "user" | "assistant";

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  profession: string;
  niche: string | null;
  timezone: string;
  plan_tier: PlanTier;
  subscription_status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
  billing_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentScript {
  id: string;
  user_id: string;
  title: string;
  hook_text: string;
  body_text: string;
  cta_text: string;
  instagram_caption: string | null;
  tiktok_caption: string | null;
  ethical_theme: string | null;
  ethical_framing: string | null;
  compliance_notes: string | null;
  target_date: string;
  compliance_passed: boolean;
  status: ScriptStatus;
  created_at: string;
}

export interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  script_id: string | null;
  media_path: string;
  media_url: string;
  instagram_caption: string | null;
  tiktok_caption: string | null;
  scheduled_for: string;
  status: PostStatus;
  ig_media_id: string | null;
  tiktok_publish_id: string | null;
  error_log: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  user_id: string;
  platform: SocialPlatform;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  watch_time_avg_sec: number;
  synced_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name: string | null;
  token_expires_at: string | null;
  connected_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      content_scripts: { Row: ContentScript };
      chat_threads: { Row: ChatThread };
      chat_messages: { Row: ChatMessage };
      scheduled_posts: { Row: ScheduledPost };
      post_analytics: { Row: PostAnalytics };
      social_accounts: { Row: SocialAccount };
    };
  };
}
