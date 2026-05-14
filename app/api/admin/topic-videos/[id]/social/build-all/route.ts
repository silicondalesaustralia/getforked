import { NextResponse } from "next/server";
import { buildAllSocialDrafts } from "@/lib/social/service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const result = await buildAllSocialDrafts(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build all social drafts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
