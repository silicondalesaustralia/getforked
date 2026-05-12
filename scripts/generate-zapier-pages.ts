import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { inflateRawSync } from "node:zlib";
import { normaliseZapierSlug, splitToolList, zapierFullUrl } from "@/lib/url-normalisation";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";

type SheetRow = Record<string, string>;
type SheetMap = Record<string, SheetRow[]>;
type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

const args = process.argv.slice(2);
const spreadsheetPath =
  args.find((arg) => !arg.startsWith("--")) ??
  process.env.ZAPIER_XLSX_PATH ??
  join(homedir(), "Downloads/getforked-programmatic-pages.xlsx");
const outputPath = process.env.ZAPIER_OUTPUT_PATH ?? "content/generated/zapier-pages.json";
const updatedAt = new Date("2026-05-12T00:00:00.000Z").toISOString();

function main() {
  const workbook = readWorkbook(spreadsheetPath);
  const registryRows = workbook["Page Registry"] ?? [];
  const clusterRows = workbook["Zapier Clusters"] ?? [];
  const keywordRows = workbook["Keyword Import"] ?? [];
  const registryByUrl = new Map(
    registryRows
      .filter((row) => row.silo_slug === "zapier" && row.full_url?.startsWith("/zapier/"))
      .map((row) => [zapierFullUrl(slugFromUrl(row.full_url)), row]),
  );
  const keywordsBySlug = groupKeywords(keywordRows);
  const generatedPages = clusterRows
    .filter((row) => row.getforked_url?.startsWith("/zapier/"))
    .map((cluster) =>
      buildPage(cluster, registryByUrl.get(zapierFullUrl(slugFromUrl(cluster.getforked_url))), keywordsBySlug),
    );
  const pages = [buildIndexPage(generatedPages), ...attachRelatedLinks(generatedPages)];
  const failures = validatePages(pages);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(pages, null, 2)}\n`);
  console.info(
    JSON.stringify(
      {
        source: spreadsheetPath,
        output: outputPath,
        totalPages: pages.length,
        publishablePages: pages.length - failures.length,
        draftPages: failures.length,
        failures,
      },
      null,
      2,
    ),
  );
}

function buildPage(cluster: SheetRow, registry: SheetRow | undefined, keywordsBySlug: Map<string, string[]>) {
  const rawSlug = slugFromUrl(registry?.full_url || cluster.getforked_url);
  const pageSlug = normaliseZapierSlug(rawSlug);
  const pageType = cluster.page_type === "hub" ? "zapier_hub" : "zapier_pair";
  const tools = parseTools(cluster, registry, pageType);
  const labels = tools.map(toTitle);
  const primaryLabel = labels[0] ?? toTitle(pageSlug);
  const secondaryLabel = labels[1] ?? "";
  const isHub = pageType === "zapier_hub";
  const fullUrl = `/zapier/${pageSlug}/`;
  const keywordList = keywordsBySlug.get(pageSlug) ?? splitKeywordString(cluster.top_keywords);
  const title = isHub
    ? `Replace Zapier for ${primaryLabel}: Approved Automation Builders`
    : `Replace Zapier Between ${primaryLabel} and ${secondaryLabel}: Custom Workflow Builders`;
  const h1 = isHub
    ? `Replace Zapier Workflows for ${primaryLabel}`
    : `Replace Your Zapier Workflow Between ${primaryLabel} and ${secondaryLabel}`;
  const intro = registry?.intro_summary || buildIntro(pageType, primaryLabel, secondaryLabel, cluster.getforked_angle);

  return {
    id: `zapier-${pageSlug}`,
    siloSlug: "zapier",
    pageSlug,
    fullUrl,
    pageType,
    status: "published",
    priority: numberValue(registry?.priority || cluster.priority, 3),
    pageTitle: truncate(registry?.page_title || title, 120),
    h1Heading: truncate(registry?.h1_heading || h1, 140),
    metaDescription: truncate(
      registry?.meta_description ||
        (isHub
          ? `Replace Zapier workflows around ${primaryLabel} with direct automations, connectors, dashboards, or internal tools matched to an approved builder.`
          : `Replace fragile Zapier workflows between ${primaryLabel} and ${secondaryLabel} with a custom connector or workflow built by an approved builder.`),
      320,
    ),
    canonicalUrl: `https://getforked.dev${fullUrl}`,
    centralEntity: registry?.central_entity || "Zapier",
    attribute: registry?.attribute || (isHub ? `${primaryLabel} replacement` : `${primaryLabel} to ${secondaryLabel} replacement`),
    entityAttributePair: registry?.entity_attribute_pair || `Zapier ${toTitle(pageSlug)} Replacement`,
    macroContext: registry?.macro_context || `Replacing Zapier workflows for ${isHub ? primaryLabel : `${primaryLabel} and ${secondaryLabel}`}`,
    microContexts:
      registry?.micro_contexts ||
      `${primaryLabel} integration patterns; Zapier task limits; direct API connector options; workflow ownership; builder matching`,
    centralSearchIntent: registry?.central_search_intent || "Replacing Zapier middleware with a scoped custom automation build",
    sourceContextBridge:
      registry?.source_context_bridge ||
      "GetForked matches businesses with approved builders who can scope and replace Zapier-dependent workflows.",
    contextualVector: registry?.contextual_vector || buildContextualVector(pageType, primaryLabel, secondaryLabel),
    appPrimary: tools[0] ?? null,
    appSecondary: tools[1] ?? null,
    appPrimaryShort: tools[0] ? normaliseZapierSlug(toSlug(tools[0])) : null,
    appSecondaryShort: tools[1] ? normaliseZapierSlug(toSlug(tools[1])) : null,
    integrationDirection: isHub ? `${primaryLabel} to connected tools` : `${primaryLabel} to ${secondaryLabel}`,
    triggerEvent: isHub ? `${primaryLabel} record, email, event, or update` : `${primaryLabel} event or record change`,
    destinationAction: isHub ? "Sync, alert, enrich, or update connected systems" : `${secondaryLabel} sync, alert, or update`,
    introSummary: intro,
    heroSummary: intro,
    problemSummary: registry?.buyer_pain_point || buildProblem(pageType, primaryLabel, secondaryLabel),
    replacementSummary: buildReplacement(pageType, primaryLabel, secondaryLabel),
    uniqueContentAngle:
      registry?.unique_content_angle ||
      cluster.getforked_angle ||
      `Specific replacement guidance for ${isHub ? primaryLabel : `${primaryLabel} and ${secondaryLabel}`} workflows.`,
    bodyHtml: registry?.body_html || buildBodyHtml(pageType, primaryLabel, secondaryLabel, cluster.getforked_angle),
    supplementaryBridge: registry?.supplementary_bridge || "Related Zapier replacement pages for adjacent workflows.",
    mainContentFormat: registry?.main_content_format || "problem-solution",
    primaryCta: sanitizeCta(registry?.primary_cta || `Get Matched With a ${primaryLabel} Automation Builder`),
    secondaryCta: "See What This Replaces",
    briefPrefillCategory: "replace-zapier",
    briefPrefillTools: tools.join(","),
    buyerPainPoint: registry?.buyer_pain_point || buildProblem(pageType, primaryLabel, secondaryLabel),
    projectType: "Zapier replacement workflow",
    sourceParam: `zapier-${pageSlug}`,
    zapierCostContext:
      "Zapier costs depend on plan, task volume, premium apps, and failure handling. Use this comparison as a scoping prompt, not a savings guarantee.",
    estimatedTaskVolume: isHub ? "Varies by connected workflow volume" : "Low to high depending on trigger frequency and sync retries",
    customBuildContext: "A scoped build can replace brittle middleware with validation, retries, logs, and a workflow your team owns.",
    costComparisonHtml: buildCostComparisonHtml(primaryLabel, secondaryLabel),
    builderSkillProfile: "API integration, webhook handling, data validation, queueing/retry logic, dashboarding, and workflow documentation.",
    builderMatchFactors: "Tool experience, integration direction, API complexity, project size, availability, and delivery history.",
    requiredBuilderBadges: "API integrations, automation workflows, dashboard builds",
    trustProofElements: registry?.trust_proof_elements || "Approved builders only. Scope is reviewed before work starts.",
    groundednessSignals: registry?.groundedness_signals || "Specific workflow mechanics and cost assumptions are stated clearly.",
    temporalFreshness: registry?.temporal_freshness || "Refresh Zapier pricing, API references, and examples quarterly.",
    lastVerifiedNote: "Last verified 12 May 2026.",
    primaryKeyword: registry?.primary_keyword || keywordList[0] || `replace zapier ${tools.join(" ")}`,
    secondaryKeywords: registry?.secondary_keywords || keywordList.slice(1, 6).join(", "),
    semanticTerms:
      registry?.semantic_terms ||
      "Zapier alternative, API connector, webhook, workflow automation, task volume, middleware, error handling, approved builder",
    rootLink: "/zapier/",
    seedLinks: "/zapier/",
    nodeLinks: "",
    crossSiloLinks: "",
    anchorTexts: registry?.anchor_texts || "Zapier replacement builders | approved automation builders | custom workflow connector",
    relatedPageIds: "",
    imageAltPrimary:
      registry?.image_alt_primary || `Custom ${isHub ? primaryLabel : `${primaryLabel} to ${secondaryLabel}`} workflow replacing Zapier`,
    imageUrlSlug: registry?.image_url_slug || pageSlug,
    workflowBeforeLabel:
      registry?.workflow_before_label ||
      (isHub
        ? `${primaryLabel} -> Zapier -> several connected apps -> manual checks when tasks fail`
        : `${primaryLabel} -> Zapier -> ${secondaryLabel} -> manual fixes, duplicate checks, and retries`),
    workflowAfterLabel:
      registry?.workflow_after_label ||
      (isHub
        ? `${primaryLabel} -> custom connector, dashboard, or workflow service -> owned operational flow`
        : `${primaryLabel} -> custom connector or dashboard -> ${secondaryLabel} with validation, logging, and retries`),
    schemaType: registry?.schema_type || "Service",
    updatedAt,
  } satisfies ProgrammaticPage;
}

