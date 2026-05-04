import { NextResponse } from "next/server";

type SchedulePayload = {
  videoId?: string;
  industryId?: string;
  platform?: string;
  scheduledAt?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SchedulePayload;
    if (!body.videoId || !body.industryId || !body.platform || !body.scheduledAt) {
      return NextResponse.json({ error: "Missing required schedule fields." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      status: "queued",
      queuedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create schedule.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
