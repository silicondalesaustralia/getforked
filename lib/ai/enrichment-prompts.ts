import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import type { SemanticPageClassification } from "@/lib/programmatic/page-enrichment";
import type { SemanticWriterBrief } from "@/lib/seo/writer-brief";

type Context = {
  page: ProgrammaticPage;
  classification: SemanticPageClassification;
  knowledge: Record<string, unknown>;
  research: Record<string, unknown>;
  writerBrief: SemanticWriterBrief;
  siblings?: SiblingContext[];
};

export type SiblingContext = {
  slug: string;
  problemSummary: string;
  replacementSummary: string;
  beforeFlow: string;
  afterFlow: string;
  costContext: string;
};

const outputRule =
  "Return valid JSON only. Do not echo the input context. Do not include current_page, classification, knowledge, explanations, Markdown, commentary, or code fences.";

const enrichmentShape = {
  seo_title: "string",
  h1: "string",
  meta_description: "string",
  hero_intro: ["string", "string"],
  problem_heading: "string",
  problem_summary: "string",
  failure_modes: ["string", "string", "string", "string"],
  replacement_heading: "string",
  replacement_summary: "string",
  replacement_cards: [{ title: "string", description: "string" }],
  before_flow: "string",
  after_flow: "string",
  cost_context: "string",
  when_zapier_is_still_right: "string for Zapier and Shopify replacement pages",
  human_in_the_loop: "string for AI pages only",
  builder_matching_summary: "string",
  builder_skill_tags: ["string", "string", "string"],
  seo_body_sections: [{ h2: "string", paragraphs: ["string"], h3_sections: [{ h3: "string", paragraph: "string" }] }],
  faq: [{ question: "string", answer: "string" }],
  schema_about: ["string", "string", "string"],
  schema_mentions: ["string", "string", "string"],
};

export type EnrichmentSectionName = "meta_hero" | "problem" | "replacement" | "flow" | "trust" | "builder" | "seo_body";

const sectionShapes: Record<EnrichmentSectionName, Record<string, unknown>> = {
  meta_hero: {
    seo_title: "string",
    h1: "string",
    meta_description: "string",
    hero_intro: ["string", "string"],
  },
  problem: {
    problem_heading: "string",
    problem_summary: "string",
    failure_modes: ["string", "string", "string", "string"],
  },
  replacement: {
    replacement_heading: "string",
    replacement_summary: "string",
    replacement_cards: [{ title: "string", description: "string" }],
  },
  flow: {
    before_flow: "string",
    after_flow: "string",
    cost_context: "string",
  },
  trust: {
    when_zapier_is_still_right: "string for Zapier and Shopify replacement pages",
    human_in_the_loop: "string for AI pages only",
  },
  builder: {
    builder_matching_summary: "string",
    builder_skill_tags: ["string", "string", "string"],
  },
  seo_body: {
    seo_body_sections: [{ h2: "string", paragraphs: ["string"], h3_sections: [{ h3: "string", paragraph: "string" }] }],
    faq: [{ question: "string", answer: "string" }],
    schema_about: ["string", "string", "string"],
    schema_mentions: ["string", "string", "string"],
  },
};

