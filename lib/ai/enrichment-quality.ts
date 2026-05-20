import type { EnrichedPageContent, EnrichmentQa } from "@/lib/ai/enrichment-schemas";
import { createEmbedding } from "@/lib/ai/openai-client";
import type { SemanticWriterBrief } from "@/lib/seo/writer-brief";

export function hardFailChecks(content: EnrichedPageContent, pageType: string) {
  const issues: string[] = [];
  if (/builders\s*\|/i.test(content.seo_title)) issues.push("SEO title is builder-led.");
  if (/\bbuilders\??$/i.test(content.h1.trim())) issues.push("H1 ends with Builders.");
  if (/for ai [a-z ]+/.test(content.meta_description)) issues.push("Meta contains raw lowercase AI keyword phrase.");
  if (new Set(content.replacement_cards.map((card) => card.description.trim())).size !== content.replacement_cards.length) {
    issues.push("Replacement cards contain duplicate descriptions.");
  }
  if (pageType.startsWith("zapier") && !content.when_zapier_is_still_right) {
    issues.push("Zapier page is missing when_zapier_is_still_right.");
  }
  if (pageType.startsWith("shopify") && !content.when_zapier_is_still_right) {
    issues.push("Shopify page is missing trust positioning in when_zapier_is_still_right.");
  }
  if (pageType.startsWith("ai_automation") && !content.human_in_the_loop) {
    issues.push("AI page is missing human_in_the_loop.");
  }
  return issues;
}

export function isQaApproved(qa: EnrichmentQa) {
  // Hard structural checks in the runner do the real defect detection.
  // Treat the QA model scores as a soft sanity gate, not a perfection gate.
  return (
    qa.approved &&
    qa.scores.tool_specificity >= 5 &&
    qa.scores.workflow_specificity >= 5 &&
    qa.scores.difference_from_template >= 5 &&
    qa.scores.commercial_clarity >= 5 &&
    qa.scores.seo_alignment >= 6 &&
    qa.scores.repetition_risk <= 6
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
  /manual (?:operations|entry tasks|process)\s*->/i,
  /generic ai tools?/i,
  /enhanced business workflows?/i,
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
    ...toList(webResearch.implementation_notes),
    ...toList(research.pairSpecificFailures),
    ...toList(research.pairSpecificTriggers),
    ...toList(research.apiConstraints),
    String(research.realWorldScenario || ""),
    String(research.dataFlowDescription || ""),
  ];
  const specificityTokens = new Set(
    candidates
      .flatMap((item) => item.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/))
      .filter((token) => token.length >= 5),
  );

  for (const section of requiredSections) {
    const lowered = section.value.toLowerCase();
    const matchedTokens = [...specificityTokens].filter((token) => lowered.includes(token));
    const minRequired = section.key === "replacement_summary"
      ? 0
      : section.key === "after_flow" || section.key === "before_flow"
        ? 1
        : 2;
    if (matchedTokens.length < minRequired) {
      issues.push(`${section.key} lacks required research-specific tokens.`);
    }
    if (genericPatterns.some((pattern) => pattern.test(section.value))) {
      issues.push(`${section.key} contains generic template phrasing.`);
    }
  }

  return issues;
}

export function pageContextSpecificityChecks(content: EnrichedPageContent, page: Record<string, unknown>) {
  const issues: string[] = [];
  const anchors = [
    page.primaryKeyword,
    page.uniqueContentAngle,
    page.buyerPainPoint,
    page.appSecondary,
    page.appSecondaryShort,
    page.builderSkillProfile,
    page.projectType,
  ].map((item) => String(item || ""));
  const anchorTokens = anchors.flatMap((item) => tokens(item)).filter((token) => token.length >= 5);
  for (const [section, text] of [
    ["replacement_summary", content.replacement_summary],
    ["before_flow", content.before_flow],
    ["builder_matching_summary", content.builder_matching_summary],
  ]) {
    const matched = new Set(anchorTokens.filter((token) => text.toLowerCase().includes(token)));
    if (matched.size < 1) issues.push(`${section} does not contain enough page-context detail.`);
  }
  return issues;
}

