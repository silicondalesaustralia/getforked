import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideoJobs } from "@/lib/db/schema";
import type { TopicVideoJobKind } from "@/lib/video/types";

type EnqueueVideoJobInput = {
  topicVideoId: string;
  jobKind: TopicVideoJobKind;
  payload?: Record<string, unknown>;
};

export async function enqueueTopicVideoJob(input: EnqueueVideoJobInput) {
  const payload = input.payload ?? {};
  const db = getDb();

  const existing = await db
    .select({ id: topicVideoJobs.id })
    .from(topicVideoJobs)
    .where(and(eq(topicVideoJobs.topicVideoId, input.topicVideoId), eq(topicVideoJobs.jobKind, input.jobKind)));

  if (existing.length > 0) {
    await db
      .update(topicVideoJobs)
      .set({
        jobKind: input.jobKind,
        status: "queued",
        payload,
        workerId: null,
        startedAt: null,
        errorMessage: null,
        updatedAt: sql`now()`,
      })
      .where(eq(topicVideoJobs.id, existing[0].id));

    return { id: existing[0].id, queued: false };
  }

  const inserted = await db
    .insert(topicVideoJobs)
    .values({
      topicVideoId: input.topicVideoId,
      jobKind: input.jobKind,
      status: "queued",
      payload,
    })
    .returning({ id: topicVideoJobs.id });

  return { id: inserted[0]?.id ?? null, queued: true };
}
