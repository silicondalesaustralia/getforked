import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { updateTopicVideoPrompt } from "@/lib/video/prompt-editor";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const rawPrompt = String(formData.get("promptJson") ?? "").trim();
    const voiceId = String(formData.get("voiceId") ?? "").trim();
    const musicTrackId = String(formData.get("musicTrackId") ?? "").trim();
    if (!rawPrompt) {
      return NextResponse.json({ error: "Prompt JSON is required." }, { status: 400 });
    }

    const promptJson = parsePromptJson(rawPrompt);
    const result = await updateTopicVideoPrompt(id, promptJson, voiceId, musicTrackId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save voiceover script.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  redirect("/admin/videos");
}

function parsePromptJson(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Prompt JSON must be an object.");
  }
  return parsed as Record<string, unknown>;
}
