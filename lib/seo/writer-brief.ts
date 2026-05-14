import type { SemanticPageClassification } from "@/lib/programmatic/page-enrichment";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { displayName } from "@/lib/seo/display-names";
import type { SiblingContext } from "@/lib/ai/enrichment-prompts";

export type SemanticWriterBrief = {
  centralEntity: string;
  entityAttributes: string[];
  contextualDomain: string;
  sourceContext: string;
  macroContext: string;
  microContexts: string[];
  queryIntent: string;
  likelySearcher: string;
  pageMustAnswer: string[];
  avoidRepeating: string[];
  informationGain: string;
  requiredEntities: string[];
  requiredNgrams: string[];
  sectionIntents: Record<string, string>;
  toneRules: string[];
};

export function buildWriterBrief(
  page: ProgrammaticPage,
  classification: SemanticPageClassification,
  research: Record<string, unknown>,
  siblings: SiblingContext[] = [],
): SemanticWriterBrief {
  const primary = displayName(page.appPrimaryShort || page.appPrimary || page.primaryKeyword || page.pageSlug);
  const secondary = page.appSecondaryShort || page.appSecondary ? displayName(page.appSecondaryShort || page.appSecondary) : "";
  const pair = secondary ? `${primary} and ${secondary}` : primary;
  const webResearch = (research.webResearch as Record<string, unknown>) || {};
  const failureDetails = [
    ...toList(research.pairSpecificFailures),
    ...toList(webResearch.failure_signatures),
  ].map(cleanText);
  const triggerDetails = [
    ...toList(research.pairSpecificTriggers),
    ...toList(webResearch.trigger_examples),
  ].map(cleanText);
  const apiDetails = toList(research.apiConstraints).map(cleanText);
  const requiredEntities = unique([
    primary,
    secondary,
    ...toList(webResearch.entity_examples).map(cleanText),
    ...toList((research.primaryTool as Record<string, unknown> | undefined)?.profile && ((research.primaryTool as Record<string, unknown>).profile as Record<string, unknown>).entities),
    ...toList((research.secondaryTool as Record<string, unknown> | undefined)?.profile && ((research.secondaryTool as Record<string, unknown>).profile as Record<string, unknown>).entities),
  ]).filter(Boolean).slice(0, 12);

  return {
    centralEntity: pair,
    entityAttributes: unique([...triggerDetails, ...failureDetails, ...apiDetails]).slice(0, 10),
    contextualDomain: classification.workflow_category,
    sourceContext: page.sourceContextBridge || "GetForked scopes the brief before matching the work with an approved builder.",
    macroContext: page.uniqueContentAngle || page.macroContext || String(research.businessContext || ""),
    microContexts: String(page.microContexts || "").split(";").map((item) => item.trim()).filter(Boolean),
    queryIntent: classification.search_intent,
    likelySearcher: likelySearcher(page, classification),
    pageMustAnswer: mustAnswer(page, classification, pair),
    avoidRepeating: siblings.flatMap((sibling) => [sibling.problemSummary, sibling.replacementSummary, sibling.beforeFlow, sibling.afterFlow]).filter(Boolean).slice(0, 8),
    informationGain: informationGain(page, classification, pair),
    requiredEntities,
    requiredNgrams: unique([...requiredEntities, ...triggerDetails, ...failureDetails].flatMap((item) => ngrams(item))).slice(0, 18),
    sectionIntents: sectionIntents(page, classification, pair),
    toneRules: [
      "Write like a practical operator, not a generic SaaS marketer.",
      "Translate research into plain English instead of pasting source fragments.",
      "Keep GetForked positioned as scoped brief plus approved builder matching.",
      "Do not attack Zapier or existing SaaS; explain when it remains good enough.",
    ],
  };
}

function likelySearcher(page: ProgrammaticPage, classification: SemanticPageClassification) {
  if (page.siloSlug === "zapier") return "A business owner or operations lead already using Zapier and looking for a sturdier workflow.";
  if (classification.buyer_stage === "provider_aware") return "A business owner comparing AI automation providers and needing implementation clarity.";
  return "An operator trying to replace manual work with an owned AI-assisted workflow.";
}

function mustAnswer(page: ProgrammaticPage, classification: SemanticPageClassification, pair: string) {
  if (page.siloSlug === "zapier") {
    return [
      `What ${pair} workflow is probably running through Zapier?`,
      "What specifically breaks or becomes hard to trust?",
      "What would owned workflow logic control differently?",
      "When is Zapier still the right lightweight answer?",
      "What should GetForked match for in the builder brief?",
    ];
  }
  return [
    `What concrete workflow sits behind "${page.primaryKeyword}"?`,
    "Where does manual review or data control matter?",
    "What should the owned workflow do differently from generic AI tooling?",
    "What should GetForked match for in the builder brief?",
  ];
}

function informationGain(page: ProgrammaticPage, classification: SemanticPageClassification, pair: string) {
  if (page.siloSlug === "zapier") {
    return `This page should explain the operational failure pattern and replacement scope for ${pair}, not a generic Zapier alternative.`;
  }
  return `This page should frame ${page.primaryKeyword} by buyer situation, workflow control, and implementation scope.`;
}

function sectionIntents(page: ProgrammaticPage, classification: SemanticPageClassification, pair: string) {
  const trust = page.siloSlug === "zapier"
    ? "Explain when Zapier remains good enough and when owned logic becomes worth considering."
    : "Explain human-in-the-loop review, fallback rules, and staff control.";
  return {
    meta_hero: `Name the page promise and the real workflow around ${pair}.`,
    problem: `Explain the workflow pain in concrete terms without raw research fragments.`,
    replacement: "Describe owned workflow control in plain English with practical implementation pieces.",
    flow: "Write before and after as plain-English operational scenarios, not arrows.",
    trust,
    builder: "Clarify GetForked's service: scoped brief, approved builder match, owned workflow, handover-ready implementation.",
    seo_body: "Add depth not already covered: workflow examples, risks, scope details, handover, and what to include in the brief.",
  };
}

function ngrams(value: string) {
  const words = cleanText(value).toLowerCase().split(/\s+/).filter((word) => word.length > 2);
  const out: string[] = [];
  for (let size = 1; size <= 3; size++) {
    for (let index = 0; index <= words.length - size; index++) out.push(words.slice(index, index + size).join(" "));
  }
  return out;
}

function toList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function cleanText(value: string) {
  return value
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
