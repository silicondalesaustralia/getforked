import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { topicVideoJobs } from "@/lib/db/schema";
import { getTopicVideoById } from "@/lib/video/service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const video = await getTopicVideoById(id);
    if (!video) {
      return NextResponse.json({ error: "Topic video not found." }, { status: 404 });
    }

    const jobs = await getDb()
      .select()
      .from(topicVideoJobs)
      .where(eq(topicVideoJobs.topicVideoId, id))
      .orderBy(desc(topicVideoJobs.updatedAt))
      .limit(5);

    return NextResponse.json({
      ok: true,
      topicVideo: video,
      jobs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load topic video status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