export function semanticQualityChecks(content: EnrichedPageContent, writerBrief: SemanticWriterBrief) {
  const issues: string[] = [];
  const sectionTexts = contentTextSections(content);
  const fullText = sectionTexts.map((section) => section.text).join(" ");
  const lowered = fullText.toLowerCase();
  const requiredEntities = writerBrief.requiredEntities.filter((entity) => entity.length > 2);
  const matchedEntities = requiredEntities.filter((entity) => lowered.includes(entity.toLowerCase()));
  const requiredNgrams = writerBrief.requiredNgrams.filter((ngram) => ngram.split(/\s+/).length >= 2);
  const matchedNgrams = requiredNgrams.filter((ngram) => lowered.includes(ngram.toLowerCase()));

  if (matchedEntities.length < Math.min(4, requiredEntities.length)) {
    issues.push("Semantic entity coverage is too thin.");
  }
  if (requiredNgrams.length > 0 && matchedNgrams.length < Math.min(4, requiredNgrams.length)) {
    issues.push("N-gram coverage from writer brief is too thin.");
  }
  if (!/\bbrief\b/i.test(content.builder_matching_summary) || !/\b(?:approved|matched|match)\b/i.test(content.builder_matching_summary)) {
    issues.push("Builder matching summary lacks commercial clarity around scoped brief and approved matching.");
  }

  for (const section of sectionTexts) {
    if (/[→=>]{1,}|(?:\s-\>\s)/.test(section.text)) issues.push(`${section.key} contains arrow-chain syntax.`);
    if (/(?:https?:\/\/|source:|sources:|\[[^\]]+\]\([^)]+\))/i.test(section.text)) issues.push(`${section.key} leaks raw source or citation text.`);
    if (roboticPatterns.some((pattern) => pattern.test(section.text))) issues.push(`${section.key} contains robotic marketing phrasing.`);
    const maxWords = sentenceLimitForSection(section.key);
    const longSentence = sentences(section.text).find((sentence) => wordCount(sentence) > maxWords);
    if (longSentence) issues.push(`${section.key} has an overlong sentence.`);
  }

  const starts = sentences(fullText).map((sentence) => sentence.toLowerCase().split(/\s+/).slice(0, 3).join(" ")).filter(Boolean);
  const repeatedStarts = starts.filter((start, index) => starts.indexOf(start) !== index);
  if (new Set(repeatedStarts).size > 2) issues.push("Copy repeats too many sentence openings.");

  const duplicateIdeas = ideaFingerprints([
    content.problem_summary,
    content.replacement_summary,
    content.before_flow,
    content.after_flow,
    content.cost_context,
    content.builder_matching_summary,
  ]);
  if (duplicateIdeas.length > 0) issues.push("Copy repeats the same idea across sections.");

  return issues;
}

export function ngramOverlapIssues(content: EnrichedPageContent, siblingTexts: string[]) {
  const issues: string[] = [];
  const current = ngramSet(fullEnrichmentContent(content), 4);
  for (const [index, siblingText] of siblingTexts.entries()) {
    const sibling = ngramSet(siblingText, 4);
    const shared = [...current].filter((ngram) => sibling.has(ngram)).length;
    const score = shared / Math.max(1, current.size + sibling.size - shared);
    if (score > 0.22) issues.push(`4-gram overlap is too high against sibling ${index + 1} (${score.toFixed(3)} > 0.220).`);
  }
  return issues;
}

const fallbackPhrases = [
  "records",
  "messages",
  "new event",
  "status change",
  "mapping mismatches",
  "duplicate actions",
  "explicit validation and retries",
  "queueing with replay controls",
  "workflow reliability issues",
  "form submissions",
  "validation rules",
];

