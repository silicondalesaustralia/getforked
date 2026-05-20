import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EnrichedPageContentSchema, EnrichmentQaSchema } from "@/lib/ai/enrichment-schemas";
import {
  buildCopyeditPrompt,
  buildEnrichmentPrompt,
  buildQaPrompt,
  buildRevisionPrompt,
  buildSectionPrompt,
  type EnrichmentSectionName,
} from "@/lib/ai/enrichment-prompts";
import type { SiblingContext } from "@/lib/ai/enrichment-prompts";
import {
  assessResearchQuality,
  embeddingSimilarity,
  fallbackPhraseChecks,
  fullEnrichmentText,
  hardFailChecks,
  isQaApproved,
  pageContextSpecificityChecks,
  partitionQaIssues,
  researchAnchorChecks,
  sectionSpecificityChecks,
  ngramOverlapIssues,
  skeletonSimilarity,
  semanticQualityChecks,
} from "@/lib/ai/enrichment-quality";
import { ENRICHMENT_MODEL, QA_MODEL, runJsonPrompt } from "@/lib/ai/openai-client";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { generateLocalEnrichment, localQa } from "@/lib/programmatic/local-enrichment";
import { classifyPage, enrichmentKnowledge, mergeEnrichment, type SemanticPageClassification } from "@/lib/programmatic/page-enrichment";
import { buildResearchNotes } from "@/lib/seo/tool-research";
import { buildWriterBrief, type SemanticWriterBrief } from "@/lib/seo/writer-brief";

type Store = { file: string; pages: ProgrammaticPage[] };
const args = Object.fromEntries(process.argv.slice(2).map((arg) => arg.replace(/^--/, "").split("=")));
const root = process.cwd();
const limit = Number(args.limit || process.env.ENRICHMENT_BATCH_SIZE || 10);
const offset = Number(args.offset || 0);
const dryRun = (args["dry-run"] || process.env.ENRICHMENT_DRY_RUN) === "true";
const previewDir = join(root, "reports/enrichment-preview");
const timeoutMs = Number(process.env.ENRICHMENT_TIMEOUT_MS || 90000);
const copyeditTimeoutMs = Number(process.env.ENRICHMENT_COPYEDIT_TIMEOUT_MS || 180000);
const copyeditEnabled = (args.copyedit || process.env.ENRICHMENT_COPYEDIT_ENABLED) === "true";
const maxAttempts = Number(process.env.ENRICHMENT_MAX_ATTEMPTS || 3);
const sectionOrder: EnrichmentSectionName[] = ["meta_hero", "problem", "replacement", "flow", "trust", "builder", "seo_body"];
const allowedSectionKeys: Record<EnrichmentSectionName, string[]> = {
  meta_hero: ["seo_title", "h1", "meta_description", "hero_intro"],
  problem: ["problem_heading", "problem_summary", "failure_modes"],
  replacement: ["replacement_heading", "replacement_summary", "replacement_cards"],
  flow: ["before_flow", "after_flow", "cost_context"],
  trust: ["when_zapier_is_still_right", "human_in_the_loop"],
  builder: ["builder_matching_summary", "builder_skill_tags"],
  seo_body: ["seo_body_sections", "faq", "schema_about", "schema_mentions"],
};
const similarityThresholdBySection: Record<string, number> = {
  problemSummary: 0.35,
  workflowBeforeLabel: 0.4,
  workflowAfterLabel: 0.4,
  zapierCostContext: 0.45,
};

