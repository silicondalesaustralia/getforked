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

export type SemanticPageClassification = {
  page_type: string;
  search_intent: "replacement" | "comparison" | "integration" | "service" | "workflow" | "tool_pair" | "informational";
  page_role: "hub" | "leaf" | "tool_page" | "tool_pair_page" | "service_page";
  buyer_stage: "problem_aware" | "solution_aware" | "provider_aware";
  commercial_job: "educate" | "qualify" | "scope" | "convert_to_brief";
  semantic_angle: string;
  primary_tool?: string;
  primary_tool_display?: string;
  secondary_tool?: string | null;
  secondary_tool_display?: string;
  primary_keyword?: string;
  primary_keyword_display?: string;
  workflow_category: string;
  business_context: string;
  use_framing?: Record<string, unknown>;
};

const aiAutomationFramings: Record<string, Record<string, unknown>> = {
  "business-process-automation-with-ai": {
    angle: "process ownership across admin, reporting, sales, and support workflows",
    scenarios: ["approval routing for cross-team requests", "reporting workflow that turns submissions into dashboard updates", "support handoff with triage, review, and CRM updates"],
    comparison_frame: "generic AI assistant vs owned business process system",
    buyer_profile: "operations lead replacing manual handoffs and spreadsheet checks",
  },
  "business-process-automation-ai": {
    angle: "process ownership across admin, reporting, sales, and support workflows",
    scenarios: ["approval routing for cross-team requests", "reporting workflow that turns submissions into dashboard updates", "support handoff with triage, review, and CRM updates"],
    comparison_frame: "generic AI assistant vs owned business process system",
    buyer_profile: "operations lead replacing manual handoffs and spreadsheet checks",
  },
  "ai-automation-agency": {
    angle: "agency alternative and builder-matching service selection",
    scenarios: ["service quote intake routed to builder matching", "AI chatbot scope reviewed before build assignment", "automation brief matched by tools, data access, and delivery risk"],
    comparison_frame: "generic agency retainer vs scoped approved-builder match",
    buyer_profile: "business owner comparing providers for a first AI automation build",
  },
  "ai-automation-consulting": {
    angle: "consulting and scoping before implementation",
    scenarios: ["workflow audit before builder selection", "data access review before AI workflow build", "implementation roadmap for internal process automation"],
    comparison_frame: "strategy-only consulting vs builder-ready scoped brief",
    buyer_profile: "operator who needs implementation clarity before spending on build work",
  },
  "ai-automation-consultant": {
    angle: "individual consultant selection and scope validation",
    scenarios: ["technical scoping call for a workflow bottleneck", "integration feasibility review", "AI control and review plan before implementation"],
    comparison_frame: "single consultant search vs matched builder shortlist",
    buyer_profile: "business owner validating a practical automation brief",
  },
  "ai-automation-services": {
    angle: "done-for-you implementation service selection",
    scenarios: ["support workflow implementation", "reporting automation delivery", "CRM handoff automation"],
    comparison_frame: "service package vs owned workflow build",
    buyer_profile: "team lead who wants implementation without hiring internally",
  },
  "ai-automation-software": {
    angle: "replacing existing software tools",
    scenarios: ["ticket triage software replacement", "CRM routing rule replacement", "reporting dashboard summary workflow"],
    comparison_frame: "licensed software vs owned AI workflow",
    buyer_profile: "ops manager consolidating tools",
  },
  "ai-automation-solutions": {
    angle: "end-to-end solution design",
    scenarios: ["sales-to-fulfillment orchestration", "multi-system exception handling", "AI layer over a legacy stack"],
    comparison_frame: "consulting engagement vs scoped builder match",
    buyer_profile: "leader scoping a transformation project",
  },
  "ai-automation-tools": {
    angle: "individual tool capabilities and selection",
    scenarios: ["support ticket classification", "meeting-note summarization", "invoice data extraction"],
    comparison_frame: "point tool vs composed custom workflow",
    buyer_profile: "technical lead comparing components",
  },
  "ai-automation-platform": {
    angle: "platform-level infrastructure and governance",
    scenarios: ["multi-department AI platform", "audited AI execution environment", "self-hosted workflow controls"],
    comparison_frame: "managed platform subscription vs owned infrastructure",
    buyer_profile: "CTO or engineering manager",
  },
};

