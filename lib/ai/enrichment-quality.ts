import type { EnrichedPageContent, EnrichmentQa } from "@/lib/ai/enrichment-schemas";

export function hardFailChecks(content: EnrichedPageContent, pageType: string) {
  const issues: string[] = [];
  if (/builders\s*\|/i.test(content.seo_title)) issues.push("SEO title is builder-led.");
  if (/\bbuilders\??$/i.test(content.h1.trim())) issues.push("H1 ends with Builders.");
  if (/for ai [a-z ]+/i.test(content.meta_description)) issues.push("Meta contains raw lowercase AI keyword phrase.");
  if (new Set(content.replacement_cards.map((card) => card.description.trim())).size !== content.replacement_cards.length) {
    issues.push("Replacement cards contain duplicate descriptions.");
  }
  if (pageType.startsWith("zapier") && !content.when_zapier_is_still_right) {
    issues.push("Zapier page is missing when_zapier_is_still_right.");
  }
  if (pageType.startsWith("ai_automation") && !content.human_in_the_loop) {
    issues.push("AI page is missing human_in_the_loop.");
  }
  return issues;
}

export function isQaApproved(qa: EnrichmentQa) {
  return (
    qa.approved &&
    qa.scores.tool_specificity >= 7 &&
    qa.scores.workflow_specificity >= 7 &&
    qa.scores.difference_from_template >= 8 &&
    qa.scores.commercial_clarity >= 7 &&
    qa.scores.seo_alignment >= 7 &&
    qa.scores.repetition_risk <= 3
  );
}

export function duplicateParagraphs(values: string[]) {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const value of values.map((item) => item.trim()).filter((item) => item.length > 120)) {
    if (seen.has(value)) duplicates.push(value);
    seen.add(value);
  }
  return duplicates;
}

const genericPatterns = [
  /trigger timing,\s*field changes,\s*duplicate data,\s*or noisy alerts/i,
  /volume,\s*visibility,\s*ownership,\s*or manual cleanup/i,
  /validation,\s*logs,\s*review states,\s*and owned handoff/i,
];

export function sectionSpecificityChecks(content: EnrichedPageContent, research: Record<string, unknown>) {
  const issues: string[] = [];
  const requiredSections = [
    { key: "problem_summary", value: content.problem_summary },
    { key: "replacement_summary", value: content.replacement_summary },
    { key: "before_flow", value: content.before_flow },
    { key: "after_flow", value: content.after_flow },
    { key: "cost_context", value: content.cost_context },
    { key: "builder_matching_summary", value: content.builder_matching_summary },
  ];

  const webResearch = (research.webResearch as Record<string, unknown>) || {};
  const candidates = [
    ...toList(webResearch.entity_examples),
    ...toList(webResearch.trigger_examples),
    ...toList(webResearch.failure_signatures),
  ];
  const specificityTokens = new Set(
    candidates
      .flatMap((item) => item.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/))
      .filter((token) => token.length >= 5),
  );

  for (const section of requiredSections) {
    const lowered = section.value.toLowerCase();
    const matchedTokens = [...specificityTokens].filter((token) => lowered.includes(token));
    if (matchedTokens.length < 2) {
      issues.push(`${section.key} lacks required research-specific tokens.`);
    }
    if (genericPatterns.some((pattern) => pattern.test(section.value))) {
      issues.push(`${section.key} contains generic template phrasing.`);
    }
  }

  return issues;
}

function toList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
