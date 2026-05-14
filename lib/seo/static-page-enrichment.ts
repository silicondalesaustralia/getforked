import { z } from "zod";
import type { StaticPageContent } from "@/lib/content/static-pages";

const text = (min: number, max: number) => z.string().min(min).max(max);

export const StaticPageEnrichmentSchema = z.object({
  seoTitle: text(20, 80),
  metaDescription: text(80, 180),
  h1: text(20, 110),
  heroSummary: text(80, 500),
  points: z.array(text(4, 90)).min(3).max(8),
  sections: z
    .array(z.object({ heading: text(8, 120), paragraphs: z.array(text(70, 700)).min(1).max(3) }))
    .min(1)
    .max(5),
  faq: z.array(z.object({ question: text(20, 140), answer: text(60, 500) })).min(2).max(5),
  schemaAbout: z.array(text(3, 80)).min(3).max(8),
  schemaMentions: z.array(text(3, 80)).min(3).max(10),
});

export type StaticPageEnrichment = z.infer<typeof StaticPageEnrichmentSchema>;

export type StaticWriterBrief = {
  centralEntity: string;
  contextualDomain: string;
  queryIntent: string;
  commercialJob: string;
  likelySearcher: string;
  pageMustAnswer: string[];
  informationGain: string;
  requiredEntities: string[];
  requiredNgrams: string[];
  avoidRepeating: string[];
  toneRules: string[];
};

export function buildStaticWriterBrief(page: StaticPageContent, siblings: StaticPageContent[]): StaticWriterBrief {
  const requiredEntities = unique([page.h1, ...page.schemaAbout, ...page.schemaMentions, ...page.points]).slice(0, 14);
  return {
    centralEntity: page.schemaAbout[0] ?? page.h1,
    contextualDomain: page.pageRole,
    queryIntent: page.searchIntent,
    commercialJob: page.commercialJob,
    likelySearcher: likelySearcher(page),
    pageMustAnswer: mustAnswer(page),
    informationGain: `This page should make ${page.path} useful as a standalone GetForked page, not just a generic company page.`,
    requiredEntities,
    requiredNgrams: unique(requiredEntities.flatMap((entity) => ngrams(entity))).slice(0, 24),
    avoidRepeating: siblings.flatMap((sibling) => [sibling.h1, sibling.heroSummary]).slice(0, 10),
    toneRules: [
      "Write like practical business owners and developers, not a generic software agency.",
      "Use own the workflow and reduce the SaaS tax where natural.",
      "Do not invent savings, client counts, timelines, guarantees, or proprietary process claims.",
      "Keep GetForked positioned as scoped brief plus approved builder matching.",
    ],
  };
}

export function buildStaticEnrichmentPrompt(page: StaticPageContent, writerBrief: StaticWriterBrief) {
  return [
    "You are enriching a static GetForked marketing page.",
    "There is no web research for this page. Use only the provided page record, writer brief, and GetForked positioning.",
    "Generate contextual SEO metadata and page copy before metadata is consumed by the route.",
    "SEO title must end with | GetForked unless the current title is a navigational brand title.",
    "Meta description must be specific to this page and describe the actual user intent.",
    "Use concrete entities and n-grams from the writer brief. Avoid generic software agency language.",
    "Do not invent exact savings, client counts, years in business, guarantees, or proprietary process names.",
    "Return valid JSON only with exactly the requested keys.",
    JSON.stringify({ page, writerBrief, outputShape: staticOutputShape }, null, 2),
  ].join("\n\n");
}

export function buildStaticQaPrompt(content: StaticPageEnrichment, page: StaticPageContent, writerBrief: StaticWriterBrief) {
  return [
    "Review this GetForked static page enrichment for SEO context, factual restraint, entity coverage, and repetition.",
    "Return JSON: {\"approved\": boolean, \"issues\": string[], \"scores\": {\"seo_alignment\": number, \"entity_coverage\": number, \"commercial_clarity\": number, \"repetition_risk\": number}}.",
    JSON.stringify({ page: compactPage(page), writerBrief, content }, null, 2),
  ].join("\n\n");
}

