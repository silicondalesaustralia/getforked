import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { validateLeadPayload } from "@/lib/validation/lead";

export async function POST(request: Request) {
  try {
    const payload = validateLeadPayload(await request.json());
    if (!payload) {
      return NextResponse.json({ error: "Invalid lead payload." }, { status: 400 });
    }

    await getDb().insert(leads).values({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      businessType: payload.businessType,
      source: payload.source,
      industrySlug: payload.industrySlug,
      saasTools: payload.saasTools,
      monthlySpend: payload.monthlySpend,
      qualification: payload.qualification,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
