import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { pageStatus, paymentStatus } from "@/lib/db/marketplace-schema";

export const noteSubjectType = pgEnum("note_subject_type", [
  "user",
  "tenant",
  "builder_application",
  "brief",
  "project",
  "milestone",
]);

export const taxonomyType = pgEnum("taxonomy_type", ["skill", "tool", "category"]);

export const internalNotes = pgTable("internal_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectType: noteSubjectType("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  authorUserId: uuid("author_user_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id"),
  action: varchar("action", { length: 120 }).notNull(),
  subjectType: varchar("subject_type", { length: 80 }).notNull(),
  subjectId: uuid("subject_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id"),
  milestoneId: uuid("milestone_id"),
  amountCents: integer("amount_cents").notNull(),
  buyerFeeCents: integer("buyer_fee_cents").notNull().default(0),
  builderPayoutCents: integer("builder_payout_cents").notNull().default(0),
  provider: varchar("provider", { length: 80 }).notNull().default("manual"),
  providerId: varchar("provider_id", { length: 180 }),
  status: paymentStatus("status").notNull().default("not_ready"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taxonomyTerms = pgTable("taxonomy_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: taxonomyType("type").notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pageSilos = pgTable("page_silos", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const programmaticPages = pgTable("programmatic_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  siloId: uuid("silo_id").notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  metaDescription: varchar("meta_description", { length: 280 }).notNull().default(""),
  status: pageStatus("status").notNull().default("draft"),
  contentJson: jsonb("content_json").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const csvImportBatches = pgTable("csv_import_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  siloId: uuid("silo_id"),
  filename: varchar("filename", { length: 240 }).notNull(),
  rowCount: integer("row_count").notNull().default(0),
  status: varchar("status", { length: 80 }).notNull().default("uploaded"),
  errorJson: jsonb("error_json").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
