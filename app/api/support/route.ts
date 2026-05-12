import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { validateContactPayload } from "@/lib/marketplace/validation";
import { sendNotification } from "@/lib/notifications/service";

export async function POST(request: Request) {
  try {
    const payload = validateContactPayload(await request.json(), "support");
    if (!payload) {
      return NextResponse.json({ error: "Invalid support payload." }, { status: 400 });
    }

    await getDb().insert(leads).values({
      name: payload.name,
      email: payload.email,
      businessType: payload.company,
      source: payload.source,
      qualification: { reason: payload.reason, message: payload.message },
    });
    await sendNotification({ type: "support_submitted", recipient: "admin", subject: "New support request" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit support request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
