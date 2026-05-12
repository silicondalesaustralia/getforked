import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/config";
import { approveTopicVideo } from "@/lib/video/service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Params) {
  try {
    const session = await getServerSession(authOptions);
    const approver = session?.user?.email;
    if (!approver) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const result = await approveTopicVideo(id, approver);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, status: "approved" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve topic video.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