export function classifyPage(page: ProgrammaticPage): SemanticPageClassification {
  if (page.siloSlug === "zapier") {
    const primary = page.appPrimaryShort || page.appPrimary || page.pageSlug;
    const secondary = page.appSecondaryShort || page.appSecondary;
    const pair = Boolean(secondary);
    return {
      page_type: page.pageType,
      search_intent: pair ? "tool_pair" : "replacement",
      page_role: pair ? "tool_pair_page" : "tool_page",
      buyer_stage: "solution_aware",
      commercial_job: "convert_to_brief",
      semantic_angle: page.uniqueContentAngle || `Replace fragile ${displayName(primary)} Zapier workflows with owned workflow logic.`,
      primary_tool: primary,
      primary_tool_display: displayName(primary),
      secondary_tool: secondary,
      secondary_tool_display: secondary ? displayName(secondary) : undefined,
      workflow_category: categoryForTool(primary),
      business_context: page.uniqueContentAngle || page.macroContext,
    };
  }

  if (page.siloSlug === "shopify") {
    const primary = page.appPrimaryShort || page.appPrimary || page.pageSlug;
    const secondary = page.appSecondaryShort || page.appSecondary;
    const pair = Boolean(secondary);
    return {
      page_type: page.pageType,
      search_intent: pair ? "tool_pair" : "replacement",
      page_role: pair ? "tool_pair_page" : "tool_page",
      buyer_stage: "solution_aware",
      commercial_job: "convert_to_brief",
      semantic_angle:
        page.uniqueContentAngle ||
        `Replace ${displayName(primary)} app dependencies with an owned Shopify workflow the business controls.`,
      primary_tool: primary,
      primary_tool_display: displayName(primary),
      secondary_tool: secondary,
      secondary_tool_display: secondary ? displayName(secondary) : undefined,
      workflow_category: categoryForTool(primary),
      business_context: page.uniqueContentAngle || page.macroContext,
    };
  }

  return {
    page_type: "ai_automation",
    search_intent: page.pageSlug.includes("agency") || page.pageSlug.includes("service") || page.pageSlug.includes("consult")
      ? "service"
      : "workflow",
    page_role: page.pageType.endsWith("_index") ? "hub" : "leaf",
    buyer_stage: page.pageSlug.includes("agency") || page.pageSlug.includes("service") || page.pageSlug.includes("consult")
      ? "provider_aware"
      : "solution_aware",
    commercial_job: "convert_to_brief",
    semantic_angle: page.uniqueContentAngle || page.buyerPainPoint || page.primaryKeyword,
    primary_keyword: page.primaryKeyword,
    primary_keyword_display: displayName(page.primaryKeyword.replace(/\s+/g, "-")),
    workflow_category: page.appSecondaryShort || page.appSecondary || "workflow_process_automation",
    business_context: page.uniqueContentAngle || page.macroContext,
    use_framing: aiAutomationFramings[page.pageSlug] || inferAiFraming(page),
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

function inferAiFraming(page: ProgrammaticPage) {
  const keyword = page.primaryKeyword.toLowerCase();
  if (keyword.includes("sales")) {
    return {
      angle: "sales process acceleration",
      scenarios: ["lead scoring", "follow-up drafting", "pipeline exception alerts"],
      comparison_frame: "generic sales automation vs owned revenue workflow",
      buyer_profile: "sales or revenue operator",
    };
  }
  if (keyword.includes("customer") || keyword.includes("support") || keyword.includes("helpdesk")) {
    return {
      angle: "customer operations and support control",
      scenarios: ["ticket routing", "reply drafting", "escalation review"],
      comparison_frame: "support tool add-on vs governed custom workflow",
      buyer_profile: "support lead or business owner",
    };
  }
  if (keyword.includes("invoice") || keyword.includes("account") || keyword.includes("finance") || keyword.includes("payable")) {
    return {
      angle: "finance workflow accuracy and review",
      scenarios: ["invoice extraction", "approval routing", "exception reconciliation"],
      comparison_frame: "finance SaaS add-on vs owned approval workflow",
      buyer_profile: "finance or operations manager",
    };
  }
  return {
    angle: "specific business process ownership",
    scenarios: [page.uniqueContentAngle || page.macroContext, page.buyerPainPoint, page.projectType].filter(Boolean),
    comparison_frame: "rented automation tool vs owned workflow",
    buyer_profile: "business owner or operations lead",
  };
}
