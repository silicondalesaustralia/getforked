import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const industryStatus = pgEnum("industry_status", ["draft", "ready", "published"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "qualified", "converted"]);
export const postStatus = pgEnum("post_status", ["queued", "publishing", "published", "failed"]);
export const accountStatus = pgEnum("account_status", ["active", "expired", "error"]);
export const topicVideoStatus = pgEnum("topic_video_status", [
  "queued",
  "rendering",
  "render_failed",
  "ready_for_review",
  "approved",
  "rejected",
]);
export const topicVideoJobKind = pgEnum("topic_video_job_kind", [
  "create",
  "regenerate",
  "regenerate_music",
  "regenerate_thumbnail",
]);
export const topicVideoJobStatus = pgEnum("topic_video_job_status", ["queued", "rendering", "render_failed"]);
export const socialPostLifecycleStatus = pgEnum("social_post_lifecycle_status", [
  "draft",
  "publishing",
  "published",
  "publish_failed",
]);

export const industries = pgTable("industries", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  status: industryStatus("status").notNull().default("draft"),
  saasTools: text("saas_tools").array().notNull().default([]),
  painPoints: text("pain_points").array().notNull().default([]),
  monthlyCost: integer("monthly_cost").notNull().default(0),
  metaDescription: varchar("meta_description", { length: 280 }).notNull().default(""),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  businessType: varchar("business_type", { length: 120 }),
  source: varchar("source", { length: 80 }).notNull().default("site"),
  industrySlug: varchar("industry_slug", { length: 120 }),
  saasTools: text("saas_tools"),
  monthlySpend: integer("monthly_spend"),
  qualification: jsonb("qualification"),
  status: leadStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  titleTemplate: varchar("title_template", { length: 200 }).notNull(),
  descriptionTemplate: text("description_template").notNull().default(""),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  hashtags: text("hashtags").array().notNull().default([]),
  processingStatus: varchar("processing_status", { length: 40 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduledPosts = pgTable("scheduled_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoId: uuid("video_id").notNull(),
  industryId: uuid("industry_id").notNull(),
  platform: varchar("platform", { length: 40 }).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  publishedAt: timestamp("published_at"),
  status: postStatus("status").notNull().default("queued"),
  platformPostId: varchar("platform_post_id", { length: 160 }),
  errorMessage: text("error_message"),
});

export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  platform: varchar("platform", { length: 40 }).notNull(),
  accountName: varchar("account_name", { length: 120 }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  status: accountStatus("status").notNull().default("active"),
  metadata: jsonb("metadata"),
});

export const topicVideos = pgTable("topic_videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: varchar("source_id", { length: 160 }).notNull(),
  sourceType: varchar("source_type", { length: 80 }).notNull().default("topic"),
  status: topicVideoStatus("status").notNull().default("queued"),
  topicContextJson: jsonb("topic_context_json").notNull().default({}),
  promptJson: jsonb("prompt_json"),
  renderConfigJson: jsonb("render_config_json"),
  primaryVideoUrl: text("primary_video_url"),
  primaryThumbnailUrl: text("primary_thumbnail_url"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by", { length: 180 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const topicVideoJobs = pgTable("topic_video_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicVideoId: uuid("topic_video_id").notNull(),
  jobKind: topicVideoJobKind("job_kind").notNull(),
  status: topicVideoJobStatus("status").notNull().default("queued"),
  payload: jsonb("payload").notNull().default({}),
  workerId: varchar("worker_id", { length: 120 }),
  startedAt: timestamp("started_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialPosts = pgTable("social_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicVideoId: uuid("topic_video_id").notNull(),
  channel: varchar("channel", { length: 40 }).notNull(),
  variant: varchar("variant", { length: 40 }).notNull(),
  status: socialPostLifecycleStatus("status").notNull().default("draft"),
  copyJson: jsonb("copy_json").notNull().default({}),
  externalPostId: varchar("external_post_id", { length: 200 }),
  externalUrl: text("external_url"),
  publishedAt: timestamp("published_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialChannelCredentials = pgTable("social_channel_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  channel: varchar("channel", { length: 40 }).notNull(),
  accountId: varchar("account_id", { length: 160 }).notNull(),
  accountName: varchar("account_name", { length: 160 }).notNull(),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  expiresAt: timestamp("expires_at"),
  scopes: text("scopes").array().notNull().default([]),
  metadata: jsonb("metadata").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
