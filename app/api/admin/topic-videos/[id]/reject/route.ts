import { NextResponse } from "next/server";
import { rejectTopicVideo } from "@/lib/video/service";

type Params = {
  params: Promise<{ id: string }>;
};

type RejectPayload = {
  reason?: string;
};

export async function POST(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as RejectPayload;
    const reason = payload.reason ? String(payload.reason).trim() : undefined;

    const result = await rejectTopicVideo(id, reason);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, status: "rejected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject topic video.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