function buildIndexPage(pages: ProgrammaticPage[]) {
  const bodyHtml = `<h2>Zapier replacement builders for owned workflows</h2><p>Zapier is useful for quick tests, but many teams outgrow rented middleware when task volume, error handling, reporting, or data ownership becomes important. GetForked helps businesses submit a clear automation brief and get matched with an approved builder who can scope a direct connector, dashboard, internal tool, or workflow service.</p><h2>Popular Zapier replacement pages</h2><p>Start with a major app hub, then move into a specific integration pair when you know which workflow needs replacing.</p>`;

  return {
    id: "zapier-index",
    siloSlug: "zapier",
    pageSlug: "zapier",
    fullUrl: "/zapier/",
    pageType: "zapier_index",
    status: "published",
    priority: 1,
    pageTitle: "Zapier Replacement Builders | GetForked",
    h1Heading: "Replace Zapier With Approved Automation Builders",
    metaDescription:
      "Submit your Zapier replacement brief and get matched with an approved builder for direct connectors, dashboards, and owned workflow automation.",
    canonicalUrl: "https://getforked.dev/zapier/",
    centralEntity: "Zapier",
    attribute: "replacement",
    entityAttributePair: "Zapier Replacement",
    macroContext: "Replacing Zapier middleware with custom automation",
    microContexts: "Zapier app hubs; integration-pair workflows; builder matching; cost comparison",
    centralSearchIntent: "Finding a custom alternative to Zapier for business automation workflows",
    sourceContextBridge: "GetForked routes automation briefs to approved builders instead of open bidding feeds.",
    contextualVector:
      "H1: Replace Zapier With Approved Automation Builders\nH2: Why teams replace Zapier\nH2: What a custom replacement can look like\nH2: Popular Zapier replacement pages\nH2: Submit your Zapier replacement brief",
    appPrimary: "zapier",
    appSecondary: null,
    appPrimaryShort: "zapier",
    appSecondaryShort: null,
    integrationDirection: "Zapier to owned workflow infrastructure",
    triggerEvent: "Workflow, app, or data sync pain",
    destinationAction: "Approved builder matching",
    introSummary:
      "Zapier replacement projects usually start when a no-code workflow becomes business-critical. Task volume, brittle zaps, missing observability, and recurring middleware costs make the workflow harder to trust. GetForked matches your brief with an approved builder who can scope a direct connector, dashboard, or internal tool. This page links the main Zapier app hubs and integration-pair replacement pages.",
    heroSummary:
      "Submit your Zapier replacement brief and get matched with an approved builder who can scope a direct connector, dashboard, or internal tool.",
    problemSummary:
      "Zapier becomes painful when critical workflows rely on chained tasks, hidden failure states, duplicated records, or manual spreadsheet checks.",
    replacementSummary:
      "A custom replacement can use direct APIs, webhooks, queues, scheduled syncs, and dashboards so the workflow is owned and observable.",
    uniqueContentAngle: "Root Zapier replacement hub linking app-level and pair-level commercial landing pages.",
    bodyHtml,
    supplementaryBridge: "Choose a specific Zapier app hub or integration-pair page.",
    mainContentFormat: "problem-solution",
    primaryCta: "Submit Your Zapier Replacement Brief",
    secondaryCta: "Browse Zapier Replacement Pages",
    briefPrefillCategory: "replace-zapier",
    briefPrefillTools: "zapier",
    buyerPainPoint: "Relying on Zapier for workflows that now need clearer ownership, validation, logging, and predictable cost.",
    projectType: "Zapier replacement workflow",
    sourceParam: "zapier-index",
    zapierCostContext: "Zapier costs vary by plan, task volume, premium apps, and error handling needs.",
    estimatedTaskVolume: "Varies by workflow",
    customBuildContext: "A scoped replacement is assessed against your workflow volume, tools, risk, and ownership needs.",
    costComparisonHtml: buildCostComparisonHtml("Zapier", "your workflow"),
    builderSkillProfile: "API integration, workflow automation, dashboards, webhooks, and system design.",
    builderMatchFactors: "Tool experience, API complexity, availability, project size, and delivery history.",
    requiredBuilderBadges: "API integrations, automation workflows, dashboard builds",
    trustProofElements: "Approved builders only. No open bid spam. Scoped before you commit.",
    groundednessSignals: "Avoids unsupported savings claims and presents costs as assumptions for scoping.",
    temporalFreshness: "Refresh pricing references and major app/API capability claims quarterly.",
    lastVerifiedNote: "Last verified 12 May 2026.",
    primaryKeyword: "zapier replacement",
    secondaryKeywords: "zapier alternative, replace zapier, custom zapier integration",
    semanticTerms: "Zapier alternative, workflow automation, API connector, approved builder, middleware replacement",
    rootLink: "/zapier/",
    seedLinks: pages
      .filter((page) => page.pageType === "zapier_hub")
      .slice(0, 8)
      .map((page) => page.fullUrl)
      .join(", "),
    nodeLinks: pages
      .filter((page) => page.pageType === "zapier_pair")
      .slice(0, 8)
      .map((page) => page.fullUrl)
      .join(", "),
    crossSiloLinks: "",
    anchorTexts: "Zapier replacement builders | custom automation builders | approved builders",
    relatedPageIds: "",
    imageAltPrimary: "Zapier replacement builder matching landing page",
    imageUrlSlug: "zapier-replacement",
    workflowBeforeLabel: "Business apps -> Zapier -> chained zaps -> manual checks when records or tasks fail",
    workflowAfterLabel: "Business apps -> scoped custom workflow -> owned logs, validation, and clearer handoff",
    schemaType: "Service",
    updatedAt,
  } satisfies ProgrammaticPage;
}

