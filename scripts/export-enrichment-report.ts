import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Page = { fullUrl: string; enrichmentStatus?: string; needsManualReview?: boolean; enrichmentNotes?: string };
const root = process.cwd();
const files = ["content/generated/zapier-pages.json", "content/generated/ai-automation-pages.json", "content/generated/shopify-pages.json"];
const rows = ["url,enrichment_status,needs_manual_review,notes"];

for (const file of files) {
  const pages = JSON.parse(readFileSync(join(root, file), "utf8")) as Page[];
  for (const page of pages) {
    rows.push([page.fullUrl, page.enrichmentStatus || "pending", String(Boolean(page.needsManualReview)), quote(page.enrichmentNotes || "")].join(","));
  }
}

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(join(root, "reports/enrichment-report.csv"), `${rows.join("\n")}\n`);
console.info(JSON.stringify({ rows: rows.length - 1, output: "reports/enrichment-report.csv" }, null, 2));

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