async function main() {
  mkdirSync(previewDir, { recursive: true });
  const store = loadStore(String(args.silo || "zapier"));
  const targets = store.pages.filter(matchesArgs).slice(offset, offset + limit);
  const enriched: ProgrammaticPage[] = [];
  let backupWritten = false;
  logStage("run", `start silo=${String(args.silo || "zapier")} limit=${limit} offset=${offset} dryRun=${dryRun} copyedit=${copyeditEnabled}`);

  for (const [index, page] of targets.entries()) {
    const pageTimer = startTimer();
    logStage("page", `[${index + 1}/${targets.length}] start ${page.fullUrl}`);
    const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
    const researchTimer = startTimer();
    logStage("research", `start ${page.fullUrl}`);
    const research = await buildResearchNotes(page);
    logStage("research", `done ${page.fullUrl} elapsed=${researchTimer()}`);
    const researchQuality = assessResearchQuality(research);
    logStage("research", `quality score=${researchQuality.score}/100 sufficient=${researchQuality.sufficient} gaps=${researchQuality.gaps.length}`);
    const siblingPages = getSiblingPages(page, store.pages);
    const similaritySiblingPages = siblingPages.filter(isApprovedForSimilarityGate);
    const siblings = siblingPages.map(toSiblingContext);
    logStage("siblings", `total=${siblingPages.length} similarityGate=${similaritySiblingPages.length}`);
    const classification = classifyPage(page);
    logStage(
      "classifier",
      `intent=${classification.search_intent} role=${classification.page_role} buyerStage=${classification.buyer_stage} job=${classification.commercial_job}`,
    );
    const writerBrief = buildWriterBrief(page, classification, research, siblings);
    logStage("writerBrief", `centralEntity="${writerBrief.centralEntity}" entities=${writerBrief.requiredEntities.length} ngrams=${writerBrief.requiredNgrams.length}`);
    if (!researchQuality.sufficient && args["force-thin-research"] !== "true") {
      logStage("research", `blocked thin research ${page.fullUrl}`);
      const finalPage = {
        ...page,
        enrichmentStatus: "needs_manual_enrichment",
        needsManualReview: true,
        enrichmentModel: ENRICHMENT_MODEL,
        lastEnrichedAt: new Date().toISOString(),
        enrichmentNotes: `Research quality ${researchQuality.score}/100: ${researchQuality.gaps.join("; ")}`,
        researchNotes: research,
      };
      enriched.push(finalPage);
      logStage("preview", `write ${page.pageSlug}`);
      writePreview(page, finalPage, researchQuality.gaps, researchQuality, null, null);
      if (!dryRun) {
        backupWritten = persistPageCheckpoint(store, finalPage, backupWritten);
        await revalidate([finalPage]);
      }
      continue;
    }
    let prompt = buildEnrichmentPrompt({
      page,
      classification,
      knowledge: enrichmentKnowledge(page),
      research,
      writerBrief,
      siblings,
    });
    let merged: ProgrammaticPage | null = null;
    let finalIssues: string[] = [];
    let approved = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const attemptTimer = startTimer();
      logStage("attempt", `${page.fullUrl} attempt=${attempt}/${maxAttempts} start`);
      let contentRaw: unknown;
      try {
        contentRaw = hasOpenAiKey
          ? attempt === 1
            ? await generateSectionContent(page, classification, writerBrief, research)
            : await withLoggedTimeout("revision", page.fullUrl, runJsonPrompt(prompt), timeoutMs, `Timed out after ${timeoutMs}ms`)
          : generateLocalEnrichment(page);
      } catch (error) {
        logStage("attempt", `${page.fullUrl} attempt=${attempt} aborted error=${error instanceof Error ? error.message : String(error)}`);
        finalIssues = [...finalIssues, `Generation attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`];
        break;
      }
      logStage("generate", `${page.fullUrl} attempt=${attempt} rawComplete elapsed=${attemptTimer()}`);
      const generatedCandidate = normalizeLengths(normalizeProductCasing(normalizeBySilo(unwrapContent(contentRaw), page)), page);
      const copyeditedRaw = hasOpenAiKey && copyeditEnabled
        ? await withLoggedTimeout(
            "copyedit",
            page.fullUrl,
            runJsonPrompt(buildCopyeditPrompt(generatedCandidate, page, classification, writerBrief), ENRICHMENT_MODEL),
            copyeditTimeoutMs,
            `Copyedit timed out after ${copyeditTimeoutMs}ms`,
          )
        : generatedCandidate;
      logStage("copyedit", `${page.fullUrl} attempt=${attempt} ${copyeditEnabled ? "done" : "skipped"}`);
      const contentCandidate = normalizeLengths(normalizeProductCasing(normalizeBySilo(unwrapContent(copyeditedRaw), page)), page);
      logStage("schema", `${page.fullUrl} attempt=${attempt} validating keys=${objectKeys(contentCandidate).join(",")}`);
      const contentResult = EnrichedPageContentSchema.safeParse(contentCandidate);
      if (!contentResult.success) {
        logStage("schema", `${page.fullUrl} failed ${contentResult.error.issues[0]?.path.join(".") || "unknown"}`);
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
      logStage("schema", `${page.fullUrl} attempt=${attempt} passed`);

      const content = contentResult.data;
      const gateTimer = startTimer();
      logStage("quality", `${page.fullUrl} attempt=${attempt} start gates`);
      const hardFails = hardFailChecks(content, page.pageType);
      const specificityFails = sectionSpecificityChecks(content, research);
      const contextFails = page.siloSlug === "ai-automation" ? pageContextSpecificityChecks(content, page) : [];
      const researchFails = researchAnchorChecks(content, research);
      const fallbackFails = fallbackPhraseChecks(content, research);
      const semanticFails = semanticQualityChecks(content, writerBrief);
      const ngramFails = ngramOverlapIssues(content, siblings.map((sibling) => Object.values(sibling).join(" ")));
      logStage(
        "quality",
        `${page.fullUrl} attempt=${attempt} done elapsed=${gateTimer()} hard=${hardFails.length} specificity=${specificityFails.length} context=${contextFails.length} research=${researchFails.length} fallback=${fallbackFails.length} semantic=${semanticFails.length} ngram=${ngramFails.length}`,
      );
      logIssues("quality:hard", hardFails);
      logIssues("quality:specificity", specificityFails);
      logIssues("quality:context", contextFails);
      logIssues("quality:research", researchFails);
      logIssues("quality:fallback", fallbackFails);
      logIssues("quality:semantic", semanticFails);
      logIssues("quality:ngram", ngramFails);
      logStage("qa", `${page.fullUrl} attempt=${attempt} start model=${QA_MODEL}`);
      const qaRaw = hasOpenAiKey
        ? await withLoggedTimeout("qa", page.fullUrl, runJsonPrompt(buildQaPrompt(content, page), QA_MODEL), timeoutMs, `QA timed out after ${timeoutMs}ms`).catch(
            (error) => {
              logStage("qa", `${page.fullUrl} fallback error=${error instanceof Error ? error.message : String(error)}`);
              const fallbackQa = localQa();
              return {
                ...fallbackQa,
                issues: [...fallbackQa.issues, `QA fallback: ${error instanceof Error ? error.message : String(error)}`],
              };
            },
          )
        : localQa();
      logStage("qa", `${page.fullUrl} attempt=${attempt} rawComplete`);
      const qaCandidate = unwrapQa(qaRaw);
      const qaRecord = typeof qaCandidate === "object" && qaCandidate !== null ? (qaCandidate as Record<string, unknown>) : {};
      const rawQaIssues = toStringArray(qaRecord.issues);
      const { blocking: qaBlockingIssues } = partitionQaIssues(rawQaIssues);
      logStage("qa", `${page.fullUrl} rawIssues=${rawQaIssues.length} blockingIssues=${qaBlockingIssues.length}`);
      logIssues("qa:blocking", qaBlockingIssues);
      // The hard structural checks above are the real defect gate.
      // The QA model's own approved boolean is noisy on a small model, so we
      // keep its score signal via isQaApproved but ignore its boolean here.
      const qa = EnrichmentQaSchema.parse({
        ...qaRecord,
        issues: qaBlockingIssues,
        required_revisions: toStringArray(qaRecord.required_revisions),
        approved:
          hardFails.length === 0 &&
          specificityFails.length === 0 &&
          contextFails.length === 0 &&
          researchFails.length === 0 &&
          fallbackFails.length === 0 &&
          semanticFails.length === 0 &&
          ngramFails.length === 0 &&
          qaBlockingIssues.length === 0,
      });

      const candidate = {
        ...mergeEnrichment(page, content, { ...qa, approved: isQaApproved(qa) }, ENRICHMENT_MODEL),
        researchNotes: research,
      };
      logStage("similarity", `${page.fullUrl} start siblings=${similaritySiblingPages.length}`);
      const siblingSimilarityIssues = await compareAgainstSiblings(candidate, similaritySiblingPages);
      logStage("similarity", `${page.fullUrl} done issues=${siblingSimilarityIssues.length}`);
      const candidateIssues = [
        ...hardFails,
        ...specificityFails,
        ...contextFails,
        ...researchFails,
        ...fallbackFails,
        ...semanticFails,
        ...ngramFails,
        ...siblingSimilarityIssues,
        ...qa.issues,
      ];
      finalIssues = candidateIssues;
      merged = candidate;
      approved = candidateIssues.length === 0 && isQaApproved(qa);
      logStage("attempt", `${page.fullUrl} attempt=${attempt} done elapsed=${attemptTimer()} approved=${approved} issues=${candidateIssues.length}`);
      if (approved) break;

      if (attempt < maxAttempts) {
        logStage("revision", `${page.fullUrl} attempt=${attempt + 1} queued issues=${candidateIssues.length}`);
        prompt = buildRevisionPrompt(content, candidateIssues, page, research, writerBrief, siblings);
      }
    }

    const finalPage = approved && merged
      ? merged
      : merged
        ? {
            ...merged,
            enrichmentStatus: "needs_manual_enrichment",
            needsManualReview: true,
            enrichmentNotes: finalIssues.join("; "),
          }
        : {
          ...page,
          enrichmentStatus: "needs_manual_enrichment",
          needsManualReview: true,
          enrichmentModel: ENRICHMENT_MODEL,
          lastEnrichedAt: new Date().toISOString(),
          enrichmentNotes: finalIssues.join("; "),
          researchNotes: research,
          };
    enriched.push(finalPage);
    logStage("preview", `write ${page.pageSlug} issues=${finalIssues.length}`);
    writePreview(page, finalPage, finalIssues, researchQuality, classification, writerBrief);
    if (!dryRun) {
      backupWritten = persistPageCheckpoint(store, finalPage, backupWritten);
      await revalidate([finalPage]);
    }
    const status = (finalPage as Record<string, unknown>).enrichmentStatus;
    logStage("page", `done ${page.fullUrl} status=${typeof status === "string" ? status : "unknown"} elapsed=${pageTimer()}`);
  }

  logStage("run", `done processed=${enriched.length} updated=${dryRun ? 0 : enriched.length}`);
  console.info(JSON.stringify({ dryRun, processed: enriched.length, updated: dryRun ? 0 : enriched.length }, null, 2));
}

