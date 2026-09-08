import { z } from "zod";

export const workspaceRoleSchema = z.enum([
  "OWNER",
  "ADMIN",
  "EDITOR",
  "VIEWER",
]);

export const subscriptionStatusSchema = z.enum([
  "pending",
  "trialing",
  "active",
  "past_due",
  "paused",
  "canceled",
  "suspended",
]);

export const uploadStatusSchema = z.enum([
  "pending",
  "uploaded",
  "processing",
  "ready",
  "failed",
]);

export const approvalStatusSchema = z.enum([
  "pending_review",
  "changes_requested",
  "approved",
]);

export const scheduleChannelSchema = z.enum([
  "instagram_feed",
  "instagram_reel",
  "instagram_story",
  "facebook_page",
]);

export const scheduleStatusSchema = z.enum([
  "scheduled",
  "publishing",
  "published",
  "failed",
]);

export const adCampaignStatusSchema = z.enum([
  "draft",
  "active",
  "paused",
  "failed",
]);

export const webhookProviderSchema = z.enum(["mercadopago", "meta"]);

export const webhookStatusSchema = z.enum([
  "received",
  "queued",
  "processing",
  "processed",
  "retryable",
  "dead_letter",
]);

export const metaConnectionStatusSchema = z.enum([
  "active",
  "expiring",
  "needs_reauth",
  "revoked",
]);

export const profileSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const workspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  timezone: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const workspaceMembershipSchema = z.object({
  workspaceId: z.uuid(),
  userId: z.uuid(),
  role: workspaceRoleSchema,
  createdAt: z.string(),
});

export const brandSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  name: z.string().min(1),
  niche: z.string(),
  valueProposition: z.string(),
  persona: z.record(z.string(), z.unknown()),
  targetAudience: z.string(),
  toneOfVoice: z.string(),
  voiceExamples: z.array(z.string()),
  forbiddenWords: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const mediaUploadSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  brandId: z.uuid(),
  uploadedById: z.uuid(),
  storageBucket: z.string(),
  storageKey: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  byteSize: z.number().int().nonnegative(),
  checksumSha256: z.string(),
  status: uploadStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const appSessionSchema = z.object({
  user: profileSchema,
  memberships: z.array(workspaceMembershipSchema),
});

export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type UploadStatus = z.infer<typeof uploadStatusSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type ScheduleChannel = z.infer<typeof scheduleChannelSchema>;
export type ScheduleStatus = z.infer<typeof scheduleStatusSchema>;
export type AdCampaignStatus = z.infer<typeof adCampaignStatusSchema>;
export type WebhookProvider = z.infer<typeof webhookProviderSchema>;
export type WebhookStatus = z.infer<typeof webhookStatusSchema>;
export type MetaConnectionStatus = z.infer<typeof metaConnectionStatusSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceMembership = z.infer<typeof workspaceMembershipSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type MediaUpload = z.infer<typeof mediaUploadSchema>;
export type AppSession = z.infer<typeof appSessionSchema>;
