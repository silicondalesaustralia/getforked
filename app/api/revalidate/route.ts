import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const secret = typeof record.secret === "string" ? record.secret : "";
    const path = typeof record.path === "string" ? record.path : "";

    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!path || !path.startsWith("/")) {
      return NextResponse.json({ message: "Missing or invalid path" }, { status: 400 });
    }

    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to revalidate path" },
      { status: 500 },
    );
  }
}