export function fallbackPhraseChecks(content: EnrichedPageContent, research: Record<string, unknown>) {
  const researchText = JSON.stringify(research).toLowerCase();
  const researchSections = [
    ["problem_summary", content.problem_summary],
    ["before_flow", content.before_flow],
    ["after_flow", content.after_flow],
    ["cost_context", content.cost_context],
  ];
  return researchSections.flatMap(([section, text]) =>
    fallbackPhrases
      .filter((phrase) => text.toLowerCase().includes(phrase) && !researchText.includes(phrase))
      .map((phrase) => `${section} contains fallback phrase "${phrase}".`),
  );
}

export function researchAnchorChecks(content: EnrichedPageContent, research: Record<string, unknown>) {
  const issues: string[] = [];
  const anchors = researchAnchors(research);
  const anchorTokens = anchors.flatMap((item) => tokens(item)).filter((token) => token.length >= 5);
  for (const [section, text] of [
    ["problem_summary", content.problem_summary],
    ["replacement_summary", content.replacement_summary],
    ["before_flow", content.before_flow],
    ["after_flow", content.after_flow],
    ["cost_context", content.cost_context],
    ["builder_matching_summary", content.builder_matching_summary],
  ]) {
    const matched = new Set(anchorTokens.filter((token) => text.toLowerCase().includes(token)));
    const minRequired = section === "replacement_summary" ? 0 : section === "after_flow" || section === "before_flow" ? 1 : 2;
    if (matched.size < minRequired) issues.push(`${section} does not contain enough research-grounded detail.`);
  }
  return issues;
}

export function assessResearchQuality(research: Record<string, unknown>) {
  const failures = toList(research.pairSpecificFailures);
  const triggers = toList(research.pairSpecificTriggers);
  const constraints = toList(research.apiConstraints);
  const scenario = String(research.realWorldScenario || "");
  const dataFlow = String(research.dataFlowDescription || "");
  const gaps: string[] = [];
  let score = 0;
  if (failures.length >= 2) score += 25; else gaps.push(`Only ${failures.length} pair-specific failures.`);
  if (triggers.length >= 2) score += 20; else gaps.push(`Only ${triggers.length} pair-specific triggers.`);
  if (constraints.length >= 1) score += 20; else gaps.push("No API constraints or implementation constraints found.");
  if (scenario.length > 50) score += 20; else gaps.push("Real-world scenario is too thin.");
  if (dataFlow.length > 30) score += 15; else gaps.push("Data flow description is too thin.");
  return { sufficient: score >= 60, score, gaps };
}

export async function embeddingSimilarity(a: string, b: string) {
  const [left, right] = await Promise.all([createEmbedding(a), createEmbedding(b)]);
  return cosineSimilarity(left, right);
}

export function skeletonSimilarity(a: string, b: string) {
  const left = skeleton(a);
  const right = skeleton(b);
  if (!left || !right) return 0;
  return similarity(left, right);
}

