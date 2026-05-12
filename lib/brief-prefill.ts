import type { ProgrammaticPage } from "@/lib/programmatic-pages";

export type BriefPrefill = {
  category?: string | null;
  tools?: string | null;
  source?: string | null;
  silo?: string | null;
  page?: string | null;
};

export function buildBriefUrl(page: ProgrammaticPage) {
  const params = new URLSearchParams();

  params.set("category", page.briefPrefillCategory || "replace-zapier");

  if (page.briefPrefillTools) {
    params.set("tools", page.briefPrefillTools);
  } else {
    const tools = [page.appPrimary, page.appSecondary].filter(Boolean).join(",");
    if (tools) {
      params.set("tools", tools);
    }
  }

  params.set("source", page.sourceParam || `zapier-${page.pageSlug}`);
  params.set("silo", page.siloSlug || "zapier");
  params.set("page", page.pageSlug);

  return `/brief/new/?${params.toString()}`;
}

export function projectTypeFromPrefill(prefill: BriefPrefill) {
  if (prefill.category === "replace-zapier" || prefill.silo === "zapier") {
    return "Zapier replacement workflow";
  }
  if (prefill.category === "ai-automation" || prefill.silo === "ai-automation") {
    return "AI automation build";
  }

  return prefill.category ?? "";
}
