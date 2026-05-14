import { NextResponse } from "next/server";
import { publishAllSocialPosts } from "@/lib/social/service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const result = await publishAllSocialPosts(id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish all social posts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