function attachRelatedLinks(pages: ProgrammaticPage[]) {
  return pages.map((page) => {
    const siblings = pages
      .filter((candidate) => candidate.fullUrl !== page.fullUrl)
      .filter((candidate) => sharesTool(page, candidate))
      .slice(0, 5);

    return {
      ...page,
      nodeLinks: siblings.map((candidate) => candidate.fullUrl).join(", "),
      relatedPageIds: siblings.map((candidate) => candidate.pageSlug).join(", "),
    };
  });
}

function sharesTool(page: ProgrammaticPage, candidate: ProgrammaticPage) {
  const pageTools = [page.appPrimaryShort, page.appSecondaryShort, page.appPrimary, page.appSecondary].filter(Boolean);
  const candidateTools = [candidate.appPrimaryShort, candidate.appSecondaryShort, candidate.appPrimary, candidate.appSecondary].filter(Boolean);
  return pageTools.some((tool) => candidateTools.includes(tool));
}

function validatePages(pages: ProgrammaticPage[]) {
  return pages.flatMap((page) => {
    const required = [
      page.pageSlug,
      page.fullUrl,
      page.pageTitle,
      page.h1Heading,
      page.metaDescription,
      page.contextualVector,
      page.primaryKeyword,
      page.primaryCta,
      page.briefPrefillCategory,
      page.sourceParam,
      page.bodyHtml,
      page.workflowBeforeLabel,
      page.workflowAfterLabel,
    ];

    return required.every(Boolean) && page.fullUrl.startsWith("/zapier/") && !page.bodyHtml.includes("<h1")
      ? []
      : [{ fullUrl: page.fullUrl, reason: "failed publication validation" }];
  });
}

