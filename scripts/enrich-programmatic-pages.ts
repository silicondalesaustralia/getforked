import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EnrichedPageContentSchema, EnrichmentQaSchema } from "@/lib/ai/enrichment-schemas";
import type { EnrichedPageContent } from "@/lib/ai/enrichment-schemas";
import { buildEnrichmentPrompt, buildQaPrompt, buildRevisionPrompt } from "@/lib/ai/enrichment-prompts";
import { hardFailChecks, isQaApproved, sectionSpecificityChecks } from "@/lib/ai/enrichment-quality";
import { ENRICHMENT_MODEL, QA_MODEL, runJsonPrompt } from "@/lib/ai/openai-client";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { generateLocalEnrichment, localQa } from "@/lib/programmatic/local-enrichment";
import { classifyPage, enrichmentKnowledge, mergeEnrichment } from "@/lib/programmatic/page-enrichment";
import { buildResearchNotes } from "@/lib/seo/tool-research";

type Store = { file: string; pages: ProgrammaticPage[] };
const args = Object.fromEntries(process.argv.slice(2).map((arg) => arg.replace(/^--/, "").split("=")));
const root = process.cwd();
const limit = Number(args.limit || process.env.ENRICHMENT_BATCH_SIZE || 10);
const dryRun = (args["dry-run"] || process.env.ENRICHMENT_DRY_RUN) === "true";
const previewDir = join(root, "reports/enrichment-preview");
const timeoutMs = Number(process.env.ENRICHMENT_TIMEOUT_MS || 90000);
const maxAttempts = Number(process.env.ENRICHMENT_MAX_ATTEMPTS || 3);
const similarityThresholdBySection: Record<string, number> = {
  problemSummary: 0.35,
  workflowBeforeLabel: 0.4,
  workflowAfterLabel: 0.4,
  zapierCostContext: 0.45,
};

async function main() {
  mkdirSync(previewDir, { recursive: true });
  const store = loadStore(String(args.silo || "zapier"));
  const targets = store.pages.filter(matchesArgs).slice(0, limit);
  const enriched: ProgrammaticPage[] = [];

  for (const [index, page] of targets.entries()) {
    console.info(`[${index + 1}/${targets.length}] enriching ${page.fullUrl}`);
    const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
    const research = await buildResearchNotes(page);
    let prompt = buildEnrichmentPrompt({
      page,
      classification: classifyPage(page),
      knowledge: enrichmentKnowledge(page),
      research,
    });
    let merged: ProgrammaticPage | null = null;
    let finalIssues: string[] = [];
    let approved = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const contentRaw = hasOpenAiKey
        ? await withTimeoutReject(runJsonPrompt(prompt), timeoutMs, `Timed out after ${timeoutMs}ms`)
        : generateLocalEnrichment(page);
      const contentCandidate = normalizeLengths(normalizeBySilo(unwrapContent(contentRaw), page));
      const contentResult = EnrichedPageContentSchema.safeParse(contentCandidate);
      if (!contentResult.success) {
        console.error(
          JSON.stringify(
            {
              page: page.fullUrl,
              responseKeys: objectKeys(contentRaw),
              unwrappedKeys: objectKeys(contentCandidate),
              firstIssue: contentResult.error.issues[0],
            },
            null,
            2,
          ),
        );
        throw contentResult.error;
      }

      const content = enforceResearchAnchors(contentResult.data, page, research);
      const hardFails = hardFailChecks(content, page.pageType);
      const specificityFails = sectionSpecificityChecks(content, research);
      const qaRaw = hasOpenAiKey
        ? await withTimeoutReject(runJsonPrompt(buildQaPrompt(content, page), QA_MODEL), timeoutMs, `QA timed out after ${timeoutMs}ms`).catch(
            (error) => {
              const fallbackQa = localQa();
              return {
                ...fallbackQa,
                issues: [...fallbackQa.issues, `QA fallback: ${error instanceof Error ? error.message : String(error)}`],
              };
            },
          )
        : localQa();
      const qaCandidate = unwrapQa(qaRaw);
      const qaRecord = typeof qaCandidate === "object" && qaCandidate !== null ? (qaCandidate as Record<string, unknown>) : {};
      const qa = EnrichmentQaSchema.parse({
        ...qaRecord,
        issues: toStringArray(qaRecord.issues),
        required_revisions: toStringArray(qaRecord.required_revisions),
        approved: hardFails.length === 0 && specificityFails.length === 0 && qaRecord.approved === true,
      });

      const candidate = {
        ...mergeEnrichment(page, content, { ...qa, approved: isQaApproved(qa) }, ENRICHMENT_MODEL),
        researchNotes: research,
      };
      const siblingSimilarityIssues = compareAgainstSiblings(
        candidate,
        store.pages.filter((item) => item.id !== page.id && siblingIsRelevant(item, page)),
      );
      const candidateIssues = [...hardFails, ...specificityFails, ...siblingSimilarityIssues, ...qa.issues];
      finalIssues = candidateIssues;
      merged = candidate;
      approved = candidateIssues.length === 0 && isQaApproved(qa);
      if (approved) break;

      if (attempt < maxAttempts) {
        prompt = buildRevisionPrompt(content, candidateIssues, page, research);
      }
    }

    const finalPage = approved && merged
      ? merged
      : merged
        ? {
            ...merged,
            enrichmentStatus: "needs_review",
            needsManualReview: true,
            enrichmentNotes: finalIssues.join("; "),
          }
        : {
          ...page,
          enrichmentStatus: "needs_review",
          needsManualReview: true,
          enrichmentModel: ENRICHMENT_MODEL,
          lastEnrichedAt: new Date().toISOString(),
          enrichmentNotes: finalIssues.join("; "),
          researchNotes: research,
          };
    enriched.push(finalPage);
    writePreview(page, finalPage, finalIssues);
    const status = (finalPage as Record<string, unknown>).enrichmentStatus;
    console.info(`[done] ${page.fullUrl} status=${typeof status === "string" ? status : "unknown"}`);
  }

  if (!dryRun) {
    const map = new Map(enriched.map((page) => [page.id, page]));
    writeFileSync(store.file, `${JSON.stringify(store.pages.map((page) => map.get(page.id) || page), null, 2)}\n`);
    await revalidate(enriched);
  }

  console.info(JSON.stringify({ dryRun, processed: enriched.length, updated: dryRun ? 0 : enriched.length }, null, 2));
}

