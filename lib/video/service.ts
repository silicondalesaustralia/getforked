import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";
import { enqueueTopicVideoJob } from "@/lib/video/job-queue";
import { shouldRunVideoInlineInLocal } from "@/lib/video/local-inline";
import { renderTopicVideo } from "@/lib/video/render-pipeline";
import type { TopicVideoJobKind } from "@/lib/video/types";

type CreateTopicVideoInput = {
  id?: string;
  sourceId: string;
  sourceType?: string;
  topicContextJson?: Record<string, unknown>;
};

type QueueTopicVideoInput = {
  topicVideoId: string;
  jobKind: TopicVideoJobKind;
  payload?: Record<string, unknown>;
};

export async function createTopicVideo(input: CreateTopicVideoInput) {
  const db = getDb();
  const sourceType = input.sourceType ?? "topic";
  const topicContextJson = input.topicContextJson ?? {};

  if (input.id) {
    const existing = await db.select().from(topicVideos).where(eq(topicVideos.id, input.id));
    if (existing.length > 0) {
      return existing[0];
    }
  }

  const inserted = await db
    .insert(topicVideos)
    .values({
      sourceId: input.sourceId,
      sourceType,
      status: "queued",
      topicContextJson,
    })
    .returning();

  return inserted[0];
}

export async function queueTopicVideoJob(input: QueueTopicVideoInput) {
  await getDb()
    .update(topicVideos)
    .set({
      status: "queued",
      errorMessage: null,
      updatedAt: sql`now()`,
    })
    .where(eq(topicVideos.id, input.topicVideoId));

  if (shouldRunVideoInlineInLocal()) {
    await renderTopicVideo(input.topicVideoId);
    return { ok: true, status: "ready_for_review" as const, mode: "inline" as const };
  }

  const queued = await enqueueTopicVideoJob(input);
  return {
    ok: true,
    status: "queued" as const,
    mode: "worker" as const,
    queueId: queued.id,
  };
}

export async function queueExistingTopicVideoJob(topicVideoId: string, jobKind: TopicVideoJobKind) {
  const existing = await getTopicVideoById(topicVideoId);
  if (!existing) {
    return { ok: false as const, error: "Topic video not found." };
  }

  const queued = await queueTopicVideoJob({
    topicVideoId,
    jobKind,
  });
  return { ok: true as const, queued };
}

export async function getTopicVideoById(topicVideoId: string) {
  const rows = await getDb().select().from(topicVideos).where(eq(topicVideos.id, topicVideoId));
  return rows[0] ?? null;
}

export async function approveTopicVideo(topicVideoId: string, approvedBy: string) {
  const db = getDb();
  const existing = await getTopicVideoById(topicVideoId);
  if (!existing) {
    return { ok: false as const, error: "Topic video not found." };
  }
  if (existing.status !== "ready_for_review" && existing.status !== "rejected") {
    return { ok: false as const, error: "Only reviewable videos can be approved." };
  }

  await db
    .update(topicVideos)
    .set({
      status: "approved",
      approvedBy,
      approvedAt: sql`now()`,
      errorMessage: null,
      updatedAt: sql`now()`,
    })
    .where(eq(topicVideos.id, topicVideoId));

  return { ok: true as const };
}

export async function rejectTopicVideo(topicVideoId: string, reason?: string) {
  const existing = await getTopicVideoById(topicVideoId);
  if (!existing) {
    return { ok: false as const, error: "Topic video not found." };
  }
  if (existing.status !== "ready_for_review" && existing.status !== "approved") {
    return { ok: false as const, error: "Only reviewable videos can be rejected." };
  }

  await getDb()
    .update(topicVideos)
    .set({
      status: "rejected",
      errorMessage: reason ?? null,
      updatedAt: sql`now()`,
    })
    .where(eq(topicVideos.id, topicVideoId));

  return { ok: true as const };
}