function parseTools(cluster: SheetRow, registry: SheetRow | undefined, pageType: string) {
  if (registry?.brief_prefill_tools) return splitToolList(registry.brief_prefill_tools).map(toSlug);
  const target = cluster.target_app || slugFromUrl(cluster.getforked_url);
  return pageType === "zapier_hub" ? [toSlug(target)] : target.split("+").map((tool) => toSlug(tool)).filter(Boolean);
}

function buildIntro(pageType: string, primary: string, secondary: string, angle: string | undefined) {
  if (pageType === "zapier_hub") {
    return `${primary} Zapier workflows usually move records, alerts, files, or customer data between ${primary} and the rest of your stack. They become harder to maintain when task volume, field changes, or silent failures create manual cleanup work. GetForked matches your brief with an approved builder who can scope a direct connector, dashboard, or internal tool. This page covers common ${primary} Zapier pain points, replacement options, builder matching, cost context, and related workflows.`;
  }
  return `A ${primary} to ${secondary} Zapier workflow usually moves events, records, alerts, or operational data between the two tools. It becomes fragile when fields change, tasks fail silently, sync timing matters, or the team has to repair records manually. GetForked matches your brief with an approved builder who can scope a direct replacement for the workflow. This page covers what breaks, what replaces it, builder matching, cost context, and related Zapier pages.${angle ? ` ${angle}` : ""}`;
}

