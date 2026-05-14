import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideoJobs } from "@/lib/db/schema";
import { renderTopicVideo } from "@/lib/video/render-pipeline";
import { markTopicVideoRenderFailed } from "@/lib/video/status";

type ClaimedTopicVideoJob = {
  id: string;
  topicVideoId: string;
  jobKind: "create" | "regenerate" | "regenerate_music" | "regenerate_thumbnail";
};

export async function claimNextJob(workerId: string): Promise<ClaimedTopicVideoJob | null> {
  const db = getDb();
  const claimResult = await db.execute(sql<ClaimedTopicVideoJob[]>`
    WITH next AS (
      SELECT id
      FROM topic_video_jobs
      WHERE status = 'queued'
      ORDER BY updated_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE topic_video_jobs AS j
    SET status = 'rendering',
        worker_id = ${workerId},
        started_at = NOW(),
        updated_at = NOW()
    FROM next
    WHERE j.id = next.id
    RETURNING j.id, j.topic_video_id AS "topicVideoId", j.job_kind AS "jobKind";
  `);

  if (!claimResult.rows || claimResult.rows.length === 0) {
    return null;
  }

  const row = claimResult.rows[0];
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = String(row.id ?? "");
  const topicVideoId = String(row.topicVideoId ?? "");
  const jobKind = String(row.jobKind ?? "");
  if (!id || !topicVideoId) {
    return null;
  }
  if (
    jobKind !== "create" &&
    jobKind !== "regenerate" &&
    jobKind !== "regenerate_music" &&
    jobKind !== "regenerate_thumbnail"
  ) {
    return null;
  }

  return { id, topicVideoId, jobKind };
}

export async function processClaimedJob(job: ClaimedTopicVideoJob) {
  try {
    await renderTopicVideo(job.topicVideoId);

    await getDb()
      .delete(topicVideoJobs)
      .where(eq(topicVideoJobs.id, job.id));

    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process claimed topic video job.";
    await markTopicVideoRenderFailed(job.topicVideoId, message);
    await getDb()
      .update(topicVideoJobs)
      .set({
        status: "render_failed",
        errorMessage: message,
        updatedAt: sql`now()`,
      })
      .where(eq(topicVideoJobs.id, job.id));
    return { ok: false as const, error: message };
  }
}
