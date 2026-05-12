export type BriefPayload = {
  projectType: string;
  tools: string[];
  problem: string;
  desiredOutcome: string;
  dataFlow: string;
  accessModel: string;
  budget: string;
  urgency: string;
  contactEmail: string;
  source: string;
  silo: string;
  page: string;
};

export type BuilderApplicationPayload = {
  name: string;
  email: string;
  slug: string;
  headline: string;
  bio: string;
  skills: string[];
  tools: string[];
};

export type ContactPayload = {
  name: string;
  email: string;
  company: string;
  reason: string;
  message: string;
  source: string;
};

function textValue(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function listValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => textValue(item, 80)).filter(Boolean);
  }
  return textValue(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
}

export function validateBriefPayload(input: unknown): BriefPayload | null {
  const record = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const payload = {
    projectType: textValue(record.projectType, 160),
    tools: listValue(record.tools),
    problem: textValue(record.problem),
    desiredOutcome: textValue(record.desiredOutcome),
    dataFlow: textValue(record.dataFlow),
    accessModel: textValue(record.accessModel),
    budget: textValue(record.budget, 80),
    urgency: textValue(record.urgency, 80),
    contactEmail: textValue(record.contactEmail, 180).toLowerCase(),
    source: textValue(record.source, 120),
    silo: textValue(record.silo, 50),
    page: textValue(record.page, 100),
  };
  if (!payload.projectType || !payload.problem || !payload.desiredOutcome || !isEmail(payload.contactEmail)) {
    return null;
  }
  return payload;
}

export function validateBuilderApplication(input: unknown): BuilderApplicationPayload | null {
  const record = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const name = textValue(record.name, 160);
  const email = textValue(record.email, 180).toLowerCase();
  const headline = textValue(record.headline, 180);
  const bio = textValue(record.bio);
  const payload = {
    name,
    email,
    slug: slugify(textValue(record.slug, 160) || name || email),
    headline,
    bio,
    skills: listValue(record.skills),
    tools: listValue(record.tools),
  };
  if (!payload.name || !isEmail(payload.email) || !payload.slug || !payload.headline || !payload.bio) {
    return null;
  }
  return payload;
}

export function validateContactPayload(input: unknown, source: string): ContactPayload | null {
  const record = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const payload = {
    name: textValue(record.name, 160),
    email: textValue(record.email, 180).toLowerCase(),
    company: textValue(record.company, 160),
    reason: textValue(record.reason, 80),
    message: textValue(record.message),
    source,
  };
  if (!payload.name || !isEmail(payload.email) || !payload.reason || !payload.message) {
    return null;
  }
  return payload;
}
