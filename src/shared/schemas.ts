import { z } from "zod";
import { PLAN_TIERS } from "@/utils/plans";

export const generateScopeSchema = z.enum(["day", "week", "month"]);

export const generateContentSchema = z.object({
  prompt: z.string().trim().min(8).max(4000),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scope: generateScopeSchema.default("day"),
  threadId: z.string().uuid().optional(),
});

export type GenerateContentInput = z.infer<typeof generateContentSchema>;

export const contentScriptCardSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  hookText: z.string(),
  bodyText: z.string(),
  ctaText: z.string(),
  instagramCaption: z.string(),
  tiktokCaption: z.string(),
  ethicalTheme: z.string(),
  ethicalFraming: z.string(),
  compliancePassed: z.boolean(),
  complianceNotes: z.string(),
  targetDate: z.string(),
});

export type ContentScriptCard = z.infer<typeof contentScriptCardSchema>;

export const usageSnapshotSchema = z.object({
  plan_tier: z.enum(PLAN_TIERS),
  unlimited: z.boolean(),
  prompts_used_today: z.number().int(),
  daily_prompt_limit: z.number().int().nullable(),
  remaining: z.number().int().nullable(),
  local_today: z.string(),
});

export type UsageSnapshot = z.infer<typeof usageSnapshotSchema>;

export const schedulePostSchema = z.object({
  scriptId: z.string().uuid(),
  mediaPath: z.string().min(1),
  scheduledFor: z.iso.datetime(),
  platforms: z.array(z.enum(["INSTAGRAM", "TIKTOK"])).min(1),
});

export type SchedulePostInput = z.infer<typeof schedulePostSchema>;