function buildProblem(pageType: string, primary: string, secondary: string) {
  return pageType === "zapier_hub"
    ? `${primary} teams often start with Zapier because it is fast to test. The pain starts when several Zaps depend on the same records, API limits or changed fields cause hidden failures, and reporting lives outside the workflow.`
    : `${primary} to ${secondary} workflows can break when trigger timing, field mappings, duplicates, rate limits, or missing retries leave the team checking both systems by hand.`;
}

function buildReplacement(pageType: string, primary: string, secondary: string) {
  return pageType === "zapier_hub"
    ? `A custom ${primary} replacement can be a direct API connector, webhook handler, scheduled sync, dashboard, or internal tool that shows failures clearly and avoids unnecessary middleware steps.`
    : `A custom ${primary}-${secondary} replacement can validate data before sync, queue retries, log failures, and give the team a single place to see what moved and what needs attention.`;
}

function buildContextualVector(pageType: string, primary: string, secondary: string) {
  const subject = pageType === "zapier_hub" ? primary : `${primary} and ${secondary}`;
  return `H1: Replace Zapier Workflows for ${subject}\nH2: Why this Zapier workflow breaks\nH3: Field mapping and trigger failures\nH3: Manual cleanup and reporting gaps\nH2: What a custom replacement looks like\nH3: Direct API or webhook approach\nH3: Validation, retries, and workflow ownership\nH2: How GetForked matches you with the right builder\nH3: Scoped before you commit\nH2: Cost comparison - Zapier subscription vs custom build\nH2: Related Zapier replacements`;
}

