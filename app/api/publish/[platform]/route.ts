import { NextResponse } from "next/server";
import { publishToPlatform } from "@/lib/publish/adapters";
import type { PublishPlatform } from "@/lib/publish/types";

const supportedPlatforms: PublishPlatform[] = ["tiktok", "youtube", "instagram", "facebook", "twitter"];

type Params = {
  params: Promise<{ platform: string }>;
};

export async function POST(request: Request, context: Params) {
  try {
    const { platform } = await context.params;
    if (!supportedPlatforms.includes(platform as PublishPlatform)) {
      return NextResponse.json({ error: "Unsupported platform." }, { status: 400 });
    }

    const payload = (await request.json()) as {
      videoUrl?: string;
      title?: string;
      description?: string;
    };

    const result = await publishToPlatform(platform as PublishPlatform, {
      videoUrl: String(payload.videoUrl ?? ""),
      title: String(payload.title ?? ""),
      description: String(payload.description ?? ""),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Publish failed." }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected publish error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
