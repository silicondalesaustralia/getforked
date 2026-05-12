CREATE TYPE "public"."account_status" AS ENUM('active', 'expired', 'error');--> statement-breakpoint
CREATE TYPE "public"."industry_status" AS ENUM('draft', 'ready', 'published');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'converted');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('queued', 'publishing', 'published', 'failed');--> statement-breakpoint
CREATE TYPE "public"."social_post_lifecycle_status" AS ENUM('draft', 'publishing', 'published', 'publish_failed');--> statement-breakpoint
CREATE TYPE "public"."topic_video_job_kind" AS ENUM('create', 'regenerate', 'regenerate_music', 'regenerate_thumbnail');--> statement-breakpoint
CREATE TYPE "public"."topic_video_job_status" AS ENUM('queued', 'rendering', 'render_failed');--> statement-breakpoint
CREATE TYPE "public"."topic_video_status" AS ENUM('queued', 'rendering', 'render_failed', 'ready_for_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"status" "industry_status" DEFAULT 'draft' NOT NULL,
	"saas_tools" text[] DEFAULT '{}' NOT NULL,
	"pain_points" text[] DEFAULT '{}' NOT NULL,
	"monthly_cost" integer DEFAULT 0 NOT NULL,
	"meta_description" varchar(280) DEFAULT '' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "industries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(180) NOT NULL,
	"phone" varchar(40),
	"business_type" varchar(120),
	"source" varchar(80) DEFAULT 'site' NOT NULL,
	"industry_slug" varchar(120),
	"saas_tools" text,
	"monthly_spend" integer,
	"qualification" jsonb,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	"platform" varchar(40) NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"published_at" timestamp,
	"status" "post_status" DEFAULT 'queued' NOT NULL,
	"platform_post_id" varchar(160),
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar(40) NOT NULL,
	"account_name" varchar(120) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"status" "account_status" DEFAULT 'active' NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "social_channel_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" varchar(40) NOT NULL,
	"account_id" varchar(160) NOT NULL,
	"account_name" varchar(160) NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text,
	"expires_at" timestamp,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_video_id" uuid NOT NULL,
	"channel" varchar(40) NOT NULL,
	"variant" varchar(40) NOT NULL,
	"status" "social_post_lifecycle_status" DEFAULT 'draft' NOT NULL,
	"copy_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"external_post_id" varchar(200),
	"external_url" text,
	"published_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_video_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_video_id" uuid NOT NULL,
	"job_kind" "topic_video_job_kind" NOT NULL,
	"status" "topic_video_job_status" DEFAULT 'queued' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"worker_id" varchar(120),
	"started_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" varchar(160) NOT NULL,
	"source_type" varchar(80) DEFAULT 'topic' NOT NULL,
	"status" "topic_video_status" DEFAULT 'queued' NOT NULL,
	"topic_context_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"prompt_json" jsonb,
	"render_config_json" jsonb,
	"primary_video_url" text,
	"primary_thumbnail_url" text,
	"approved_at" timestamp,
	"approved_by" varchar(180),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_template" varchar(200) NOT NULL,
	"description_template" text DEFAULT '' NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"hashtags" text[] DEFAULT '{}' NOT NULL,
	"processing_status" varchar(40) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
