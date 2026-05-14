import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";

export async function markTopicVideoRenderFailed(topicVideoId: string, errorMessage: string) {
  await getDb()
    .update(topicVideos)
    .set({
      status: "render_failed",
      errorMessage,
      updatedAt: sql`now()`,
    })
    .where(eq(topicVideos.id, topicVideoId));
}
