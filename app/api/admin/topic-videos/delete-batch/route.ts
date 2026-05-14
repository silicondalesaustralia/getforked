import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { deleteTopicVideosByGroup } from "@/lib/video/delete-videos";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const group = String(formData.get("group") ?? "pending");
    if (group !== "pending" && group !== "approved") {
      return NextResponse.json({ error: "Invalid delete group." }, { status: 400 });
    }

    await deleteTopicVideosByGroup(group);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete videos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  redirect("/admin/videos");
}
