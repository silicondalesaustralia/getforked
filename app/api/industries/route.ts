import { NextResponse } from "next/server";
import { industrySeed } from "@/lib/content/industry-seed";

export async function GET() {
  return NextResponse.json(industrySeed);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string; status?: string };
    if (!body.slug || !body.status) {
      return NextResponse.json({ error: "slug and status are required." }, { status: 400 });
    }

    const industry = industrySeed.find((item) => item.slug === body.slug);
    if (!industry) {
      return NextResponse.json({ error: "Industry not found." }, { status: 404 });
    }

    if (!["draft", "ready", "published"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    industry.status = body.status as "draft" | "ready" | "published";
    return NextResponse.json(industry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update industry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
