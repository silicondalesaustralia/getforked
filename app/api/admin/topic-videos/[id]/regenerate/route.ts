import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { queueExistingTopicVideoJob } from "@/lib/video/service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const result = await queueExistingTopicVideoJob(id, "regenerate");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to enqueue regenerate job.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  redirect("/admin/videos");
}
