const shortFormMap: Record<string, string> = {
  "google-sheets": "sheets",
  "google-calendar": "calendar",
  "google-forms": "forms",
  "google-drive": "drive",
  "google-contacts": "contacts",
  "microsoft-outlook": "outlook",
  "facebook-lead-ads": "fb-leads",
};

export function slugifyProgrammaticPart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normaliseZapierSlug(slug: string) {
  const parts = slugifyProgrammaticPart(slug)
    .split("-")
    .filter(Boolean);

  const joined = parts.join("-");
  for (const [longForm, shortForm] of Object.entries(shortFormMap)) {
    if (joined === longForm) {
      return shortForm === "sheets" ? "google-sheets" : joined;
    }
  }

  let normalised = joined;
  for (const [longForm, shortForm] of Object.entries(shortFormMap)) {
    normalised = normalised.replace(longForm, shortForm);
  }

  return normalised.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

export function zapierFullUrl(pageSlug: string) {
  return `/zapier/${normaliseZapierSlug(pageSlug)}/`;
}

export function splitToolList(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
