import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createDailyVideoBatch } from "@/lib/video/daily-batch";

export async function POST() {
  try {
    await createDailyVideoBatch();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create daily video batch.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  redirect("/admin/videos");
}
