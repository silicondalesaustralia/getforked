import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getMusicTrackById } from "@/lib/video/music-tracks";

type Params = {
  params: Promise<{ trackId: string }>;
};

const MIME_BY_EXT: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
};

export async function GET(_request: Request, context: Params) {
  try {
    const { trackId } = await context.params;
    const track = getMusicTrackById(trackId);
    if (!track) {
      return NextResponse.json({ error: "Music track not found." }, { status: 404 });
    }
    const buffer = await readFile(track.filePath);
    const mime = MIME_BY_EXT[path.extname(track.filePath).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load music track.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
