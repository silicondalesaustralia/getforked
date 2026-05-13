import type { ProgrammaticPage } from "@/lib/programmatic-pages";

type Context = {
  page: ProgrammaticPage;
  classification: Record<string, unknown>;
  knowledge: Record<string, unknown>;
  research: Record<string, unknown>;
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
  when_zapier_is_still_right: "string for Zapier pages only",
  human_in_the_loop: "string for AI pages only",
  builder_matching_summary: "string",
  builder_skill_tags: ["string", "string", "string"],
  seo_body_sections: [{ h2: "string", paragraphs: ["string"], h3_sections: [{ h3: "string", paragraph: "string" }] }],
  faq: [{ question: "string", answer: "string" }],
  schema_about: ["string", "string", "string"],
  schema_mentions: ["string", "string", "string"],
};

export function buildEnrichmentPrompt({ page, classification, knowledge, research }: Context) {
  const isZapier = page.siloSlug === "zapier";
  return [
    isZapier ? "You are enriching a GetForked Zapier replacement landing page." : "You are enriching a GetForked AI automation landing page.",
    "The URL, layout, CTA mechanics, styling and internal-link architecture already exist. Replace generic boilerplate with page-specific nuance.",
    isZapier
      ? "Rules: mention specific tool objects/events from research notes, include workflow-specific failure modes/replacements, and include when_zapier_is_still_right."
      : "Rules: explain what the AI workflow does in operational terms, include human-in-the-loop controls, avoid hype, and do not claim AI replaces staff.",
    "Use outcome-led SEO titles and H1s. Use builder language only in CTA or matching sections.",
    "Do not invent pricing, API limits, official feature support, compliance guarantees, or savings claims.",
    "Use correct product casing and commercially clear copy that leads toward brief submission.",
    "DO NOT return generic intros like 'moves rows, records, fields between tools'. Use page-specific objects/events and business stakes.",
    "Every section must include concrete research anchors.",
    "For problem_summary, replacement_summary, before_flow, after_flow, cost_context, and builder_matching_summary include at least two distinct terms from research_notes.webResearch entity_examples/trigger_examples/failure_signatures.",
    "Avoid generic template bundles like: 'trigger timing, field changes, duplicate data, noisy alerts' and 'volume, visibility, ownership, manual cleanup'.",
    "Use this input context to generate new copy:",
    JSON.stringify({ current_page: page, classification, knowledge, research_notes: research }, null, 2),
    "Return exactly one JSON object with this shape and these top-level keys:",
    JSON.stringify(enrichmentShape, null, 2),
    outputRule,
  ].join("\n\n");
}

export function buildRevisionPrompt(content: unknown, issues: string[], page: ProgrammaticPage, research: Record<string, unknown>) {
  return [
    "Revise this generated page content to fix hard issues. Return JSON only.",
    "Do not paraphrase lightly. Rewrite weak sections with tool-specific operational detail from research_notes.",
    "Critical: fix all listed issues. If an issue references a section, rewrite that section completely.",
    JSON.stringify(
      {
        page: { pageSlug: page.pageSlug, pageType: page.pageType, siloSlug: page.siloSlug },
        research_notes: research,
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

export function buildQaPrompt(content: unknown, page: ProgrammaticPage) {
  return [
    "Review this generated GetForked programmatic landing-page enrichment.",
    "Score 0 to 10: tool_specificity, workflow_specificity, difference_from_template, commercial_clarity, seo_alignment, repetition_risk.",
    "Reject if it feels template-swapped, uses Builders as title/H1 suffix, has wrong product casing, or misses required Zapier/AI trust sections.",
    JSON.stringify({ page_type: page.pageType, content }, null, 2),
    "Return exactly one JSON object with keys: approved, scores, issues, required_revisions.",
    outputRule,
  ].join("\n\n");
}
