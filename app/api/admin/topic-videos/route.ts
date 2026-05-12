import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";
import { createTopicVideo, queueTopicVideoJob } from "@/lib/video/service";

type CreatePayload = {
  sourceId?: string;
  sourceType?: string;
  topicContextJson?: Record<string, unknown>;
};

export async function GET() {
  try {
    const rows = await getDb().select().from(topicVideos).orderBy(desc(topicVideos.updatedAt)).limit(100);
    return NextResponse.json({ ok: true, items: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list topic videos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreatePayload;
    const sourceId = String(payload.sourceId ?? "").trim();
    if (!sourceId) {
      return NextResponse.json({ error: "sourceId is required." }, { status: 400 });
    }

    const video = await createTopicVideo({
      sourceId,
      sourceType: payload.sourceType,
      topicContextJson: payload.topicContextJson,
    });

    const queued = await queueTopicVideoJob({
      topicVideoId: video.id,
      jobKind: "create",
    });

    return NextResponse.json({
      ok: true,
      topicVideoId: video.id,
      status: queued.status,
      mode: queued.mode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create topic video.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
