import { NextResponse } from "next/server";
import { createDailyVideoBatch } from "@/lib/video/daily-batch";

export async function POST() {
  try {
    const result = await createDailyVideoBatch();
    return NextResponse.json({ ok: true, created: result.created, reused: result.reused, count: result.items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create daily video batch.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
