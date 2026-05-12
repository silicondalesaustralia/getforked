import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { builderProfiles, users } from "@/lib/db/marketplace-schema";
import { validateBuilderApplication } from "@/lib/marketplace/validation";
import { sendNotification } from "@/lib/notifications/service";

export async function POST(request: Request) {
  try {
    const payload = validateBuilderApplication(await request.json());
    if (!payload) {
      return NextResponse.json({ error: "Invalid builder application." }, { status: 400 });
    }

    const inserted = await getDb()
      .insert(users)
      .values({ email: payload.email, name: payload.name, role: "builder" })
      .onConflictDoUpdate({
        target: users.email,
        set: { name: payload.name, role: "builder" },
      })
      .returning({ id: users.id });

    const userId = inserted[0]?.id;
    if (!userId) {
      return NextResponse.json({ error: "Failed to create builder user." }, { status: 500 });
    }

    await getDb().insert(builderProfiles).values({
      userId,
      slug: payload.slug,
      headline: payload.headline,
      bio: payload.bio,
      skills: payload.skills,
      tools: payload.tools,
      status: "pending_review",
    });

    await sendNotification({
      type: "builder_applied",
      recipient: "admin",
      subject: "New builder application submitted",
      metadata: { email: payload.email, slug: payload.slug },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit builder application.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
