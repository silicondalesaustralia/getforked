export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  saasTools?: string;
  monthlySpend?: number;
  source?: string;
  industrySlug?: string;
  qualification?: Record<string, string | string[]>;
};

export function validateLeadPayload(value: unknown): LeadPayload | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const data = value as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();

  if (!name || !email.includes("@")) {
    return null;
  }

  const qualification: Record<string, string | string[]> = {};
  const qualificationFields = ["teamSize", "aggregator", "agencyType", "monthlySpendRange", "otherSoftware"];

  for (const field of qualificationFields) {
    const fieldValue = String(data[field] ?? "").trim();
    if (fieldValue) {
      qualification[field] = fieldValue;
    }
  }

  if (Array.isArray(data.softwareSelections) && data.softwareSelections.length > 0) {
    qualification.softwareSelections = data.softwareSelections.map(String);
  }

  return {
    name,
    email,
    phone: String(data.phone ?? "").trim() || undefined,
    businessType: String(data.businessType ?? "").trim() || undefined,
    saasTools:
      Array.isArray(data.softwareSelections) && data.softwareSelections.length > 0
        ? data.softwareSelections.map(String).join(", ")
        : String(data.saasTools ?? "").trim() || undefined,
    source: String(data.source ?? "site").trim(),
    industrySlug: String(data.industrySlug ?? "").trim() || undefined,
    monthlySpend:
      typeof data.monthlySpend === "number" ? data.monthlySpend : Number(data.monthlySpend ?? 0) || undefined,
    qualification,
  };
}
