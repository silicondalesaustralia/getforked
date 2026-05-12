import { NextResponse } from "next/server";
import { createTopicVideo, queueTopicVideoJob } from "@/lib/video/service";

type Params = {
  params: Promise<{ id: string }>;
};

type CreatePayload = {
  sourceId?: string;
  sourceType?: string;
  topicContextJson?: Record<string, unknown>;
};

export async function POST(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as CreatePayload;
    const sourceId = String(payload.sourceId ?? id).trim();
    if (!sourceId) {
      return NextResponse.json({ error: "sourceId is required." }, { status: 400 });
    }

    const video = await createTopicVideo({
      id,
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
    const message = error instanceof Error ? error.message : "Failed to create topic video job.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
