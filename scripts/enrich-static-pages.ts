import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { StaticPageContent } from "@/lib/content/static-pages";
import { ENRICHMENT_MODEL, QA_MODEL, runJsonPrompt } from "@/lib/ai/openai-client";
import {
  buildStaticEnrichmentPrompt,
  buildStaticQaPrompt,
  buildStaticWriterBrief,
  localStaticEnrichment,
  mergeStaticEnrichment,
  StaticPageEnrichmentSchema,
  staticQualityChecks,
  type StaticPageEnrichment,
} from "@/lib/seo/static-page-enrichment";

const args = Object.fromEntries(process.argv.slice(2).map((arg) => arg.replace(/^--/, "").split("=")));
const root = process.cwd();
const storeFile = join(root, "content/generated/static-pages.json");
const previewDir = join(root, "reports/static-enrichment-preview");
const limit = Number(args.limit || process.env.ENRICHMENT_BATCH_SIZE || 25);
const offset = Number(args.offset || 0);
const dryRun = (args["dry-run"] || process.env.ENRICHMENT_DRY_RUN) !== "false";
const timeoutMs = Number(process.env.ENRICHMENT_TIMEOUT_MS || 90000);

async function main() {
  mkdirSync(previewDir, { recursive: true });
  const pages = loadPages();
  const targets = pages.filter(matchesArgs).slice(offset, offset + limit);
  const updates: StaticPageContent[] = [];
  let backupWritten = false;
  log(`start pages=${targets.length} dryRun=${dryRun}`);

  for (const [index, page] of targets.entries()) {
    log(`[${index + 1}/${targets.length}] enriching ${page.path}`);
    const siblings = pages.filter((item) => item.id !== page.id && item.status === "published").slice(0, 8);
    const writerBrief = buildStaticWriterBrief(page, siblings);
    const raw = process.env.OPENAI_API_KEY
      ? await withTimeout(runJsonPrompt(buildStaticEnrichmentPrompt(page, writerBrief)), timeoutMs)
      : localStaticEnrichment(page);
    const parsed = StaticPageEnrichmentSchema.safeParse(unwrapContent(raw));

    if (!parsed.success) {
      throw new Error(`Static enrichment schema failed for ${page.path}: ${parsed.error.issues[0]?.path.join(".")}`);
    }

    const content = parsed.data;
    const issues = [...staticQualityChecks(content, writerBrief, siblings), ...(await qaIssues(content, page, writerBrief))];
    const next = mergeStaticEnrichment(page, content, ENRICHMENT_MODEL, issues);
    updates.push(next);
    writePreview(page, next, issues, writerBrief);
    log(`done ${page.path} status=${next.enrichmentStatus} issues=${issues.length}`);

    if (!dryRun) {
      backupWritten = persistCheckpoint(pages, next, backupWritten);
    }
  }

  log(JSON.stringify({ dryRun, processed: updates.length, updated: dryRun ? 0 : updates.length }, null, 2));
}

function loadPages(): StaticPageContent[] {
  return JSON.parse(readFileSync(storeFile, "utf8")) as StaticPageContent[];
}

function matchesArgs(page: StaticPageContent) {
  if (page.path.startsWith("/ai-automation/") || page.path.startsWith("/zapier/")) return false;
  if (page.status !== "published") return false;
  if (args.page && page.id !== args.page && page.path !== args.page) return false;
  return true;
}

async function qaIssues(content: StaticPageEnrichment, page: StaticPageContent, writerBrief: ReturnType<typeof buildStaticWriterBrief>) {
  if (!process.env.OPENAI_API_KEY) return [];
  const raw = await withTimeout(runJsonPrompt(buildStaticQaPrompt(content, page, writerBrief), QA_MODEL), timeoutMs).catch((error: unknown) => ({
    approved: false,
    issues: [`QA fallback: ${error instanceof Error ? error.message : String(error)}`],
  }));
  const record = isRecord(raw) ? raw : {};
  return toStringArray(record.issues);
}

function persistCheckpoint(pages: StaticPageContent[], next: StaticPageContent, backupWritten: boolean) {
  if (!backupWritten) {
    writeFileSync(`${storeFile}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`, `${JSON.stringify(pages, null, 2)}\n`);
  }
  const merged = pages.map((page) => (page.id === next.id ? next : page));
  writeFileSync(storeFile, `${JSON.stringify(merged, null, 2)}\n`);
  pages.splice(0, pages.length, ...merged);
  return true;
}

function writePreview(page: StaticPageContent, next: StaticPageContent, issues: string[], writerBrief: ReturnType<typeof buildStaticWriterBrief>) {
  const slug = page.id.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  const payload = { current: page, next, issues, writerBrief };
  writeFileSync(join(previewDir, `${slug}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(join(previewDir, `${slug}.md`), [`# ${next.path}`, "", `Status: ${next.enrichmentStatus}`, "", "## SEO", next.seoTitle, next.metaDescription, "", "## Issues", issues.length ? issues.map((issue) => `- ${issue}`).join("\n") : "None"].join("\n"));
}

function unwrapContent(value: unknown) {
  if (!isRecord(value)) return value;
  return value.content ?? value.enrichment ?? value.static_page ?? value;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)),
  ]);
}

function log(message: string) {
  console.info(`[static-enrichment] ${message}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