export function buildEnrichmentPrompt({ page, classification, knowledge, research, writerBrief, siblings = [] }: Context) {
  const isZapier = page.siloSlug === "zapier";
  const isShopify = page.siloSlug === "shopify";
  const isAi = page.siloSlug === "ai-automation";
  return [
    isZapier
      ? "You are enriching a GetForked Zapier replacement landing page."
      : isShopify
        ? "You are enriching a GetForked Shopify app replacement landing page."
        : "You are enriching a GetForked AI automation landing page.",
    "The URL, layout, CTA mechanics, styling, and internal-link architecture already exist. Replace generic boilerplate with useful page-specific copy.",
    "Use outcome-led SEO titles and H1s. Use builder language only in CTA or matching sections.",
    "Title/H1 format rules: seo_title must end with '| GetForked'; h1 must not end with 'Builders' or include a suffix pattern; never write ' |.' or malformed suffixes.",
    "Do not use 'builder' or 'builders' in meta_description, hero_intro, problem_summary, replacement_summary, before_flow, after_flow, or cost_context. Only use that term in builder_matching_summary or explicit matching CTA copy.",
    "Do not invent pricing, API limits, official feature support, compliance guarantees, or savings claims.",
    "Use correct product casing and commercially clear copy that leads toward brief submission.",
    "Use the writer_brief as the source of truth. Use research_context only to understand details.",
    "Do not paste raw research phrases, URLs, citations, or source snippets into the copy. Translate the meaning into natural sentences.",
    "Exact phrases are only required for product names, API objects, trigger names, or official feature names.",
    "Across the full output, include at least six concrete details from writer_brief.requiredEntities, writer_brief.entityAttributes, or writer_brief.requiredNgrams.",
    "Do NOT use generic patterns like 'teams usually notice breakage only after customer impact', 'workflow reliability issues', '[Tool] trigger -> process -> queue -> write', 'manual fixes across records', 'streamline operations', or 'enhance efficiency'.",
    "Do NOT use phrases like 'generic AI tool' or 'generic AI tools'. Name the actual workflow context and system touchpoints.",
    "Do NOT write before_flow or after_flow as arrow chains. Use one concrete sentence that names the actual workflow, tool/data context, and control gap.",
    "Sibling pages are negative examples. Do not reuse their openings, sentence skeletons, flow patterns, or repeated claims.",
    isZapier
      ? "For Zapier pair pages, explain the actual data movement between the two tools and the specific failure pattern a custom build would remove."
      : isShopify
        ? "For Shopify pages, explain the specific app workflow and the exact operational gap a custom build removes for the store owner."
      : aiPageRules(page, classification, research),
    isShopify ? shopifyRules(page, classification, research) : "",
    isAi ? aiAutomationRules() : "",
    siblingBlock(siblings),
    "Use this input context to generate new copy:",
    JSON.stringify({ current_page: compactPageContext(page), classification, knowledge, writer_brief: writerBrief, research_context: compactResearchContext(research) }, null, 2),
    "Return exactly one JSON object with this shape and these top-level keys:",
    JSON.stringify(enrichmentShape, null, 2),
    outputRule,
  ].join("\n\n");
}

export function buildSectionPrompt({
  section,
  page,
  classification,
  writerBrief,
  research,
  previous = {},
}: {
  section: EnrichmentSectionName;
  page: ProgrammaticPage;
  classification: SemanticPageClassification;
  writerBrief: SemanticWriterBrief;
  research: Record<string, unknown>;
  previous?: Record<string, unknown>;
}) {
  return [
    "You are writing one section group for a GetForked programmatic landing page.",
    `Section group: ${section}`,
    `Section intent: ${writerBrief.sectionIntents[section] || "Write useful, specific copy that supports the page goal."}`,
    "Return valid JSON only with exactly the requested keys for this section group.",
    "Use the writer_brief as the source of truth. Translate research into natural copy; do not paste URLs, citations, raw snippets, or awkward anchor phrases.",
    "Write for a practical business owner or operator. Avoid hype, filler, robotic phrasing, repeated ideas, and arrow-chain workflow text.",
    "before_flow and after_flow must be single plain-English sentences under 55 words.",
    "Keep each sentence under 35 words. For builder_matching_summary, use 2-3 short sentences instead of one long sentence.",
    "Failure-mode bullets must be complete phrases under 90 characters. Skill tags must be 2-5 words. Do not end bullets or tags with 'or', 'and', commas, periods after abbreviations, or unfinished fragments.",
    "For Zapier and Shopify replacement pages, always include when_zapier_is_still_right with practical trust positioning on when the current app/tool is still right. For AI pages, include human-in-the-loop controls.",
    JSON.stringify(
      {
        page: compactPageContext(page),
        classification,
        writer_brief: writerBrief,
        research_context: compactResearchContext(research),
        previous_sections: previous,
        output_shape: sectionShapes[section],
      },
      null,
      2,
    ),
    outputRule,
  ].join("\n\n");
}