export function localStaticEnrichment(page: StaticPageContent): StaticPageEnrichment {
  return StaticPageEnrichmentSchema.parse({
    seoTitle: page.seoTitle,
    metaDescription: page.metaDescription,
    h1: page.h1,
    heroSummary: page.heroSummary,
    points: page.points,
    sections: page.sections,
    faq: page.faq,
    schemaAbout: page.schemaAbout,
    schemaMentions: page.schemaMentions,
  });
}

export function mergeStaticEnrichment(page: StaticPageContent, content: StaticPageEnrichment, model: string, issues: string[]) {
  return {
    ...page,
    ...content,
    enrichmentStatus: issues.length === 0 ? "enriched" : "needs_review",
    enrichmentModel: model,
    enrichmentNotes: issues.join("; "),
    updatedAt: new Date().toISOString(),
  };
}

export function staticQualityChecks(content: StaticPageEnrichment, writerBrief: StaticWriterBrief, siblings: StaticPageContent[]) {
  const issues: string[] = [];
  const fullText = [content.seoTitle, content.metaDescription, content.h1, content.heroSummary, ...content.points, ...content.sections.flatMap((section) => [section.heading, ...section.paragraphs])].join(" ");
  const lower = fullText.toLowerCase();
  const matchedEntities = writerBrief.requiredEntities.filter((entity) => lower.includes(entity.toLowerCase()));
  const matchedNgrams = writerBrief.requiredNgrams.filter((ngram) => ngram.split(/\s+/).length > 1 && lower.includes(ngram.toLowerCase()));
  if (!content.seoTitle.includes("GetForked")) issues.push("SEO title does not include GetForked.");
  if (matchedEntities.length < Math.min(4, writerBrief.requiredEntities.length)) issues.push("Static entity coverage is too thin.");
  if (matchedNgrams.length < Math.min(3, writerBrief.requiredNgrams.length)) issues.push("Static n-gram coverage is too thin.");
  if (roboticPatterns.some((pattern) => pattern.test(fullText))) issues.push("Copy contains generic marketing phrasing.");
  if (siblings.some((sibling) => jaccard(tokens(fullText), tokens(`${sibling.h1} ${sibling.heroSummary}`)) > 0.62)) {
    issues.push("Copy is too similar to another static page.");
  }
  return issues;
}

function likelySearcher(page: StaticPageContent) {
  if (page.pageRole === "home") return "A business owner trying to understand what GetForked does and whether it can reduce software waste.";
  if (page.pageRole === "audience") return "A buyer or builder deciding whether GetForked fits their role.";
  if (page.pageRole === "legal") return "A visitor looking for official policy or terms information.";
  return "A business owner or operator evaluating owned workflow replacement.";
}

function mustAnswer(page: StaticPageContent) {
  return [`What is this page about? ${page.h1}`, "How does it connect to owning workflows?", "What should the visitor do next?"];
}

function compactPage(page: StaticPageContent) {
  return { id: page.id, path: page.path, h1: page.h1, metaDescription: page.metaDescription };
}

function tokens(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/).filter((token) => token.length > 3));
}

function ngrams(value: string) {
  const words = [...tokens(value)];
  return words.flatMap((_, index) => [words.slice(index, index + 2).join(" "), words.slice(index, index + 3).join(" ")]).filter((item) => item.trim().includes(" "));
}

function jaccard(left: Set<string>, right: Set<string>) {
  const shared = [...left].filter((item) => right.has(item)).length;
  return shared / Math.max(1, left.size + right.size - shared);
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

const roboticPatterns = [/streamline operations/i, /enhance efficiency/i, /tailored solutions/i, /seamless integration/i];

const staticOutputShape = {
  seoTitle: "string",
  metaDescription: "string",
  h1: "string",
  heroSummary: "string",
  points: ["string", "string", "string"],
  sections: [{ heading: "string", paragraphs: ["string"] }],
  faq: [{ question: "string", answer: "string" }],
  schemaAbout: ["string", "string", "string"],
  schemaMentions: ["string", "string", "string"],
};
