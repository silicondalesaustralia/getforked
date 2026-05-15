import { NextResponse } from "next/server";
import { getTopicVideoById } from "@/lib/video/service";
import { getPreviewVideo } from "@/lib/video/preview-renderer";

type Params = {
  params: Promise<{ id: string; variant: string }>;
};

export async function GET(_request: Request, context: Params) {
  try {
    const { id, variant } = await context.params;
    const video = await getTopicVideoById(id);
    if (!video?.renderConfigJson) {
      return NextResponse.json({ error: "Video render snapshot not found." }, { status: 404 });
    }

    const buffer = await getPreviewVideo({
      topicVideoId: id,
      renderConfig: video.renderConfigJson,
      variant,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Disposition": `inline; filename="${variant}"`,
        "Content-Length": String(buffer.byteLength),
        "Content-Type": "video/mp4",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to render video preview.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