function aiAutomationRules() {
  return [
    "AI AUTOMATION DIFFERENTIATION RULES:",
    "- Use the classification.use_framing angle, scenarios, comparison_frame, and buyer_profile directly.",
    "- problem_summary must name the specific buyer situation, not generic disconnected AI output.",
    "- replacement_summary must explain the owned workflow being built and the review/control model.",
    "- before_flow and after_flow must be concrete sentences, not arrow chains, and must describe a use case from use_framing.scenarios.",
    "- builder_matching_summary must mention the page scenario, data access, integration constraints, and review risk.",
    "- Avoid phrases like 'enhance efficiency', 'optimize operations', 'tailored solutions', 'seamless integration', and 'essential human touch'.",
    "- AI agency/service pages should frame GetForked as builder matching, not as an agency selling a generic automation package.",
  ].join("\n");
}

function shopifyRules(page: ProgrammaticPage, classification: SemanticPageClassification, research: Record<string, unknown>) {
  return [
    "SHOPIFY DIFFERENTIATION RULES:",
    "- Frame this as replacing a Shopify app dependency with an owned workflow, not generic ecommerce advice.",
    "- problem_summary must name a concrete store operation (orders, subscriptions, fulfillment, inventory, feed sync, etc.) and the exact control gap.",
    "- replacement_summary must explain how the owned build handles rules, exceptions, and change control in plain English.",
    "- failure_modes must be complete, specific fragments that can stand alone; never end with unfinished tails like 'because the', 'so checkout', or dangling connectors.",
    "- before_flow and after_flow must reference real store events and operational handoffs, not abstract statements.",
    "- when_zapier_is_still_right must explicitly explain both: (1) when the current Shopify app is still fine, and (2) when replacement becomes worth scoping.",
    "- builder_matching_summary must mention scope clarity, app overlap, integration constraints, and handover expectations.",
    "- Use at least one phrase from research_context in each of: problem_summary, before_flow, after_flow, and builder_matching_summary.",
    `- Keep the angle aligned with this page: ${page.uniqueContentAngle || classification.semantic_angle || page.primaryKeyword}.`,
    `- Ground copy in this workflow context: ${String(research.realWorldScenario || page.buyerPainPoint || page.primaryKeyword)}.`,
  ].join("\n");
}

function aiPageRules(page: ProgrammaticPage, classification: Record<string, unknown>, research: Record<string, unknown>) {
  const framing = (classification.use_framing as Record<string, unknown> | undefined) || {};
  const scenarios = toList(framing.scenarios);
  return [
    "For AI automation pages, differentiation must come from use-case framing, not generic AI benefits.",
    `This page's angle is: ${String(framing.angle || page.uniqueContentAngle || page.primaryKeyword)}.`,
    `Primary scenario to write around: ${scenarios[0] || page.uniqueContentAngle || page.buyerPainPoint}.`,
    `Buyer profile: ${String(framing.buyer_profile || "business owner or operations lead")}.`,
    `Comparison frame: ${String(framing.comparison_frame || "rented automation tool vs owned workflow")}.`,
    `Real workflow scenario: ${String(research.realWorldScenario || page.buyerPainPoint)}.`,
    "The before_flow must (a) name the primary scenario above, (b) reference the page's primary_keyword or its closest natural synonym at least once, and (c) explain the current manual handoff or review gap. The after_flow must do the same for the owned workflow control.",
    "The problem_summary must name the buyer's concrete workflow, trigger, and failure mode. The replacement_summary must explain the owned workflow design.",
    "The builder_matching_summary must explicitly weave in at least three of the supplied research_context items: a named entity_example, a named trigger_example, a named pairSpecificFailure or apiConstraint, and either the realWorldScenario phrase or the page primary_keyword. Use them naturally rather than as a list.",
    "Forbidden phrases anywhere in the output: 'tailored AI automation', 'tailored AI automation system', 'tailored AI automation services', 'enhanced business workflows', 'streamline your business operations', 'custom AI automation solutions'. If you wrote one, replace the entire sentence.",
  ].join("\n");
}