function loadStore(silo: string): Store {
  const fileBySilo: Record<string, string> = {
    "ai-automation": "ai-automation-pages",
    zapier: "zapier-pages",
    shopify: "shopify-pages",
  };
  const file = join(root, `content/generated/${fileBySilo[silo] || "zapier-pages"}.json`);
  return { file, pages: JSON.parse(readFileSync(file, "utf8")) };
}

function persistPageCheckpoint(store: Store, page: ProgrammaticPage, backupWritten: boolean) {
  if (!backupWritten) {
    writeFileSync(`${store.file}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`, readFileSync(store.file, "utf8"));
    backupWritten = true;
  }
  const index = store.pages.findIndex((item) => item.id === page.id);
  if (index >= 0) store.pages[index] = page;
  else store.pages.push(page);
  writeFileSync(store.file, `${JSON.stringify(store.pages, null, 2)}\n`);
  logStage("write", `checkpoint ${page.fullUrl} to ${store.file}`);
  return backupWritten;
}

async function generateSectionContent(
  page: ProgrammaticPage,
  classification: SemanticPageClassification,
  writerBrief: SemanticWriterBrief,
  research: Record<string, unknown>,
) {
  const assembled: Record<string, unknown> = {};
  for (const section of sectionOrder) {
    const sectionTimer = startTimer();
    logStage("section", `${page.fullUrl} ${section} start model=${ENRICHMENT_MODEL}`);
    const sectionPrompt = buildSectionPrompt({
      section,
      page,
      classification,
      writerBrief,
      research,
      previous: assembled,
    });
    const sectionRaw = await withLoggedTimeout(
      `section:${section}`,
      page.fullUrl,
      runJsonPrompt(sectionPrompt, ENRICHMENT_MODEL),
      timeoutMs,
      `${section} timed out after ${timeoutMs}ms`,
    );
    const sectionContent = unwrapContent(sectionRaw);
    const allowedContent = pickSectionKeys(sectionContent, allowedSectionKeys[section]);
    Object.assign(assembled, allowedContent);
    logStage(
      "section",
      `${page.fullUrl} ${section} done elapsed=${sectionTimer()} rawKeys=${objectKeys(sectionContent).join(",")} keptKeys=${objectKeys(allowedContent).join(",")}`,
    );
  }
  return assembled;
}

