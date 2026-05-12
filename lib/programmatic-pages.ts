import zapierPagesData from "@/content/generated/zapier-pages.json";
import aiAutomationPagesData from "@/content/generated/ai-automation-pages.json";

export type ProgrammaticPage = {
  id: string;
  siloSlug: string;
  pageSlug: string;
  fullUrl: string;
  pageType:
    | "zapier_index"
    | "zapier_hub"
    | "zapier_pair"
    | "ai_automation_index"
    | "ai_automation_hub"
    | "ai_automation_sub_hub"
    | "ai_automation_leaf";
  status: "draft" | "review" | "published" | "archived";
  priority: number;
  pageTitle: string;
  h1Heading: string;
  metaDescription: string;
  canonicalUrl: string;
  centralEntity: string;
  attribute: string;
  entityAttributePair: string;
  macroContext: string;
  microContexts: string;
  centralSearchIntent: string;
  sourceContextBridge: string;
  contextualVector: string;
  appPrimary: string | null;
  appSecondary: string | null;
  appPrimaryShort: string | null;
  appSecondaryShort: string | null;
  integrationDirection: string;
  triggerEvent: string;
  destinationAction: string;
  introSummary: string;
  heroSummary: string;
  problemSummary: string;
  replacementSummary: string;
  uniqueContentAngle: string;
  bodyHtml: string;
  supplementaryBridge: string;
  mainContentFormat: string;
  primaryCta: string;
  secondaryCta: string;
  briefPrefillCategory: string;
  briefPrefillTools: string;
  buyerPainPoint: string;
  projectType: string;
  sourceParam: string;
  zapierCostContext: string;
  estimatedTaskVolume: string;
  customBuildContext: string;
  costComparisonHtml: string;
  builderSkillProfile: string;
  builderMatchFactors: string;
  requiredBuilderBadges: string;
  trustProofElements: string;
  groundednessSignals: string;
  temporalFreshness: string;
  lastVerifiedNote: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  semanticTerms: string;
  rootLink: string;
  seedLinks: string;
  nodeLinks: string;
  crossSiloLinks: string;
  anchorTexts: string;
  relatedPageIds: string;
  imageAltPrimary: string;
  imageUrlSlug: string;
  workflowBeforeLabel: string;
  workflowAfterLabel: string;
  schemaType: string;
  updatedAt: string;
};

export type ProgrammaticPageStatus = ProgrammaticPage["status"];

const zapierPages = zapierPagesData as ProgrammaticPage[];
const aiAutomationPages = aiAutomationPagesData as ProgrammaticPage[];
const allPages = [...zapierPages, ...aiAutomationPages];

export function getProgrammaticPageByUrl(fullUrl: string) {
  return allPages.find((page) => page.fullUrl === fullUrl && page.status === "published") ?? null;
}

export function getPublishedZapierPageBySlug(pageSlug: string) {
  return zapierPages.find((page) => page.pageSlug === pageSlug && page.status === "published") ?? null;
}

export function getPublishedZapierPages(pageTypes: string[] = ["zapier_hub", "zapier_pair"]) {
  return zapierPages
    .filter((page) => page.siloSlug === "zapier" && page.status === "published" && pageTypes.includes(page.pageType))
    .sort((a, b) => a.priority - b.priority || a.pageTitle.localeCompare(b.pageTitle));
}

export function getZapierSiloIndexPage() {
  return zapierPages.find((page) => page.pageType === "zapier_index" && page.status === "published") ?? null;
}

export function getPublishedAiAutomationPageBySlug(pageSlug: string) {
  return aiAutomationPages.find((page) => page.pageSlug === pageSlug && page.status === "published") ?? null;
}

export function getPublishedAiAutomationPages(
  pageTypes: string[] = ["ai_automation_hub", "ai_automation_sub_hub", "ai_automation_leaf"],
) {
  return aiAutomationPages
    .filter((page) => page.siloSlug === "ai-automation" && page.status === "published" && pageTypes.includes(page.pageType))
    .sort((a, b) => a.priority - b.priority || a.pageTitle.localeCompare(b.pageTitle));
}

export function getAiAutomationSiloIndexPage() {
  return aiAutomationPages.find((page) => page.pageType === "ai_automation_index" && page.status === "published") ?? null;
}

export function getRelatedPages(page: ProgrammaticPage) {
  const candidateSlugs = [
    ...extractZapierSlugs(page.seedLinks),
    ...extractZapierSlugs(page.nodeLinks),
    ...extractZapierSlugs(page.relatedPageIds),
  ].filter((slug) => slug !== page.pageSlug);

  if (candidateSlugs.length > 0) {
    const related = allPages.filter((candidate) => candidate.status === "published" && candidateSlugs.includes(candidate.pageSlug));
    if (related.length > 0) {
      return related.slice(0, 5);
    }
  }

  const appFilters = [page.appPrimaryShort, page.appSecondaryShort, page.appPrimary, page.appSecondary].filter(isString);

  return allPages
    .filter((candidate) => candidate.status === "published" && candidate.siloSlug === page.siloSlug)
    .filter((candidate) => candidate.id !== page.id)
    .filter((candidate) =>
      [candidate.appPrimaryShort, candidate.appSecondaryShort, candidate.appPrimary, candidate.appSecondary]
        .filter(isString)
        .some((tool) => appFilters.includes(tool)),
    )
    .slice(0, 5);
}

function extractZapierSlugs(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,;\s]+/)
    .map((item) => {
      const match = item.match(/\/zapier\/([^/]+)\//);
      return match?.[1] ?? "";
    })
    .filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function isString(value: string | null): value is string {
  return Boolean(value);
}
