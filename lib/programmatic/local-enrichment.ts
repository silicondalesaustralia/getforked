import type { EnrichedPageContent, EnrichmentQa } from "@/lib/ai/enrichment-schemas";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { displayName } from "@/lib/seo/display-names";
import { knowledgeForTool } from "@/lib/seo/tool-knowledge";

export function generateLocalEnrichment(page: ProgrammaticPage): EnrichedPageContent {
  return page.siloSlug === "zapier" ? zapierContent(page) : aiContent(page);
}

export function localQa(): EnrichmentQa {
  return {
    approved: false,
    scores: {
      tool_specificity: 7,
      workflow_specificity: 7,
      difference_from_template: 7,
      commercial_clarity: 8,
      seo_alignment: 8,
      repetition_risk: 5,
    },
    issues: ["Generated with local fallback because OPENAI_API_KEY is not set."],
    required_revisions: ["Run OpenAI enrichment pass before final publication approval."],
  };
}

function zapierContent(page: ProgrammaticPage): EnrichedPageContent {
  const primary = displayName(page.appPrimaryShort || page.appPrimary);
  const secondary = displayName(page.appSecondaryShort || page.appSecondary);
  const pair = Boolean(secondary);
  const subject = pair ? `${primary} to ${secondary}` : `${primary} Zapier workflows`;
  const knowledge = knowledgeForTool(page.appPrimaryShort || page.appPrimary);
  const taxonomy = "taxonomy" in knowledge ? knowledge.taxonomy : undefined;
  const entities = list(taxonomy && "entities" in taxonomy ? taxonomy.entities : undefined, ["records", "updates", "fields", "alerts"]);
  const failures = list(
    taxonomy && "failureModes" in taxonomy ? taxonomy.failureModes : undefined,
    ["field mapping breaks", "manual retry work", "missing visibility"],
  );
  const patterns = list(
    taxonomy && "replacementPatterns" in taxonomy ? taxonomy.replacementPatterns : undefined,
    ["validation layer", "workflow dashboard", "scheduled sync"],
  );

  return base(page, {
    seo_title: pair ? `${subject} Without Zapier | GetForked` : `${primary} Zapier Replacement | GetForked`,
    h1: pair ? `${subject} Without Zapier` : `Replace Zapier Workflows for ${primary}`,
    meta_description: `Replace ${subject} with ${patterns.slice(0, 3).join(", ")} and clearer workflow ownership.`,
    hero_intro: [
      `${subject} often moves ${entities.slice(0, 4).join(", ")} between tools that the team relies on every day.`,
      `The workflow becomes fragile when ${failures.slice(0, 3).join(", ")}, or staff need to repair the process manually.`,
    ],
    problem_heading: `Why ${subject} breaks`,
    problem_summary: `${subject} becomes hard to trust when trigger timing, field changes, duplicate data, or noisy alerts leave the team checking multiple systems by hand.`,
    replacement_heading: `What a custom ${primary} replacement can do`,
    replacement_summary: `A scoped replacement can use ${patterns.slice(0, 4).join(", ")} so the workflow is observable, documented and owned by the business.`,
    failure_modes: failures.concat(["no clear approval state", "manual status checking"]).slice(0, 5),
    replacement_cards: patterns.concat(["exception report"]).slice(0, 4).map((title) => ({
      title: title[0].toUpperCase() + title.slice(1),
      description: `Use ${title} to handle ${subject} events with clearer validation, routing and review visibility.`,
    })),
    before_flow: `${subject} -> Zapier -> scattered checks, noisy alerts and manual fixes`,
    after_flow: `${subject} -> custom workflow -> validation, logs, review states and owned handoff`,
    cost_context: "Zapier can still fit light workflows. A custom build is worth scoping when volume, visibility, ownership or manual cleanup creates operational risk.",
    when_zapier_is_still_right: "Zapier may still be right for low-volume, non-critical workflows that are easy to monitor and repair without affecting customers or finance operations.",
  });
}

function aiContent(page: ProgrammaticPage): EnrichedPageContent {
  const keyword = displayName(page.primaryKeyword.replace(/\s+/g, "-"));
  return base(page, {
    seo_title: `${keyword} for Businesses | GetForked`,
    h1: `${keyword} for Business Operations`,
    meta_description: `Scope ${keyword.toLowerCase()} for admin, sales, support, reporting and internal processes with approved builders matched to your brief.`,
    hero_intro: [
      `${keyword} helps teams reduce repetitive admin, route work, summarise information and connect tools through a controlled process.`,
      "It works best when AI output is tied to real data, review steps, approval rules and the systems your team already uses.",
    ],
    problem_heading: `Where ${keyword} needs control`,
    problem_summary: `${keyword} becomes risky when AI output is disconnected from business systems, hidden from staff review, or used without fallback rules.`,
    replacement_heading: `What a custom AI workflow can include`,
    replacement_summary: "A scoped AI automation can combine classification, summarisation, drafting, dashboards and approval states without removing human judgement.",
    failure_modes: ["staff copying information between tools", "AI output not connected to systems", "no review state", "decisions buried in inboxes"],
    replacement_cards: ["AI classification", "AI summarisation", "AI drafting", "Workflow dashboard"].map((title) => ({
      title,
      description: `${title} supports the workflow while keeping staff review, approval and exception handling visible.`,
    })),
    before_flow: "Manual process -> generic AI tool -> copy/paste checks -> unclear ownership",
    after_flow: "Business workflow -> custom AI automation -> review states, dashboards and connected handoff",
    cost_context: "AI automation cost depends on workflow complexity, data access, integration depth, review needs and support expectations.",
    human_in_the_loop: "AI should assist the workflow, not silently run the business. Review states, approval steps, fallback rules and logs keep staff in control.",
  });
}

function base(page: ProgrammaticPage, override: Partial<EnrichedPageContent>): EnrichedPageContent {
  return {
    ...override,
    builder_matching_summary: page.builderMatchFactors || "GetForked matches the brief by workflow type, tool experience, scope, availability and delivery history.",
    builder_skill_tags: (page.requiredBuilderBadges || "workflow automation, API integrations, dashboards").split(",").map((item) => item.trim()).slice(0, 5),
    seo_body_sections: [
      { h2: override.problem_heading!, paragraphs: [override.problem_summary!], h3_sections: [] },
      { h2: override.replacement_heading!, paragraphs: [override.replacement_summary!], h3_sections: [] },
      { h2: "How GetForked scopes the build", paragraphs: [page.sourceContextBridge || "GetForked turns the workflow into a structured brief before matching it with an approved builder."], h3_sections: [] },
    ],
    faq: [
      { question: `When should this workflow be custom built?`, answer: override.cost_context! },
      { question: "Does this replace every tool in the stack?", answer: "No. The goal is to keep what works, replace fragile layers, and own the parts of the workflow that create risk or waste." },
    ],
    schema_about: [page.primaryKeyword || page.entityAttributePair, page.siloSlug === "zapier" ? "Zapier replacement" : "AI automation", "Workflow automation"],
    schema_mentions: [override.failure_modes![0], override.failure_modes![1], override.replacement_cards![0].title],
  } as EnrichedPageContent;
}

function list(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : fallback;
}