function matchesArgs(page: ProgrammaticPage) {
  if (args.page && page.pageSlug !== args.page) return false;
  if (args.status && page.status !== args.status) return false;
  return page.status === "published" && !page.pageType.endsWith("_index");
}

function writePreview(
  current: ProgrammaticPage,
  next: ProgrammaticPage,
  issues: string[],
  researchQuality: ReturnType<typeof assessResearchQuality>,
  classification: SemanticPageClassification | null,
  writerBrief: SemanticWriterBrief | null,
) {
  const content = (next as Record<string, unknown>).nuancedContent as Record<string, unknown> | undefined;
  writeFileSync(join(previewDir, `${current.pageSlug}.json`), `${JSON.stringify({ current, next, issues, researchQuality, classification, writerBrief }, null, 2)}\n`);
  writeFileSync(
    join(previewDir, `${current.pageSlug}.md`),
    [
      `# ${current.fullUrl}`,
      "",
      `- Current title: ${current.pageTitle}`,
      `- New title: ${next.pageTitle}`,
      `- Current H1: ${current.h1Heading}`,
      `- New H1: ${next.h1Heading}`,
      `- Research quality: ${researchQuality.score}/100`,
      `- Intent: ${classification?.search_intent || "unknown"}`,
      `- Page role: ${classification?.page_role || "unknown"}`,
      `- Buyer stage: ${classification?.buyer_stage || "unknown"}`,
      `- Commercial job: ${classification?.commercial_job || "unknown"}`,
      `- Issues: ${issues.join("; ") || "none"}`,
      "",
      "## Writer Brief",
      "",
      `- Central entity: ${writerBrief?.centralEntity || "not generated"}`,
      `- Information gain: ${writerBrief?.informationGain || "not generated"}`,
      `- Required entities: ${writerBrief?.requiredEntities.join(", ") || "none"}`,
      "",
      "## Generated Copy",
      "",
      previewSection("Hero", [
        String(content?.seo_title || next.pageTitle || ""),
        String(content?.h1 || next.h1Heading || ""),
        ...toStringArray(content?.hero_intro),
      ]),
      previewSection("Problem", [
        String(content?.problem_heading || ""),
        String(content?.problem_summary || next.problemSummary || ""),
        ...toStringArray(content?.failure_modes).map((item) => `- ${item}`),
      ]),
      previewSection("Replacement", [
        String(content?.replacement_heading || ""),
        String(content?.replacement_summary || next.replacementSummary || ""),
        ...replacementCardLines(content?.replacement_cards),
      ]),
      previewSection("Before / After", [
        `Before: ${String(content?.before_flow || next.workflowBeforeLabel || "")}`,
        `After: ${String(content?.after_flow || next.workflowAfterLabel || "")}`,
        String(content?.cost_context || next.zapierCostContext || ""),
      ]),
      previewSection("Trust", [
        String(content?.when_zapier_is_still_right || content?.human_in_the_loop || ""),
      ]),
      previewSection("Builder Matching", [
        String(content?.builder_matching_summary || next.builderMatchFactors || ""),
        `Skills: ${toStringArray(content?.builder_skill_tags).join(", ")}`,
      ]),
      previewSeoBody(content?.seo_body_sections),
      "",
    ].join("\n"),
  );
}

