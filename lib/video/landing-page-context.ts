import { getPublishedIndustries } from "@/lib/content/industries";
import { getStaticPage, getStaticPages } from "@/lib/content/static-pages";
import {
  getPublishedAiAutomationPageBySlug,
  getPublishedAiAutomationPages,
  getPublishedZapierPageBySlug,
  getPublishedZapierPages,
  type ProgrammaticPage,
} from "@/lib/programmatic-pages";
import type { LandingPageSourceType, LandingPageVideoCandidate, LandingPageVideoContext } from "@/lib/video/context-types";

const siteUrl = "https://getforked.dev";

export function listLandingPageVideoCandidates(): LandingPageVideoCandidate[] {
  return [
    ...getPublishedZapierPages().map((page) => toProgrammaticCandidate(page, 1000)),
    ...getPublishedAiAutomationPages().map((page) => toProgrammaticCandidate(page, 2000)),
    ...getStaticPages().map((page, index) => ({
      sourceId: page.id,
      sourceType: "static" as const,
      title: page.seoTitle,
      pageUrl: `${siteUrl}${page.path}`,
      priority: 3000 + index,
    })),
    ...getPublishedIndustries().map((industry, index) => ({
      sourceId: industry.slug,
      sourceType: "industry" as const,
      title: industry.pageTitle ?? `${industry.name} Software Replacement`,
      pageUrl: `${siteUrl}/industries/${industry.slug}/`,
      priority: 4000 + index,
    })),
  ];
}

export function buildLandingPageVideoContext(sourceType: string, sourceId: string): LandingPageVideoContext {
  if (sourceType === "zapier") return fromProgrammatic(requirePage(getPublishedZapierPageBySlug(sourceId), sourceId), "zapier");
  if (sourceType === "ai_automation") return fromProgrammatic(requirePage(getPublishedAiAutomationPageBySlug(sourceId), sourceId), "ai_automation");
  if (sourceType === "static") {
    const page = getStaticPage(sourceId);
    return baseContext({
      sourceId: page.id,
      sourceType: "static",
      pageUrl: `${siteUrl}${page.path}`,
      pageTitle: page.seoTitle,
      h1: page.h1,
      heroSummary: page.heroSummary,
      audience: "Business owners and operators reducing software waste.",
      painPoints: page.points,
      benefits: page.schemaAbout,
      proofPoints: page.schemaMentions,
      cta: { label: page.ctaLabel ?? "Submit Your Brief", url: `${siteUrl}${page.ctaHref ?? "/brief/new/"}` },
    });
  }
  if (sourceType === "industry") {
    const industry = getPublishedIndustries().find((item) => item.slug === sourceId);
    if (!industry) throw new Error(`Industry source not found: ${sourceId}`);
    return baseContext({
      sourceId: industry.slug,
      sourceType: "industry",
      pageUrl: `${siteUrl}/industries/${industry.slug}/`,
      pageTitle: industry.pageTitle ?? `${industry.name} Software Replacement | GetForked`,
      h1: industry.heroHeadline ?? `${industry.name}: Fork Your SaaS Stack`,
      heroSummary: industry.supportingText ?? industry.metaDescription,
      audience: `${industry.name} business owners and operators.`,
      painPoints: industry.painPoints.map((pain) => pain.title),
      benefits: industry.replacementRows?.map((row) => row.replacement) ?? industry.saasTools,
      proofPoints: industry.seoKeywords ?? industry.saasTools,
      cta: { label: "Submit Your Brief", url: `${siteUrl}/brief/new/` },
    });
  }
  throw new Error(`Unsupported video source type: ${sourceType}`);
}

function fromProgrammatic(page: ProgrammaticPage, sourceType: LandingPageSourceType) {
  return baseContext({
    sourceId: page.pageSlug,
    sourceType,
    pageUrl: `${siteUrl}${page.fullUrl}`,
    pageTitle: page.pageTitle,
    h1: page.h1Heading,
    heroSummary: page.heroSummary || page.introSummary || page.metaDescription,
    audience: sourceType === "zapier" ? "Businesses replacing fragile Zapier workflows." : "Businesses scoping AI-assisted workflow automation.",
    painPoints: [page.buyerPainPoint, page.problemSummary].filter(Boolean),
    benefits: [page.replacementSummary, page.customBuildContext, page.builderMatchFactors].filter(Boolean),
    proofPoints: [page.requiredBuilderBadges, page.trustProofElements, page.lastVerifiedNote].filter(Boolean),
    cta: { label: page.primaryCta || "Submit Your Brief", url: `${siteUrl}/brief/new/?source=${page.sourceParam}` },
  });
}

function toProgrammaticCandidate(page: ProgrammaticPage, basePriority: number): LandingPageVideoCandidate {
  return { sourceId: page.pageSlug, sourceType: page.siloSlug === "zapier" ? "zapier" : "ai_automation", title: page.pageTitle, pageUrl: `${siteUrl}${page.fullUrl}`, priority: basePriority + page.priority };
}

function baseContext(input: Omit<LandingPageVideoContext, "brand" | "compliance">): LandingPageVideoContext {
  return {
    ...input,
    brand: { name: "GetForked", siteUrl, colors: { background: "#050708", foreground: "#F4F7F5", accent: "#18E38A" } },
    compliance: {
      bannedClaims: ["guaranteed savings", "guaranteed results", "limited time", "best agency"],
      requiredPhrases: ["GetForked"],
    },
  };
}

function requirePage(page: ProgrammaticPage | null, sourceId: string) {
  if (!page) throw new Error(`Programmatic video source not found: ${sourceId}`);
  return page;
}
