import type { EnrichedPageContent, EnrichmentQa } from "@/lib/ai/enrichment-schemas";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { displayName } from "@/lib/seo/display-names";
import { combinedKnowledge } from "@/lib/seo/tool-knowledge";
import { categoryForTool } from "@/lib/seo/workflow-taxonomy";
import { renderSeoBodyHtml } from "@/lib/programmatic/render-body-html";

export type EnrichedProgrammaticPage = ProgrammaticPage & {
  enrichmentStatus?: string;
  enrichmentVersion?: number;
  researchNotes?: Record<string, unknown>;
  nuancedContent?: EnrichedPageContent;
  enrichmentScores?: EnrichmentQa["scores"];
  similarityScores?: Record<string, unknown>;
  lastEnrichedAt?: string;
  enrichmentModel?: string;
  needsManualReview?: boolean;
  enrichmentNotes?: string;
};

export function classifyPage(page: ProgrammaticPage) {
  if (page.siloSlug === "zapier") {
    const primary = page.appPrimaryShort || page.appPrimary;
    const secondary = page.appSecondaryShort || page.appSecondary;
    return {
      page_type: page.pageType,
      primary_tool: primary,
      primary_tool_display: displayName(primary),
      secondary_tool: secondary,
      secondary_tool_display: displayName(secondary),
      workflow_category: categoryForTool(primary),
      business_context: page.uniqueContentAngle || page.macroContext,
    };
  }

  return {
    page_type: "ai_automation",
    primary_keyword: page.primaryKeyword,
    primary_keyword_display: displayName(page.primaryKeyword.replace(/\s+/g, "-")),
    workflow_category: page.appSecondaryShort || page.appSecondary || "workflow_process_automation",
    business_context: page.uniqueContentAngle || page.macroContext,
  };
}

export function enrichmentKnowledge(page: ProgrammaticPage) {
  return combinedKnowledge(page.appPrimaryShort || page.appPrimary, page.appSecondaryShort || page.appSecondary);
}

export function mergeEnrichment(
  page: ProgrammaticPage,
  content: EnrichedPageContent,
  qa: EnrichmentQa,
  model: string,
): EnrichedProgrammaticPage {
  return {
    ...page,
    pageTitle: content.seo_title,
    h1Heading: content.h1,
    metaDescription: content.meta_description,
    introSummary: content.hero_intro.join("\n\n"),
    heroSummary: content.hero_intro.join("\n\n"),
    problemSummary: content.problem_summary,
    replacementSummary: content.replacement_summary,
    workflowBeforeLabel: content.before_flow,
    workflowAfterLabel: content.after_flow,
    zapierCostContext: content.cost_context,
    builderMatchFactors: content.builder_matching_summary,
    requiredBuilderBadges: content.builder_skill_tags.join(", "),
    bodyHtml: renderSeoBodyHtml(content),
    entityAttributePair: content.schema_about[0] || page.entityAttributePair,
    semanticTerms: [...content.schema_about, ...content.schema_mentions].join(", "),
    updatedAt: new Date().toISOString(),
    enrichmentStatus: qa.approved ? "enriched" : "needs_review",
    enrichmentVersion: 1,
    nuancedContent: content,
    enrichmentScores: qa.scores,
    lastEnrichedAt: new Date().toISOString(),
    enrichmentModel: model,
    needsManualReview: !qa.approved,
    enrichmentNotes: qa.issues.join("; "),
  };
}
