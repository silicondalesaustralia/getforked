import { NextResponse } from "next/server";
import { publishSocialPost } from "@/lib/social/service";
import { socialChannels, type SocialChannel } from "@/lib/social/types";

type Params = {
  params: Promise<{ id: string; channel: string }>;
};

export async function POST(_request: Request, context: Params) {
  try {
    const { id, channel } = await context.params;
    if (!socialChannels.includes(channel as SocialChannel)) {
      return NextResponse.json({ error: "Unsupported channel." }, { status: 400 });
    }

    const result = await publishSocialPost(id, channel as SocialChannel);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish social post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