function buildBodyHtml(pageType: string, primary: string, secondary: string, angle: string | undefined) {
  const subject = pageType === "zapier_hub" ? `${primary} Zapier workflows` : `${primary} to ${secondary} Zapier workflows`;
  return `<h2>Why ${subject} break</h2><p>${buildProblem(pageType, primary, secondary)}</p><h3>Field mapping and trigger failures</h3><p>Many Zapier workflows depend on a specific field shape, trigger timing, and task history. When a source app changes a field, delays a trigger, or rejects a record, the business often discovers the issue after someone checks the destination system manually.</p><h3>Manual cleanup and reporting gaps</h3><p>Zapier task history helps with debugging, but teams often need clearer business-level visibility: what synced, what failed, what needs approval, and which records should not be retried.</p><h2>What a custom replacement looks like</h2><p>${buildReplacement(pageType, primary, secondary)}</p><h3>Technical approach</h3><p>An approved builder may use direct APIs, webhooks, scheduled jobs, queue-based retry logic, or a small internal dashboard depending on the workflow risk and task volume.</p><h3>What gets consolidated</h3><p>${angle || `The replacement can consolidate the Zapier step, manual spreadsheet checks, retry decisions, and operational reporting around ${subject}.`}</p><h2>How GetForked matches you with the right builder</h2><p>GetForked does not send your project into an open bidding feed. Your brief is matched against approved builders based on tool experience, integration type, availability, project size, and delivery history.</p><h3>Scoped before you commit</h3><p>The goal is to clarify the workflow, systems, access model, budget range, and expected outcome before a builder starts implementation.</p><h2>Cost comparison - Zapier subscription vs custom build</h2><p>Zapier may still be the right choice for light, low-risk workflows. A custom build becomes worth scoping when the workflow is high-volume, business-critical, hard to monitor, or repeatedly repaired by staff.</p>`;
}

function buildCostComparisonHtml(primary: string, secondary: string) {
  const subject = secondary ? `${primary} and ${secondary}` : primary;
  return `<table><thead><tr><th>Cost factor</th><th>Zapier workflow</th><th>Custom build</th></tr></thead><tbody><tr><td>Monthly subscription</td><td>Depends on plan, premium apps, and task usage.</td><td>Scoped upfront with hosting and maintenance discussed separately.</td></tr><tr><td>Task volume</td><td>Higher volume can increase plan pressure.</td><td>Designed around expected ${subject} events and retry volume.</td></tr><tr><td>Failure handling</td><td>Usually reviewed through Zap history and alerts.</td><td>Can include validation, logs, queues, and human review states.</td></tr><tr><td>Ownership</td><td>Workflow logic lives in middleware.</td><td>Workflow logic is documented and owned by your team.</td></tr></tbody></table>`;
}

function groupKeywords(rows: SheetRow[]) {
  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    if (row.assigned_silo === "zapier" && row.assigned_page_slug && row.keyword) {
      const slug = normaliseZapierSlug(row.assigned_page_slug);
      grouped.set(slug, [...(grouped.get(slug) ?? []), row.keyword]);
    }
  }
  return grouped;
}

function splitKeywordString(value: string | undefined) {
  return value?.split(";").map((keyword) => keyword.trim()).filter(Boolean) ?? [];
}

