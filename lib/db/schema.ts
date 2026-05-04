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
