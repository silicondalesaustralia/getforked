import type { EnrichedPageContent } from "@/lib/ai/enrichment-schemas";

export function renderSeoBodyHtml(content: EnrichedPageContent) {
  return content.seo_body_sections
    .map((section) => {
      const paragraphs = section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");
      const h3s = section.h3_sections
        .map((item) => `<h3>${escapeHtml(item.h3)}</h3>\n<p>${escapeHtml(item.paragraph)}</p>`)
        .join("\n");
      return `<h2>${escapeHtml(section.h2)}</h2>\n${paragraphs}${h3s ? `\n${h3s}` : ""}`;
    })
    .join("\n");
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
