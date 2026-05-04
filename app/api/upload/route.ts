import { NextResponse } from "next/server";
import { createUploadUrl } from "@/lib/storage/s3";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { filename?: string; contentType?: string };
    const filename = body.filename?.trim();
    const contentType = body.contentType?.trim();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "filename and contentType are required." }, { status: 400 });
    }

    const key = `videos/${Date.now()}-${filename}`;
    const uploadUrl = await createUploadUrl(key, contentType);
    return NextResponse.json({ key, uploadUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prepare upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