function loadStore(silo: string): Store {
  const file = join(root, `content/generated/${silo === "ai-automation" ? "ai-automation-pages" : "zapier-pages"}.json`);
  return { file, pages: JSON.parse(readFileSync(file, "utf8")) };
}

function matchesArgs(page: ProgrammaticPage) {
  if (args.page && page.pageSlug !== args.page) return false;
  if (args.status && page.status !== args.status) return false;
  return page.status === "published" && !page.pageType.endsWith("_index");
}

function writePreview(current: ProgrammaticPage, next: ProgrammaticPage, issues: string[]) {
  writeFileSync(join(previewDir, `${current.pageSlug}.json`), `${JSON.stringify({ current, next, issues }, null, 2)}\n`);
  writeFileSync(join(previewDir, `${current.pageSlug}.md`), `# ${current.fullUrl}\n\n- Current title: ${current.pageTitle}\n- New title: ${next.pageTitle}\n- Current H1: ${current.h1Heading}\n- New H1: ${next.h1Heading}\n- Issues: ${issues.join("; ") || "none"}\n`);
}

async function revalidate(pages: ProgrammaticPage[]) {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const token = process.env.REVALIDATE_TOKEN;
  if (!site || !token) return;
  for (const path of [...pages.map((page) => page.fullUrl), "/sitemap.xml", "/zapier/", "/ai-automation/"]) {
    const response = await fetch(`${site}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-token": token },
      body: JSON.stringify({ path }),
    });
    if (!response.ok) {
      const payload = await response.text().catch(() => "");
      console.warn(`revalidate failed for ${path}: ${response.status} ${payload}`);
    }
  }
}

function unwrapContent(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  return record.content || record.enriched_content || record.enrichment || record.page || record.output || record.result || value;
}

function normalizeBySilo(value: unknown, page: ProgrammaticPage) {
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  if (page.siloSlug === "zapier") delete record.human_in_the_loop;
  if (page.siloSlug === "ai-automation") delete record.when_zapier_is_still_right;
  return record;
}

function normalizeLengths(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  record.seo_title = clampText(String(record.seo_title || ""), 80);
  record.h1 = clampText(String(record.h1 || ""), 100);
  record.meta_description = clampText(String(record.meta_description || ""), 180);
  record.before_flow = clampText(String(record.before_flow || ""), 300);
  record.after_flow = clampText(String(record.after_flow || ""), 300);
  record.cost_context = clampText(String(record.cost_context || ""), 700);
  return record;
}

function unwrapQa(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  return record.qa || record.review || record.result || value;
}

function objectKeys(value: unknown) {
  return value && typeof value === "object" ? Object.keys(value as Record<string, unknown>) : [];
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter((item) => item.trim().length > 0);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => String(item))
      .filter((item) => item.trim().length > 0);
  }
  return [];
}

function compareAgainstSiblings(page: ProgrammaticPage, siblings: ProgrammaticPage[]) {
  const issues: string[] = [];
  for (const sibling of siblings) {
    if (sibling.status !== "published" || sibling.pageType.endsWith("_index")) continue;
    for (const [section, threshold] of Object.entries(similarityThresholdBySection)) {
      const value = String((page as Record<string, unknown>)[section] || "");
      const other = String((sibling as Record<string, unknown>)[section] || "");
      const score = similarity(value, other);
      if (score > threshold) {
        issues.push(`similarity gate failed for ${section} against ${sibling.pageSlug} (${score.toFixed(3)} > ${threshold})`);
      }
    }
  }
  return issues;
}

function siblingIsRelevant(sibling: ProgrammaticPage, page: ProgrammaticPage) {
  if (sibling.siloSlug !== page.siloSlug) return false;
  const aPrimary = sibling.appPrimaryShort || sibling.appPrimary;
  const bPrimary = page.appPrimaryShort || page.appPrimary;
  const aSecondary = sibling.appSecondaryShort || sibling.appSecondary || "";
  const bSecondary = page.appSecondaryShort || page.appSecondary || "";
  return sibling.pageType === page.pageType || aPrimary === bPrimary || aSecondary === bSecondary;
}

function similarity(a: string, b: string) {
  const left = tokenize(a);
  const right = tokenize(b);
  const shared = [...left].filter((token) => right.has(token)).length;
  return shared / Math.max(1, left.size + right.size - shared);
}

function tokenize(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((token) => token.length > 4));
}

function enforceResearchAnchors(content: EnrichedPageContent, page: ProgrammaticPage, research: Record<string, unknown>): EnrichedPageContent {
  const web = (research.webResearch as Record<string, unknown>) || {};
  const primaryProfile = ((research.primaryTool as Record<string, unknown>)?.profile as Record<string, unknown>) || {};
  const secondaryProfile = ((research.secondaryTool as Record<string, unknown>)?.profile as Record<string, unknown>) || {};
  const taxonomyPrimary =
    ((((research.taxonomyKnowledge as Record<string, unknown>)?.primary as Record<string, unknown>)?.taxonomy as Record<string, unknown>) || {});

  const entities = dedupe([
    ...toResearchList(primaryProfile.entities, 36),
    ...toResearchList(secondaryProfile.entities, 36),
    ...toResearchList(taxonomyPrimary.entities, 36),
  ]);
  const primaryEntities = dedupe([
    ...toResearchList(primaryProfile.entities, 36),
    ...toResearchList(taxonomyPrimary.entities, 36),
  ]);
  const secondaryEntities = dedupe([...toResearchList(secondaryProfile.entities, 36)]);
  const triggers = dedupe([
    ...toResearchList(primaryProfile.events, 54),
    ...toResearchList(secondaryProfile.events, 54),
  ]);
  const failures = dedupe([
    ...toResearchList(primaryProfile.notes, 72),
    ...toResearchList(secondaryProfile.notes, 72),
    ...toResearchList(taxonomyPrimary.failureModes, 72),
  ]);
  const impl = dedupe([
    ...toResearchList(taxonomyPrimary.replacementPatterns, 56),
  ]);
  const sources = toList(web.source_urls);
  const source = sources.find((item) => /^https?:\/\//i.test(item)) || "";
  const sourceHost = source ? source.replace(/^https?:\/\//, "").split("/")[0] : "";
  const tool = page.appPrimaryShort || page.appPrimary || page.pageSlug;
  const pair = page.appSecondaryShort || page.appSecondary ? `${tool} and ${page.appSecondaryShort || page.appSecondary}` : tool;
  const pairDisplay = sentenceCase(pair);
  const seed = hashSeed(page.pageSlug);
  const entityA = nounPhrase(pick(primaryEntities.length ? primaryEntities : entities, seed + 1, "records"), "records");
  const entityB = nounPhrase(
    pickDistinct(secondaryEntities.length ? secondaryEntities : entities, seed + 3, entityA, "messages"),
    "messages",
  );
  const triggerA = pick(triggers, seed + 5, "new event");
  const triggerB = pickDistinct(triggers, seed + 7, triggerA, "status change");
  const failureA = failurePhrase(pick(failures, seed + 9, "mapping mismatches"));
  const failureB = failurePhrase(pickDistinct(failures, seed + 11, failureA, "duplicate actions"));
  const implementationA = pick(impl, seed + 13, "explicit validation and retries");
  const implementationB = pickDistinct(impl, seed + 17, implementationA, "queueing with replay controls");
  const sourceRef = sourceHost || "official documentation";
  const variant = Math.abs(seed) % 6;
  const includeSource = Math.abs(seed) % 2 === 0 && source.length > 0;

  const afterTemplates = [
    `${pairDisplay} ${triggerA.toLowerCase()} + ${triggerB.toLowerCase()} -> strict schema checks on ${entityA.toLowerCase()} -> replay-safe queue with human review -> contract-verified writes to ${entityB.toLowerCase()} using ${implementationB.toLowerCase()}`,
    `${pairDisplay} ${triggerA.toLowerCase()} -> idempotent processor for ${entityA.toLowerCase()} -> exception queue with reviewer checkpoints -> audited update path for ${entityB.toLowerCase()} backed by ${implementationB.toLowerCase()}`,
    `${pairDisplay} ${triggerA.toLowerCase()} and ${triggerB.toLowerCase()} -> typed transform for ${entityA.toLowerCase()} -> retry + dead-letter controls -> governed sync into ${entityB.toLowerCase()} with ${implementationB.toLowerCase()}`,
    `${pairDisplay} ${triggerA.toLowerCase()} -> normalized ${entityA.toLowerCase()} payload -> policy gates + rollback checkpoint -> signed write to ${entityB.toLowerCase()} with ${implementationB.toLowerCase()}`,
    `${pairDisplay} ${triggerB.toLowerCase()} -> schema contract check for ${entityA.toLowerCase()} -> review queue for edge cases -> deterministic publish to ${entityB.toLowerCase()} via ${implementationB.toLowerCase()}`,
    `${pairDisplay} ${triggerA.toLowerCase()} and ${triggerB.toLowerCase()} -> enrichment and dedupe for ${entityA.toLowerCase()} -> controlled release path -> reconciled ${entityB.toLowerCase()} updates using ${implementationB.toLowerCase()}`,
  ];
  const costTemplates = [
    `For ${pairDisplay}, cost pressure is driven by ${failureA.toLowerCase()} and ${failureB.toLowerCase()}, not only subscription fees. Once ${entityA.toLowerCase()} volume grows, incident handling, reruns, and QA on ${entityB.toLowerCase()} consume ops hours. A custom build is usually scoped when ${triggerA.toLowerCase()} becomes business-critical and controls from ${sourceRef} guidance need to be implemented directly. ${source ? `Primary source: ${source}.` : ""}`,
    `In ${pairDisplay} workflows, hidden cost usually appears in recovery work after ${failureA.toLowerCase()} and ${failureB.toLowerCase()}. As ${entityA.toLowerCase()} throughput increases, teams spend more time validating downstream ${entityB.toLowerCase()} outcomes. Teams typically scope a custom build once ${triggerA.toLowerCase()} affects customer, revenue, or compliance operations and documented controls from ${sourceRef} need direct ownership. ${source ? `Primary source: ${source}.` : ""}`,
    `${pairDisplay} automation costs are mostly operational: triage for ${failureA.toLowerCase()}, backfills after ${failureB.toLowerCase()}, and manual checks on ${entityB.toLowerCase()}. Subscription spend is secondary once ${entityA.toLowerCase()} scale introduces recurring incident response. A custom implementation is often justified when ${triggerA.toLowerCase()} requires deterministic controls aligned with ${sourceRef} guidance. ${source ? `Primary source: ${source}.` : ""}`,
    `Most ${pairDisplay} spend is hidden in exception handling. ${failureA} and ${failureB} force manual intervention, while growing ${entityA.toLowerCase()} traffic increases reconciliation work on ${entityB.toLowerCase()}. Teams usually invest in custom implementation when ${triggerA.toLowerCase()} must meet strict response windows and auditability requirements from ${sourceRef}. ${source ? `Primary source: ${source}.` : ""}`,
    `Budget impact on ${pairDisplay} workflows comes from repeated reruns, escalation time, and post-incident cleanup. When ${failureA.toLowerCase()} appears alongside ${failureB.toLowerCase()}, operations teams absorb the cost through delayed downstream updates in ${entityB.toLowerCase()}. A custom build is generally justified once ${triggerB.toLowerCase()} drives customer-facing outcomes and ownership of controls cannot stay in middleware. ${source ? `Primary source: ${source}.` : ""}`,
    `${pairDisplay} often looks affordable until support load is included. ${failureA} and ${failureB} create extra QA cycles, and higher ${entityA.toLowerCase()} throughput increases risk exposure for ${entityB.toLowerCase()}. Custom delivery becomes the better option when ${triggerA.toLowerCase()} and ${triggerB.toLowerCase()} need deterministic execution governed by ${sourceRef} practices. ${source ? `Primary source: ${source}.` : ""}`,
  ];
  const problemTemplates = [
    `${pairDisplay} workflows break when ${failureA.toLowerCase()} and ${failureB.toLowerCase()}. Teams lose trust when ${entityA.toLowerCase()} and ${entityB.toLowerCase()} need manual reconciliation after ${triggerA.toLowerCase()}.`,
    `Operational risk in ${pairDisplay} starts with ${failureA.toLowerCase()} and ${failureB.toLowerCase()}. That usually surfaces as drift between ${entityA.toLowerCase()} and ${entityB.toLowerCase()} after ${triggerA.toLowerCase()}.`,
    `${pairDisplay} becomes brittle as soon as ${failureA.toLowerCase()} appears under load. With ${failureB.toLowerCase()}, teams end up manually checking ${entityA.toLowerCase()} against ${entityB.toLowerCase()} for every ${triggerB.toLowerCase()}.`,
    `The failure pattern for ${pairDisplay} is predictable: ${failureA.toLowerCase()}, then ${failureB.toLowerCase()}, then delayed fixes. By the time ${triggerA.toLowerCase()} is reviewed, ${entityA.toLowerCase()} and ${entityB.toLowerCase()} are already out of sync.`,
    `${pairDisplay} reliability falls when ${failureA.toLowerCase()} is treated as an edge case. When ${failureB.toLowerCase()} appears, ${triggerA.toLowerCase()} events force manual cross-checks between ${entityA.toLowerCase()} and ${entityB.toLowerCase()}.`,
    `In ${pairDisplay}, teams usually notice breakage only after customer impact. The root issues are ${failureA.toLowerCase()} and ${failureB.toLowerCase()}, which corrupt handoff between ${entityA.toLowerCase()} and ${entityB.toLowerCase()} around ${triggerB.toLowerCase()}.`,
  ];
  const replacementTemplates = [
    `A scoped replacement for ${pairDisplay} can model ${entityA.toLowerCase()} and ${entityB.toLowerCase()} directly, add controls for ${triggerA.toLowerCase()}, and implement ${implementationA.toLowerCase()} so operations are observable and owned.`,
    `The replacement pattern for ${pairDisplay} is to treat ${entityA.toLowerCase()} as source-of-truth, enforce ${implementationA.toLowerCase()}, and publish governed ${entityB.toLowerCase()} updates for each ${triggerA.toLowerCase()}.`,
    `A robust ${pairDisplay} build uses typed contracts around ${entityA.toLowerCase()}, staged review for ${triggerB.toLowerCase()}, and ${implementationA.toLowerCase()} before writing into ${entityB.toLowerCase()}.`,
    `Custom delivery replaces brittle middleware by introducing deterministic handling for ${triggerA.toLowerCase()}, policy checks on ${entityA.toLowerCase()}, and controlled propagation into ${entityB.toLowerCase()} with ${implementationA.toLowerCase()}.`,
    `For ${pairDisplay}, the practical solution is a pipeline that validates ${entityA.toLowerCase()}, routes ${triggerA.toLowerCase()} through approvals, and syncs ${entityB.toLowerCase()} using ${implementationA.toLowerCase()}.`,
    `A custom implementation can harden ${pairDisplay} by combining schema enforcement for ${entityA.toLowerCase()}, incident-safe processing for ${triggerB.toLowerCase()}, and ${implementationA.toLowerCase()} across ${entityB.toLowerCase()}.`,
  ];
  const builderTemplates = [
    `GetForked matches builders who have delivered ${pairDisplay} implementations, including experience with ${entityA.toLowerCase()}, ${entityB.toLowerCase()}, and safeguards around ${triggerA.toLowerCase()} and ${failureA.toLowerCase()}.`,
    `Builder matching prioritizes teams with proven ${pairDisplay} delivery history: they need production experience in ${entityA.toLowerCase()}, downstream ${entityB.toLowerCase()} integrity, and recovery paths for ${failureB.toLowerCase()}.`,
    `For ${pairDisplay} briefs, GetForked selects builders who can design ${implementationA.toLowerCase()}, troubleshoot ${failureA.toLowerCase()}, and operate reliable ${triggerA.toLowerCase()} processing at scale.`,
    `Match criteria for ${pairDisplay} focus on operational execution: schema ownership for ${entityA.toLowerCase()}, governance for ${entityB.toLowerCase()}, and incident controls for ${triggerB.toLowerCase()}.`,
    `GetForked routes ${pairDisplay} projects to builders with deep integration credentials, especially around ${entityA.toLowerCase()} contracts, ${failureA.toLowerCase()} mitigation, and high-confidence ${entityB.toLowerCase()} sync.`,
    `Approved builder selection for ${pairDisplay} emphasizes reliability engineering: deterministic handling of ${triggerA.toLowerCase()}, robust retries for ${failureB.toLowerCase()}, and auditable delivery into ${entityB.toLowerCase()}.`,
  ];

  return {
    ...content,
    problem_summary: clampText(problemTemplates[variant], 700),
    replacement_summary: clampText(replacementTemplates[(variant + 2) % replacementTemplates.length], 700),
    before_flow: `${pair} ${triggerA.toLowerCase()} -> Zapier steps -> ${failureA.toLowerCase()} and manual fixes across ${entityA.toLowerCase()}`,
    after_flow: clampText(afterTemplates[variant], 300),
    cost_context: clampText((includeSource ? costTemplates[variant] : costTemplates[variant].replace(/\s*Primary source:[\s\S]*$/i, "")).trim(), 700),
    builder_matching_summary: clampText(builderTemplates[(variant + 4) % builderTemplates.length], 700),
  };
}

function toList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function toResearchList(value: unknown, maxLen: number) {
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const item of toList(value)) {
    const normalized = sanitizeResearchPhrase(item, maxLen);
    if (!normalized) continue;
    if (seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    clean.push(normalized);
  }
  return clean;
}

function dedupe(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function pick(values: string[], seed: number, fallback: string) {
  if (!values.length) return fallback;
  return values[Math.abs(seed) % values.length];
}

function pickDistinct(values: string[], seed: number, current: string, fallback: string) {
  if (!values.length) return fallback;
  const unique = values.filter((item) => item.toLowerCase() !== current.toLowerCase());
  if (!unique.length) return fallback.toLowerCase() === current.toLowerCase() ? `${fallback} flow` : fallback;
  return unique[Math.abs(seed) % unique.length];
}

function nounPhrase(value: string, fallback: string) {
  const cleaned = value
    .replace(/\b(api|integration|integrations)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

function failurePhrase(value: string) {
  const cleaned = value
    .replace(/\b(common|often|usually)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "workflow reliability issues";
}

function sentenceCase(value: string) {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function sanitizeResearchPhrase(input: string, maxLen: number) {
  let value = input
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[(){}\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!value) return "";
  value = value.split(/[.;!?]/)[0]?.trim() || value;
  if (value.includes(":")) {
    value = value.split(":")[0]?.trim() || value;
  }
  value = value.replace(/[^a-zA-Z0-9,\-\/ ]+/g, " ").replace(/\s+/g, " ").trim();
  if (/\berror\b/i.test(value)) return "";
  if (/\bfailed?\b/i.test(value)) return "";
  if (/\bautomated?\b/i.test(value) && /\bmessage\b/i.test(value)) return "";
  if (/\bgoogle forms\b/i.test(value)) return "";
  if (/\bstripe\b/i.test(value) && !/\bpayment\b/i.test(value)) return "";
  if (value.split(/\s+/).length < 2) return "";
  if (value.length < 4) return "";
  return value.length > maxLen ? value.slice(0, maxLen).trim() : value;
}

function clampText(value: string, max: number) {
  if (value.length <= max) return value;
  const sliced = value.slice(0, max - 1);
  const boundary = sliced.lastIndexOf(" ");
  return `${(boundary > 40 ? sliced.slice(0, boundary) : sliced).trim()}.`;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T) {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function withTimeoutReject<T>(promise: Promise<T>, ms: number, message: string) {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