export function buildRevisionPrompt(
  content: unknown,
  issues: string[],
  page: ProgrammaticPage,
  research: Record<string, unknown>,
  writerBrief: SemanticWriterBrief,
  siblings: SiblingContext[] = [],
) {
  return [
    "Revise this generated page content to fix hard issues. Return JSON only.",
    "Do not paraphrase lightly. Rewrite weak sections with tool-specific operational detail from research_context.",
    "Critical: fix all listed issues. If an issue references a section, rewrite that section completely.",
    "When issues mention title/H1 guidelines, regenerate seo_title and h1 to follow exact format rules: seo_title ends with '| GetForked', h1 has no suffix marker, and neither ends with 'Builders'.",
    "When issues mention usage of 'builders' in meta description or summaries, rewrite meta_description, hero_intro, problem_summary, replacement_summary, before_flow, after_flow, and cost_context to remove those terms entirely, while keeping builder terminology only in builder_matching_summary.",
    "When issues mention missing research-specific tokens or research-grounded detail in replacement_summary or after_flow, include at least one exact phrase from research_context in each cited section.",
    "When issues mention before_flow generic template phrasing, rewrite before_flow to remove terms like 'generic AI tools' and include a concrete scenario plus one explicit research_context phrase.",
    "Use writer_brief.requiredEntities, writer_brief.entityAttributes, and writer_brief.requiredNgrams for meaning and coverage. Do not force exact phrases unless they are product names or official object/event names.",
    "If a similarity issue is listed, use a new opening, new sentence structure, and a different business scenario. Do not just swap synonyms.",
    "Do not use broad AI filler like 'enhance efficiency', 'optimal business efficiency', 'elevate your business', 'tailored AI automation services', 'streamline your business operations', or 'custom AI automation solutions'.",
    "Do not write before_flow or after_flow as arrow chains. Use one concrete sentence that names the actual workflow, tool/data context, and control gap.",
    siblingBlock(siblings),
    JSON.stringify(
      {
        page: { pageSlug: page.pageSlug, pageType: page.pageType, siloSlug: page.siloSlug },
        writer_brief: writerBrief,
        research_context: compactResearchContext(research),
        issues,
        content,
      },
      null,
      2,
    ),
    "Return exactly one JSON object with the same shape used for enrichment output.",
    JSON.stringify(enrichmentShape, null, 2),
    outputRule,
  ].join("\n\n");
}

export function buildCopyeditPrompt(content: unknown, page: ProgrammaticPage, classification: SemanticPageClassification, writerBrief: SemanticWriterBrief) {
  return [
    "You are the final human-quality copy editor for a GetForked programmatic landing page.",
    "Rewrite the supplied JSON values for clarity, grammar, readability, and natural commercial tone.",
    "Preserve the exact JSON shape and top-level keys.",
    "Do not add Markdown, commentary, code fences, citations, URLs, source labels, or parenthetical source references.",
    "Do not change the business model: GetForked scopes software replacement briefs and matches businesses with approved builders.",
    "Make GetForked's service clear: scoped brief, approved builder match, owned workflow, handover-ready implementation.",
    "Do not invent pricing, savings, official guarantees, official limits, or unsupported feature claims.",
    "Convert research notes into plain English. Do not paste raw research fragments, source snippets, or anchor phrases awkwardly into sentences.",
    "Fix broken grammar, repeated ideas, truncated fragments, robotic phrases, and repeated sentence structures.",
    "Tool names must use correct product casing: Google Sheets, Slack, Gmail, Airtable, HubSpot, Salesforce, Shopify, WooCommerce, Zapier.",
    "before_flow and after_flow must be one plain-English sentence each. Do not use arrows, pseudo-code, pipeline syntax, or chained fragments.",
    "Write like a practical operator explaining the issue to a business owner.",
    JSON.stringify(
      {
        page: compactPageContext(page),
        classification,
        writer_brief: writerBrief,
        tone_guide: writerBrief.toneRules,
        content,
      },
      null,
      2,
    ),
    "Return exactly one valid JSON object with the same shape as the input content.",
    outputRule,
  ].join("\n\n");
}