function previewSection(title: string, lines: string[]) {
  const body = lines.map((line) => line.trim()).filter(Boolean).join("\n\n");
  return `## ${title}\n\n${body || "_No generated copy available._"}\n`;
}

function replacementCardLines(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((card) => {
    if (!card || typeof card !== "object") return [];
    const typed = card as Record<string, unknown>;
    return [`- ${String(typed.title || "")}: ${String(typed.description || "")}`];
  });
}

function previewSeoBody(value: unknown) {
  if (!Array.isArray(value)) return "## SEO Body Outline\n\n_No SEO body sections generated._\n";
  const lines = value.flatMap((section) => {
    if (!section || typeof section !== "object") return [];
    const typed = section as Record<string, unknown>;
    return [
      `### ${String(typed.h2 || "")}`,
      ...toStringArray(typed.paragraphs),
      ...(Array.isArray(typed.h3_sections)
        ? typed.h3_sections.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const h3 = item as Record<string, unknown>;
            return [`#### ${String(h3.h3 || "")}`, String(h3.paragraph || "")];
          })
        : []),
    ];
  });
  return `## SEO Body Outline\n\n${lines.map((line) => line.trim()).filter(Boolean).join("\n\n") || "_No SEO body sections generated._"}\n`;
}

async function revalidate(pages: ProgrammaticPage[]) {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const token = process.env.REVALIDATE_TOKEN;
  if (!site || !token) return;
  const siloRoots = ["/zapier/", "/ai-automation/", "/shopify/"];
  for (const path of [...pages.map((page) => page.fullUrl), "/sitemap.xml", ...siloRoots]) {
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

function pickSectionKeys(value: unknown, allowedKeys: string[]) {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return Object.fromEntries(allowedKeys.filter((key) => key in record).map((key) => [key, record[key]]));
}

function normalizeBySilo(value: unknown, page: ProgrammaticPage) {
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  if (page.siloSlug === "zapier") delete record.human_in_the_loop;
  if (page.siloSlug === "ai-automation") delete record.when_zapier_is_still_right;
  if (page.siloSlug === "shopify") delete record.human_in_the_loop;
  return record;
}

function normalizeLengths(value: unknown, page?: ProgrammaticPage) {
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  const localFallback = page ? generateLocalEnrichment(page) : undefined;
  record.seo_title = normalizeRequiredText(record.seo_title, [page?.pageTitle, localFallback?.seo_title], 20, 80);
  record.h1 = normalizeRequiredText(record.h1, [page?.h1Heading, localFallback?.h1, page?.pageTitle], 20, 100);
  record.meta_description = normalizeRequiredText(record.meta_description, [page?.metaDescription, localFallback?.meta_description], 80, 180);
  record.before_flow = normalizeRequiredText(record.before_flow, [page?.workflowBeforeLabel, localFallback?.before_flow], 40, 300);
  record.after_flow = normalizeRequiredText(record.after_flow, [page?.workflowAfterLabel, localFallback?.after_flow], 40, 300);
  record.cost_context = normalizeRequiredText(record.cost_context, [page?.zapierCostContext, localFallback?.cost_context], 80, 700);
  record.problem_heading = normalizeRequiredText(record.problem_heading, [localFallback?.problem_heading], 10, 120);
  record.replacement_heading = normalizeRequiredText(record.replacement_heading, [localFallback?.replacement_heading], 10, 120);
  record.problem_summary = normalizeRequiredText(record.problem_summary, [page?.problemSummary, localFallback?.problem_summary], 80, 700);
  record.replacement_summary = normalizeRequiredText(record.replacement_summary, [page?.replacementSummary, localFallback?.replacement_summary], 80, 700);
  record.builder_matching_summary = normalizeRequiredText(record.builder_matching_summary, [page?.builderMatchFactors, localFallback?.builder_matching_summary], 80, 700);
  if (record.when_zapier_is_still_right != null) {
    record.when_zapier_is_still_right = normalizeRequiredText(
      record.when_zapier_is_still_right,
      [localFallback?.when_zapier_is_still_right],
      80,
      700,
    );
  }
  if (record.human_in_the_loop != null) {
    record.human_in_the_loop = normalizeRequiredText(record.human_in_the_loop, [localFallback?.human_in_the_loop], 80, 700);
  }
  record.hero_intro = toStringArray(record.hero_intro).slice(0, 3).map((item) => clampText(item, 500));
  const failureModeFallbacks = toStringArray(localFallback?.failure_modes);
  record.failure_modes = toStringArray(record.failure_modes)
    .slice(0, 6)
    .map((item, index) => normalizeFailureMode(item, failureModeFallbacks[index]));
  record.builder_skill_tags = toStringArray(record.builder_skill_tags).slice(0, 8).map((item) => clampText(item, 60));
  if (Array.isArray(record.replacement_cards)) {
    record.replacement_cards = record.replacement_cards.slice(0, 6).map((card) => {
      if (!card || typeof card !== "object") return card;
      const typed = card as Record<string, unknown>;
      return {
        ...typed,
        title: clampText(String(typed.title || ""), 80),
        description: clampText(String(typed.description || ""), 300),
      };
    });
  }
  if (page && Array.isArray(record.replacement_cards) && record.replacement_cards.length < 4) {
    const fallbackCards = generateLocalEnrichment(page).replacement_cards;
    record.replacement_cards = record.replacement_cards.concat(fallbackCards).slice(0, 4);
  }
  if (Array.isArray(record.seo_body_sections)) {
    record.seo_body_sections = record.seo_body_sections.slice(0, 6).map((section) => {
      if (!section || typeof section !== "object") return section;
      const typed = section as Record<string, unknown>;
      return {
        ...typed,
        h2: clampText(String(typed.h2 || ""), 120),
        paragraphs: toStringArray(typed.paragraphs).slice(0, 3).map((item) => clampText(item, 800)),
        h3_sections: Array.isArray(typed.h3_sections)
          ? typed.h3_sections.slice(0, 4).map((h3) => {
              if (!h3 || typeof h3 !== "object") return h3;
              const item = h3 as Record<string, unknown>;
              return {
                ...item,
                h3: clampText(String(item.h3 || ""), 120),
                paragraph: clampText(String(item.paragraph || ""), 700),
              };
            })
          : [],
      };
    });
  }
  if (Array.isArray(record.faq)) {
    record.faq = record.faq.slice(0, 5).map((faq) => {
      if (!faq || typeof faq !== "object") return faq;
      const typed = faq as Record<string, unknown>;
      return {
        ...typed,
        question: clampText(String(typed.question || ""), 140),
        answer: clampText(String(typed.answer || ""), 500),
      };
    });
  }
  record.schema_about = normalizeSchemaTerms(record.schema_about, localFallback?.schema_about, 8);
  record.schema_mentions = normalizeSchemaTerms(record.schema_mentions, localFallback?.schema_mentions, 10);
  return record;
}

function normalizeProductCasing(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const replacements: Array<[RegExp, string]> = [
    [/\bgoogle-sheets\b/gi, "Google Sheets"],
    [/\bgoogle sheets\b/gi, "Google Sheets"],
    [/\bslack\b/gi, "Slack"],
    [/\bgmail\b/gi, "Gmail"],
    [/\bzapier\b/gi, "Zapier"],
    [/\bairtable\b/gi, "Airtable"],
    [/\bbasecamp\b/gi, "Basecamp"],
    [/\basana\b/gi, "Asana"],
    [/\btrello\b/gi, "Trello"],
    [/\bhubspot\b/gi, "HubSpot"],
    [/\bsalesforce\b/gi, "Salesforce"],
    [/\bshopify\b/gi, "Shopify"],
    [/\bwoocommerce\b/gi, "WooCommerce"],
    [/\bmicrosoft outlook\b/gi, "Microsoft Outlook"],
  ];
  const fixString = (input: string) => replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), input);
  if (typeof value === "string") return fixString(value);
  if (Array.isArray(value)) return value.map(normalizeProductCasing);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeProductCasing(item)]),
  );
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

