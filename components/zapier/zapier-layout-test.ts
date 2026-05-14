import type { ProgrammaticPage } from "@/lib/programmatic-pages";

export function useZapierLayoutTest(page: ProgrammaticPage) {
  return page.siloSlug === "zapier";
}

export function splitZapierParagraph(text: string, maxSentences = 2) {
  const explicit = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (explicit.length > 1) return explicit;

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (sentences.length <= maxSentences) return [text];

  const paragraphs: string[] = [];
  for (let index = 0; index < sentences.length; index += maxSentences) {
    paragraphs.push(sentences.slice(index, index + maxSentences).join(" "));
  }
  return paragraphs;
}