export function buildQaPrompt(content: unknown, page: ProgrammaticPage) {
  const trustRule = page.siloSlug === "zapier"
    ? "Reject if it misses when_zapier_is_still_right."
    : page.siloSlug === "shopify"
      ? "Reject if trust positioning is missing from the trust section."
      : "Reject if it misses human_in_the_loop. Do not require Zapier-specific trust sections on AI automation pages.";
  return [
    "Review this generated GetForked programmatic landing-page enrichment.",
    "Score 0 to 10: tool_specificity, workflow_specificity, difference_from_template, commercial_clarity, seo_alignment, repetition_risk.",
    `Reject if it feels template-swapped, uses Builders as title/H1 suffix, or has wrong product casing. ${trustRule}`,
    JSON.stringify({ page_type: page.pageType, content }, null, 2),
    "Return exactly one JSON object with keys: approved, scores, issues, required_revisions.",
    outputRule,
  ].join("\n\n");
}

function siblingBlock(siblings: SiblingContext[]) {
  if (siblings.length === 0) return "No sibling examples were supplied.";
  return [
    "Sibling page content to avoid:",
    JSON.stringify(
      siblings.map((sibling) => ({
        slug: sibling.slug,
        problemSummary: sibling.problemSummary,
        replacementSummary: sibling.replacementSummary,
        beforeFlow: sibling.beforeFlow,
        afterFlow: sibling.afterFlow,
        costContext: sibling.costContext,
      })),
      null,
      2,
    ),
    "Your output must be semantically and structurally distinct from every sibling above.",
  ].join("\n\n");
}

function anchorList(research: Record<string, unknown>, page?: ProgrammaticPage) {
  const webResearch = (research.webResearch as Record<string, unknown>) || {};
  return unique([
    page?.primaryKeyword || "",
    page?.uniqueContentAngle || "",
    page?.buyerPainPoint || "",
    page?.builderSkillProfile || "",
    page?.appSecondary || "",
    page?.appSecondaryShort || "",
    ...toList(research.pairSpecificFailures),
    ...toList(research.pairSpecificTriggers),
    ...toList(research.apiConstraints),
    ...toList(webResearch.entity_examples),
    ...toList(webResearch.implementation_notes),
    String(research.realWorldScenario || ""),
    String(research.dataFlowDescription || ""),
  ]).slice(0, 10);
}

function compactPageContext(page: ProgrammaticPage) {
  return {
    pageSlug: page.pageSlug,
    fullUrl: page.fullUrl,
    pageType: page.pageType,
    siloSlug: page.siloSlug,
    appPrimary: page.appPrimary,
    appPrimaryShort: page.appPrimaryShort,
    appSecondary: page.appSecondary,
    appSecondaryShort: page.appSecondaryShort,
    primaryKeyword: page.primaryKeyword,
    uniqueContentAngle: page.uniqueContentAngle,
    buyerPainPoint: page.buyerPainPoint,
    sourceContextBridge: page.sourceContextBridge,
    builderSkillProfile: page.builderSkillProfile,
    builderMatchFactors: page.builderMatchFactors,
  };
}

function compactResearchContext(research: Record<string, unknown>) {
  const webResearch = (research.webResearch as Record<string, unknown>) || {};
  return {
    businessContext: research.businessContext,
    primaryTool: research.primaryTool,
    secondaryTool: research.secondaryTool,
    pairSpecificFailures: cleanList(research.pairSpecificFailures).slice(0, 4),
    pairSpecificTriggers: cleanList(research.pairSpecificTriggers).slice(0, 4),
    apiConstraints: cleanList(research.apiConstraints).slice(0, 2),
    realWorldScenario: cleanText(String(research.realWorldScenario || "")),
    dataFlowDescription: cleanText(String(research.dataFlowDescription || "")),
    webResearch: {
      summary: cleanText(String(webResearch.summary || "")),
      trigger_examples: cleanList(webResearch.trigger_examples).slice(0, 3),
      entity_examples: cleanList(webResearch.entity_examples).slice(0, 3),
      failure_signatures: cleanList(webResearch.failure_signatures).slice(0, 4),
      implementation_notes: cleanList(webResearch.implementation_notes).slice(0, 3),
    },
  };
}

function cleanList(value: unknown) {
  return toList(value).map(cleanText).filter(Boolean);
}

function cleanText(value: string) {
  return value
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
