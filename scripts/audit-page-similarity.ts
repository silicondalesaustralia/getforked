import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";

const root = process.cwd();
const silo = process.argv.find((arg) => arg.startsWith("--silo="))?.split("=")[1] || "ai-automation";
const file = join(root, `content/generated/${silo === "zapier" ? "zapier-pages" : "ai-automation-pages"}.json`);
const pages = (JSON.parse(readFileSync(file, "utf8")) as ProgrammaticPage[]).filter((page) => page.status === "published");
const rows = ["page_a,page_b,similarity_score,shared_phrases,recommendation"];

for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const score = similarity(textFor(pages[i]), textFor(pages[j]));
    if (score > threshold(pages[i])) rows.push([pages[i].fullUrl, pages[j].fullUrl, score.toFixed(2), "token overlap", "review or consolidate"].join(","));
  }
}

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(join(root, "reports/enrichment-similarity-report.csv"), `${rows.join("\n")}\n`);
console.info(JSON.stringify({ silo, flaggedPairs: rows.length - 1 }, null, 2));

function textFor(page: ProgrammaticPage) {
  return [page.heroSummary, page.problemSummary, page.replacementSummary, page.bodyHtml].join(" ");
}

function similarity(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  const shared = [...left].filter((token) => right.has(token)).length;
  return shared / Math.max(1, left.size + right.size - shared);
}

function tokens(value: string) {
  return new Set(value.toLowerCase().replace(/<[^>]+>/g, " ").replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((token) => token.length > 4));
}

function threshold(page: ProgrammaticPage) {
  return page.pageType === "zapier_pair" ? 0.65 : 0.7;
}