function normalizeSchemaTerms(value: unknown, fallback: unknown, maxItems: number) {
  const terms = [...toStringArray(value), ...toStringArray(fallback), "Workflow automation", "Custom integration", "Business process automation"]
    .map((item) => clampText(item.trim(), 80))
    .filter((item) => item.length >= 3);
  return [...new Set(terms)].slice(0, maxItems);
}

function normalizeRequiredText(value: unknown, fallbacks: unknown[], minLength: number, maxLength: number) {
  const candidates = [value, ...fallbacks]
    .map((item) => String(item || "").trim())
    .filter((item) => item.length >= minLength);
  const genericFallback =
    minLength >= 80
      ? "Custom workflow automation with clear scoping, validation, review steps, and ownership for the business process."
      : "Custom workflow automation";
  return clampText(candidates[0] || genericFallback, maxLength);
}

async function compareAgainstSiblings(page: ProgrammaticPage, siblings: ProgrammaticPage[]) {
  const issues: string[] = [];
  for (const sibling of siblings) {
    if (sibling.status !== "published" || sibling.pageType.endsWith("_index")) continue;
    if (process.env.OPENAI_API_KEY) {
      const fullScore = await embeddingSimilarity(fullEnrichmentText(page), fullEnrichmentText(sibling));
      const problemSkeletonScore = skeletonSimilarity(page.problemSummary, sibling.problemSummary);
      if (fullScore > 0.82) issues.push(`embedding similarity failed against ${sibling.pageSlug} (${fullScore.toFixed(3)} > 0.820)`);
      if (problemSkeletonScore > 0.7) {
        issues.push(`problem_summary skeleton matches ${sibling.pageSlug} (${problemSkeletonScore.toFixed(3)} > 0.700)`);
      }
      continue;
    }
    for (const [section, threshold] of Object.entries(similarityThresholdBySection)) {
      const value = String((page as Record<string, unknown>)[section] || "");
      const other = String((sibling as Record<string, unknown>)[section] || "");
      const score = similarity(value, other);
      if (score > threshold) issues.push(`similarity gate failed for ${section} against ${sibling.pageSlug} (${score.toFixed(3)} > ${threshold})`);
    }
  }
  return issues;
}

