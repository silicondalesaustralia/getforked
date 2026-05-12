import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const tenantType = pgEnum("tenant_type", ["buyer", "builder", "internal"]);
export const membershipRole = pgEnum("membership_role", ["owner", "admin", "member", "billing", "viewer"]);
export const membershipStatus = pgEnum("membership_status", ["active", "invited", "removed"]);
export const platformRole = pgEnum("platform_role", ["buyer", "builder", "admin", "super_admin"]);
export const builderStatus = pgEnum("builder_status", [
  "draft",
  "submitted",
  "pending_review",
  "approved",
  "rejected",
  "suspended",
  "inactive",
]);
export const briefStatus = pgEnum("brief_status", [
  "draft",
  "submitted",
  "in_review",
  "needs_info",
  "matching",
  "matched",
  "converted",
  "closed",
]);
export const invitationStatus = pgEnum("invitation_status", ["sent", "viewed", "accepted", "declined", "expired"]);
export const projectStatus = pgEnum("project_status", ["scoping", "active", "paused", "completed", "cancelled"]);
export const milestoneStatus = pgEnum("milestone_status", ["planned", "in_progress", "submitted", "approved", "paid"]);
export const paymentStatus = pgEnum("payment_status", ["not_ready", "pending", "paid", "failed", "refunded"]);
export const pageStatus = pgEnum("programmatic_page_status", ["draft", "review", "published", "archived"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull().default(""),
  role: platformRole("role").notNull().default("buyer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  type: tenantType("type").notNull(),
  website: varchar("website", { length: 240 }),
  country: varchar("country", { length: 120 }),
  timezone: varchar("timezone", { length: 120 }),
  industry: varchar("industry", { length: 160 }),
  companySize: varchar("company_size", { length: 80 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenantMemberships = pgTable("tenant_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").notNull(),
  role: membershipRole("role").notNull().default("member"),
  status: membershipStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const builderProfiles = pgTable("builder_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id"),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  headline: varchar("headline", { length: 180 }).notNull().default(""),
  bio: text("bio").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  tools: text("tools").array().notNull().default([]),
  samples: jsonb("samples").notNull().default([]),
  status: builderStatus("status").notNull().default("draft"),
  available: boolean("available").notNull().default(true),
  publicEnabled: boolean("public_enabled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const briefs = pgTable("briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  buyerUserId: uuid("buyer_user_id"),
  tenantId: uuid("tenant_id"),
  projectType: varchar("project_type", { length: 160 }).notNull(),
  tools: text("tools").array().notNull().default([]),
  problem: text("problem").notNull(),
  desiredOutcome: text("desired_outcome").notNull(),
  dataFlow: text("data_flow").notNull().default(""),
  accessModel: text("access_model").notNull().default(""),
  budget: varchar("budget", { length: 80 }).notNull(),
  urgency: varchar("urgency", { length: 80 }).notNull(),
  contactEmail: varchar("contact_email", { length: 180 }).notNull(),
  attachments: jsonb("attachments").notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  complexity: varchar("complexity", { length: 80 }),
  status: briefStatus("status").notNull().default("submitted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const builderInvitations = pgTable("builder_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  briefId: uuid("brief_id").notNull(),
  builderProfileId: uuid("builder_profile_id").notNull(),
  projectId: uuid("project_id"),
  status: invitationStatus("status").notNull().default("sent"),
  declineReason: text("decline_reason"),
  message: text("message").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  briefId: uuid("brief_id").notNull(),
  buyerTenantId: uuid("buyer_tenant_id"),
  builderProfileId: uuid("builder_profile_id"),
  name: varchar("name", { length: 180 }).notNull(),
  status: projectStatus("status").notNull().default("scoping"),
  paymentStatus: paymentStatus("payment_status").notNull().default("not_ready"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  amountCents: integer("amount_cents").notNull().default(0),
  status: milestoneStatus("status").notNull().default("planned"),
  dueAt: timestamp("due_at"),
});
