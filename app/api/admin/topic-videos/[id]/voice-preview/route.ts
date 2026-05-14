import { NextResponse } from "next/server";
import { buildVoicePreview } from "@/lib/video/voiceover-preview";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const voiceId = url.searchParams.get("voiceId")?.trim();
    if (!voiceId) {
      return NextResponse.json({ error: "voiceId is required." }, { status: 400 });
    }

    const audio = await buildVoicePreview({ topicVideoId: id, voiceId });
    return new NextResponse(audio, {
      headers: {
        "Content-Disposition": `inline; filename="voice-preview-${voiceId}.mp3"`,
        "Content-Length": String(audio.byteLength),
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build voice preview.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