function getSiblingPages(page: ProgrammaticPage, pages: ProgrammaticPage[]) {
  return pages
    .filter((item) => item.id !== page.id && item.status === "published" && !item.pageType.endsWith("_index") && siblingIsRelevant(item, page))
    .slice(0, 5);
}

function toSiblingContext(page: ProgrammaticPage): SiblingContext {
  return {
    slug: page.pageSlug,
    problemSummary: page.problemSummary,
    replacementSummary: page.replacementSummary,
    beforeFlow: page.workflowBeforeLabel,
    afterFlow: page.workflowAfterLabel,
    costContext: page.zapierCostContext,
  };
}

function isApprovedForSimilarityGate(page: ProgrammaticPage) {
  const enrichmentStatus = String((page as Record<string, unknown>).enrichmentStatus || "");
  return enrichmentStatus === "enriched" && (page as Record<string, unknown>).needsManualReview !== true;
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

function clampText(value: string, max: number) {
  if (value.length <= max) return value;
  const sentenceBoundary = value.slice(0, max).search(/(?<=[.!?])\s+[^.!?]*$/);
  if (sentenceBoundary > 80) return value.slice(0, sentenceBoundary + 1).trim();
  const sliced = value.slice(0, max - 1);
  const boundary = sliced.lastIndexOf(" ");
  return `${(boundary > 40 ? sliced.slice(0, boundary) : sliced).trim()}.`;
}

function normalizeFailureMode(value: string, fallback?: string) {
  let next = clampText(value, 120)
    .replace(/[;:,]+$/g, "")
    .trim();
  const trimmedTail = next.replace(/\b(or|and|because|with|to|the|a|an)\.?$/i, "").trim();
  if (trimmedTail.length >= 10) next = trimmedTail;
  if (
    next.length < 10 ||
    /\b(do|does|did|is|are|was|were|can|will|should|must|has|have|had|the|a|an)\.?$/i.test(next)
  ) {
    next = fallback && fallback.trim().length > 10 ? fallback.trim() : "Workflow error requires manual intervention.";
  }
  if (!/[.!?]$/.test(next)) next = `${next}.`;
  return next;
}

function logStage(stage: string, message: string) {
  console.info(`[${new Date().toISOString()}] [${stage}] ${message}`);
}

function logIssues(stage: string, issues: string[]) {
  if (issues.length === 0) return;
  for (const issue of issues) logStage(stage, issue);
}

function startTimer() {
  const startedAt = Date.now();
  return () => `${Date.now() - startedAt}ms`;
}

async function withLoggedTimeout<T>(stage: string, pageUrl: string, promise: Promise<T>, ms: number, message: string) {
  const timer = startTimer();
  logStage(stage, `${pageUrl} waiting timeout=${ms}ms`);
  try {
    const result = await withTimeoutReject(promise, ms, message);
    logStage(stage, `${pageUrl} complete elapsed=${timer()}`);
    return result;
  } catch (error) {
    logStage(stage, `${pageUrl} failed elapsed=${timer()} error=${error instanceof Error ? error.message : String(error)}`);
    throw error;
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