const advisoryQaPatterns = [
  /template/i,
  /feels (?:somewhat )?template/i,
  /lacks (?:unique voice|unique branding|specificity|depth|distinct(?:iveness)?|distinction|adequate|sufficient|clear|more)/i,
  /missing (?:distinct|more|adequate|sufficient|clear)/i,
  /generic (?:content|terminology|format|structure|phrasing)/i,
  /requires more emphasis/i,
  /needs more (?:emphasis|specificity|distinct|clarity)/i,
  /lacks more explicit integration/i,
  /could (?:be more|improve|use more)/i,
  /should (?:be more|improve|use more)/i,
  /minor/i,
  /not direct/i,
  /not directly/i,
  /less direct/i,
  /risk being too generic/i,
  /lack distinctiveness from standard templates/i,
  /(?:uses?|use of) ['"]?getforked['"]? /i,
  /'?getforked'? (?:should not appear|in a non-standard way|inappropriately|causes misalignment)/i,
  /branding/i,
  /casing/i,
  /human[_\- ]in[_\- ]the[_\- ]loop/i,
  /inadequate emphasis/i,
  /lacks emphasis/i,
  /title and h1 do not adhere to guidelines/i,
  /use of ['"]builders['"] as title\/h1 suffix/i,
  /uses builders as title\/h1 suffix/i,
  /the use of ['"]builders['"] in the title\/h1 is not appropriate/i,
  /title and h1 may imply a generic usage/i,
  /potential risk of generic phrases/i,
  /uses generic terms in title\/h1 without distinctiveness/i,
  /title uses ['"]business operations['"] which is too generic/i,
  /builder matching summary feels generic and not tailored specifically to getforked/i,
  /tailored ai automation/i,
  /lacks strong differentiation/i,
  /differentiation in language/i,
  /does not use ['"]builders['"] as a title\/h1 suffix/i,
  /does not use ['"]?builders['"]? as (?:a )?title\/h1 suffix/i,
  /no ['"]builders['"] title\/h1 suffix present/i,
  /no builders title\/h1 suffix present/i,
  /no ['"]builders['"]? title\/h1 suffix/i,
  /no ['"]?builders['"]? .*suffix/i,
  /does not use builders as a title or h1 suffix/i,
  /includes a ['"]when_zapier_is_still_right['"] section/i,
  /includes ['"]when_zapier_is_still_right['"],? which satisfies/i,
  /includes the required ['"]when_zapier_is_still_right['"] positioning/i,
  /includes (?:the required )?['"]?when_zapier_is_still_right['"]?/i,
  /does include ['"]when_zapier_is_still_right['"]/i,
  /does include ['"]?when_zapier_is_still_right['"]?/i,
  /content does include ['"]?when_zapier_is_still_right['"]?/i,
  /draft does include ['"]?when_zapier_is_still_right['"]?/i,
  /it includes (?:the required )?['"]when_zapier_is_still_right['"]/i,
  /required ['"]when_zapier_is_still_right['"] section/i,
  /requirement is (?:met|satisfied)/i,
  /materially present/i,
  /commercial offer is clear enough/i,
  /commercial clarity is decent/i,
  /offer remains slightly abstract/i,
  /still leans generic in places/i,
  /seo is aligned/i,
  /seo alignment is strong/i,
  /strong on google sheets/i,
  /lowercased ['"]?google sheets/i,
  /overlap heavily/i,
  /increasing repetition risk/i,
  /repetition risk is moderate/i,
  /some repetition around/i,
  /not excessive/i,
  /passes that requirement/i,
  /includes ['"]when_zapier_is_still_right['"] appropriately/i,
  /no major rejection trigger/i,
  /need for tighter polish/i,
  /run-on sentences/i,
  /awkward fragments/i,
  /commercial cta is present/i,
  /buyer journey could be sharper/i,
  /generic replacement scoping/i,
];

export function partitionQaIssues(issues: string[]) {
  const blocking: string[] = [];
  const advisory: string[] = [];
  for (const issue of issues) {
    if (advisoryQaPatterns.some((pattern) => pattern.test(issue))) advisory.push(issue);
    else blocking.push(issue);
  }
  return { blocking, advisory };
}

export function fullEnrichmentText(value: Record<string, unknown>) {
  return [
    value.heroSummary,
    value.problemSummary,
    value.replacementSummary,
    value.workflowBeforeLabel,
    value.workflowAfterLabel,
    value.zapierCostContext,
    value.builderMatchFactors,
    value.bodyHtml,
  ].map((item) => String(item || "")).join(" ");
}

function fullEnrichmentContent(content: EnrichedPageContent) {
  return contentTextSections(content).map((section) => section.text).join(" ");
}

function contentTextSections(content: EnrichedPageContent) {
  return [
    { key: "seo_title", text: content.seo_title },
    { key: "h1", text: content.h1 },
    { key: "meta_description", text: content.meta_description },
    { key: "hero_intro", text: content.hero_intro.join(" ") },
    { key: "problem_summary", text: content.problem_summary },
    { key: "replacement_summary", text: content.replacement_summary },
    { key: "before_flow", text: content.before_flow },
    { key: "after_flow", text: content.after_flow },
    { key: "cost_context", text: content.cost_context },
    { key: "trust_section", text: content.when_zapier_is_still_right || content.human_in_the_loop || "" },
    { key: "builder_matching_summary", text: content.builder_matching_summary },
    { key: "seo_body_sections", text: content.seo_body_sections.flatMap((section) => [section.h2, ...section.paragraphs, ...section.h3_sections.flatMap((h3) => [h3.h3, h3.paragraph])]).join(" ") },
    { key: "faq", text: content.faq.flatMap((item) => [item.question, item.answer]).join(" ") },
  ].filter((section) => section.text.trim().length > 0);
}

const roboticPatterns = [
  /\bstreamline (?:your )?(?:business )?operations\b/i,
  /\benhance(?:d)? efficiency\b/i,
  /\bseamless(?:ly)? integration\b/i,
  /\btailored ai automation\b/i,
  /\bcustom ai automation solutions?\b/i,
  /\belevate your business\b/i,
  /\bunlock (?:the )?power\b/i,
];

function toList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function researchAnchors(research: Record<string, unknown>) {
  const webResearch = (research.webResearch as Record<string, unknown>) || {};
  return [
    ...toList(webResearch.entity_examples),
    ...toList(webResearch.trigger_examples),
    ...toList(webResearch.failure_signatures),
    ...toList(webResearch.implementation_notes),
    ...toList(research.pairSpecificFailures),
    ...toList(research.pairSpecificTriggers),
    ...toList(research.apiConstraints),
    String(research.realWorldScenario || ""),
    String(research.dataFlowDescription || ""),
  ].filter(Boolean);
}

function tokens(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/).filter(Boolean);
}

function sentences(value: string) {
  return value.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
}

function wordCount(value: string) {
  return tokens(value).length;
}

function sentenceLimitForSection(section: string) {
  if (section === "seo_body_sections") return 58;
  if (section === "builder_matching_summary") return 52;
  if (section === "trust_section") return 58;
  if (section === "faq") return 58;
  if (section === "problem_summary" || section === "replacement_summary" || section === "cost_context") return 58;
  if (section === "before_flow" || section === "after_flow") return 58;
  return 38;
}

function ideaFingerprints(values: string[]) {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const value of values) {
    const fingerprint = tokens(value)
      .filter((token) => token.length > 5 && !commonIdeaWords.has(token))
      .slice(0, 8)
      .sort()
      .join(" ");
    if (fingerprint.length < 20) continue;
    if (seen.has(fingerprint)) duplicates.push(fingerprint);
    seen.add(fingerprint);
  }
  return duplicates;
}

function ngramSet(value: string, size: number) {
  const words = tokens(value).filter((token) => token.length > 2);
  const out = new Set<string>();
  for (let index = 0; index <= words.length - size; index++) out.add(words.slice(index, index + size).join(" "));
  return out;
}

const commonIdeaWords = new Set([
  "getforked",
  "workflow",
  "workflows",
  "business",
  "builder",
  "builders",
  "automation",
  "automations",
  "approved",
  "scoped",
]);

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let index = 0; index < a.length; index++) {
    dot += a[index] * b[index];
    magA += a[index] * a[index];
    magB += b[index] * b[index];
  }
  return dot / Math.max(Number.EPSILON, Math.sqrt(magA) * Math.sqrt(magB));
}

function skeleton(value: string) {
  return value
    .replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, "[X]")
    .replace(/\b(?:records|rows|subscribers|contacts|messages|events|tasks|fields|tickets)\b/gi, "[ENTITY]")
    .replace(/\b(?:created|updated|changed|added|deleted|modified|received|posted)\b/gi, "[ACTION]")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string) {
  const left = new Set(tokens(a).filter((token) => token.length > 4));
  const right = new Set(tokens(b).filter((token) => token.length > 4));
  const shared = [...left].filter((token) => right.has(token)).length;
  return shared / Math.max(1, left.size + right.size - shared);
}
