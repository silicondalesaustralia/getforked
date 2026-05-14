import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { socialPosts, topicVideoJobs, topicVideos } from "@/lib/db/schema";

const pendingStatuses = ["queued", "rendering", "render_failed", "ready_for_review", "rejected"] as const;

export async function deleteTopicVideosByGroup(group: string) {
  const statuses = group === "approved" ? ["approved" as const] : pendingStatuses;
  const db = getDb();
  const rows = await db
    .select({ id: topicVideos.id })
    .from(topicVideos)
    .where(inArray(topicVideos.status, statuses));
  const ids = rows.map((row) => row.id);
  if (ids.length === 0) {
    return { deleted: 0 };
  }

  await db.delete(socialPosts).where(inArray(socialPosts.topicVideoId, ids));
  await db.delete(topicVideoJobs).where(inArray(topicVideoJobs.topicVideoId, ids));
  await db.delete(topicVideos).where(inArray(topicVideos.id, ids));
  return { deleted: ids.length };
}
