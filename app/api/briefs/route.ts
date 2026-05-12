import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { briefs } from "@/lib/db/marketplace-schema";
import { validateBriefPayload } from "@/lib/marketplace/validation";
import { sendNotification } from "@/lib/notifications/service";

export async function POST(request: Request) {
  try {
    const payload = validateBriefPayload(await request.json());
    if (!payload) {
      return NextResponse.json({ error: "Invalid brief payload." }, { status: 400 });
    }

    await getDb().insert(briefs).values({
      projectType: payload.projectType,
      tools: payload.tools,
      problem: payload.problem,
      desiredOutcome: payload.desiredOutcome,
      dataFlow: payload.dataFlow,
      accessModel: payload.accessModel,
      budget: payload.budget,
      urgency: payload.urgency,
      contactEmail: payload.contactEmail,
      tags: [payload.source, payload.silo, payload.page].filter(Boolean),
    });

    await sendNotification({
      type: "brief_submitted",
      recipient: "admin",
      subject: "New buyer brief submitted",
      metadata: {
        contactEmail: payload.contactEmail,
        projectType: payload.projectType,
        source: payload.source,
        silo: payload.silo,
        page: payload.page,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit brief.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