function readWorkbook(path: string): SheetMap {
  const archive = readXlsxArchive(readFileSync(path));
  const sharedStrings = parseSharedStrings(readZipText(archive, "xl/sharedStrings.xml", false));
  const workbookXml = readZipText(archive, "xl/workbook.xml", true);
  const rels = parseRelationships(readZipText(archive, "xl/_rels/workbook.xml.rels", true));
  const sheets = parseSheets(workbookXml);
  return Object.fromEntries(
    sheets.map((sheet) => {
      const target = rels.get(sheet.relId);
      if (!target) return [sheet.name, []];
      const normalizedTarget = target.replace(/^\//, "");
      const sheetPath = normalizedTarget.startsWith("xl/") ? normalizedTarget : `xl/${normalizedTarget}`;
      return [sheet.name, parseWorksheet(readZipText(archive, sheetPath, true), sharedStrings)];
    }),
  );
}

function readXlsxArchive(buffer: Buffer) {
  const entries = new Map<string, ZipEntry>();
  const eocdOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocdOffset < 0) throw new Error("Invalid XLSX archive.");
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  let offset = centralDirectoryOffset;
  while (offset < centralDirectoryOffset + centralDirectorySize) {
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);
    entries.set(name, { name, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  return { buffer, entries };
}

function readZipText(archive: ReturnType<typeof readXlsxArchive>, path: string, required: boolean) {
  const entry = archive.entries.get(path);
  if (!entry) {
    if (required) throw new Error(`Missing XLSX entry: ${path}`);
    return "";
  }
  const localOffset = entry.localHeaderOffset;
  const fileNameLength = archive.buffer.readUInt16LE(localOffset + 26);
  const extraLength = archive.buffer.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + fileNameLength + extraLength;
  const data = archive.buffer.subarray(dataStart, dataStart + entry.compressedSize);
  if (entry.compressionMethod === 0) return data.toString("utf8");
  if (entry.compressionMethod === 8) return inflateRawSync(data).toString("utf8");
  throw new Error(`Unsupported XLSX compression method ${entry.compressionMethod}`);
}

function parseSharedStrings(xml: string) {
  return xml ? matchAll(xml, /<si\b[\s\S]*?<\/si>/g).map((item) => extractText(item)) : [];
}

function parseRelationships(xml: string) {
  const rels = new Map<string, string>();
  for (const item of matchAll(xml, /<Relationship\b[^>]*>/g)) {
    const id = attr(item, "Id");
    const target = attr(item, "Target");
    if (id && target) rels.set(id, target);
  }
  return rels;
}

function parseSheets(xml: string) {
  return matchAll(xml, /<sheet\b[^>]*>/g).flatMap((item) => {
    const name = attr(item, "name");
    const relId = attr(item, "r:id");
    return name && relId ? [{ name, relId }] : [];
  });
}

function parseWorksheet(xml: string, sharedStrings: string[]) {
  const rows = matchAll(xml, /<row\b[^>]*>[\s\S]*?<\/row>/g).map((rowXml) => {
    const cells: Record<number, string> = {};
    let maxIndex = -1;
    for (const cellXml of matchAll(rowXml, /<c\b[^>]*>[\s\S]*?<\/c>/g)) {
      const column = attr(cellXml, "r")?.match(/^([A-Z]+)/)?.[1];
      if (!column) continue;
      const index = columnIndex(column);
      cells[index] = cellValue(cellXml, sharedStrings);
      maxIndex = Math.max(maxIndex, index);
    }
    return Array.from({ length: maxIndex + 1 }, (_, index) => cells[index] ?? "");
  });
  const headers = rows[0] ?? [];
  return rows.slice(1).flatMap((row) => {
    const record: SheetRow = {};
    headers.forEach((header, index) => {
      const key = header.trim();
      const value = row[index]?.trim() ?? "";
      if (key && value) record[key] = value;
    });
    return Object.keys(record).length > 0 ? [record] : [];
  });
}

function cellValue(cellXml: string, sharedStrings: string[]) {
  const type = attr(cellXml, "t");
  if (type === "inlineStr") return extractText(cellXml);
  const raw = firstMatch(cellXml, /<v>([\s\S]*?)<\/v>/);
  if (!raw) return "";
  if (type === "s") return sharedStrings[Number(raw)] ?? "";
  return decodeXml(raw);
}

function extractText(xml: string) {
  return matchAll(xml, /<t\b[^>]*>[\s\S]*?<\/t>/g)
    .map((text) => decodeXml(text.replace(/^<t\b[^>]*>|<\/t>$/g, "")))
    .join("");
}

function attr(xml: string, name: string) {
  return firstMatch(xml, new RegExp(`${name}="([^"]*)"`, "u"));
}

function firstMatch(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1] ?? "";
}

function matchAll(value: string, pattern: RegExp) {
  return Array.from(value.matchAll(pattern), (match) => match[0]);
}

function columnIndex(column: string) {
  return column.split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function decodeXml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
}

function slugFromUrl(url: string | undefined) {
  return url?.match(/\/zapier\/([^/]+)\//)?.[1] ?? "zapier";
}

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toTitle(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => (part === "fb" ? "Facebook" : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ")
    .replace("Api", "API")
    .replace("Crm", "CRM");
}

function numberValue(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : value.slice(0, maxLength - 1).trimEnd();
}

function sanitizeCta(value: string) {
  return value.replace(/→/g, "").trim();
}

main();
