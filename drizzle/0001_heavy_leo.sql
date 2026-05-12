CREATE TYPE "public"."brief_status" AS ENUM('draft', 'submitted', 'in_review', 'needs_info', 'matching', 'matched', 'converted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."builder_status" AS ENUM('draft', 'submitted', 'pending_review', 'approved', 'rejected', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('sent', 'viewed', 'accepted', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('owner', 'admin', 'member', 'billing', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('active', 'invited', 'removed');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('planned', 'in_progress', 'submitted', 'approved', 'paid');--> statement-breakpoint
CREATE TYPE "public"."programmatic_page_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('not_ready', 'pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('buyer', 'builder', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('scoping', 'active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."tenant_type" AS ENUM('buyer', 'builder', 'internal');--> statement-breakpoint
CREATE TYPE "public"."note_subject_type" AS ENUM('user', 'tenant', 'builder_application', 'brief', 'project', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."taxonomy_type" AS ENUM('skill', 'tool', 'category');--> statement-breakpoint
CREATE TABLE "briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_user_id" uuid,
	"tenant_id" uuid,
	"project_type" varchar(160) NOT NULL,
	"tools" text[] DEFAULT '{}' NOT NULL,
	"problem" text NOT NULL,
	"desired_outcome" text NOT NULL,
	"data_flow" text DEFAULT '' NOT NULL,
	"access_model" text DEFAULT '' NOT NULL,
	"budget" varchar(80) NOT NULL,
	"urgency" varchar(80) NOT NULL,
	"contact_email" varchar(180) NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"complexity" varchar(80),
	"status" "brief_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builder_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"builder_profile_id" uuid NOT NULL,
	"project_id" uuid,
	"status" "invitation_status" DEFAULT 'sent' NOT NULL,
	"decline_reason" text,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "builder_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"slug" varchar(160) NOT NULL,
	"headline" varchar(180) DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"tools" text[] DEFAULT '{}' NOT NULL,
	"samples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "builder_status" DEFAULT 'draft' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"public_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "builder_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(180) NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"status" "milestone_status" DEFAULT 'planned' NOT NULL,
	"due_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"buyer_tenant_id" uuid,
	"builder_profile_id" uuid,
	"name" varchar(180) NOT NULL,
	"status" "project_status" DEFAULT 'scoping' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'not_ready' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" "membership_role" DEFAULT 'member' NOT NULL,
	"status" "membership_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"type" "tenant_type" NOT NULL,
	"website" varchar(240),
	"country" varchar(120),
	"timezone" varchar(120),
	"industry" varchar(160),
	"company_size" varchar(80),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(180) NOT NULL,
	"name" varchar(160) DEFAULT '' NOT NULL,
	"role" "platform_role" DEFAULT 'buyer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(120) NOT NULL,
	"subject_type" varchar(80) NOT NULL,
	"subject_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csv_import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"silo_id" uuid,
	"filename" varchar(240) NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(80) DEFAULT 'uploaded' NOT NULL,
	"error_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internal_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" "note_subject_type" NOT NULL,
	"subject_id" uuid NOT NULL,
	"author_user_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_silos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_silos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"milestone_id" uuid,
	"amount_cents" integer NOT NULL,
	"buyer_fee_cents" integer DEFAULT 0 NOT NULL,
	"builder_payout_cents" integer DEFAULT 0 NOT NULL,
	"provider" varchar(80) DEFAULT 'manual' NOT NULL,
	"provider_id" varchar(180),
	"status" "payment_status" DEFAULT 'not_ready' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programmatic_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"silo_id" uuid NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(220) NOT NULL,
	"meta_description" varchar(280) DEFAULT '' NOT NULL,
	"status" "programmatic_page_status" DEFAULT 'draft' NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "taxonomy_type" NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "taxonomy_terms_slug_unique" UNIQUE("slug")
);
