import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { embeddingSimilarity, fullEnrichmentText, skeletonSimilarity } from "@/lib/ai/enrichment-quality";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";

const root = process.cwd();
const silo = process.argv.find((arg) => arg.startsWith("--silo="))?.split("=")[1] || "ai-automation";
const file = join(root, `content/generated/${silo === "zapier" ? "zapier-pages" : "ai-automation-pages"}.json`);
const pages = (JSON.parse(readFileSync(file, "utf8")) as ProgrammaticPage[]).filter((page) => page.status === "published");
const rows = ["page_a,page_b,embedding_similarity,skeleton_similarity,jaccard_similarity,worst_section,recommendation"];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const left = pages[i];
      const right = pages[j];
      const jaccard = similarity(textFor(left), textFor(right));
      const skeleton = skeletonSimilarity(left.problemSummary, right.problemSummary);
      const embedding = process.env.OPENAI_API_KEY ? await embeddingSimilarity(fullEnrichmentText(left), fullEnrichmentText(right)) : 0;
      const flagged = process.env.OPENAI_API_KEY ? embedding > 0.82 || skeleton > 0.7 || (embedding > 0.78 && skeleton > 0.6) : jaccard > threshold(left);
      if (flagged) {
        rows.push(
          [left.fullUrl, right.fullUrl, embedding.toFixed(3), skeleton.toFixed(3), jaccard.toFixed(3), worstSection(left, right), "re-enrich with sibling context"]
            .map(csv)
            .join(","),
        );
      }
    }
  }

  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/enrichment-similarity-report.csv"), `${rows.join("\n")}\n`);
  console.info(JSON.stringify({ silo, flaggedPairs: rows.length - 1 }, null, 2));
}

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

function worstSection(a: ProgrammaticPage, b: ProgrammaticPage) {
  const sections = [
    ["problemSummary", a.problemSummary, b.problemSummary],
    ["replacementSummary", a.replacementSummary, b.replacementSummary],
    ["workflowBeforeLabel", a.workflowBeforeLabel, b.workflowBeforeLabel],
    ["workflowAfterLabel", a.workflowAfterLabel, b.workflowAfterLabel],
    ["zapierCostContext", a.zapierCostContext, b.zapierCostContext],
  ] as const;
  return sections
    .map(([name, left, right]) => ({ name, score: similarity(left, right) }))
    .sort((aSection, bSection) => bSection.score - aSection.score)[0].name;
}

function csv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
