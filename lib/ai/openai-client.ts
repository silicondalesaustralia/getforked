import { config } from "dotenv";
import OpenAI from "openai";

config({ path: ".env.local" });
config();

export const ENRICHMENT_MODEL = process.env.OPENAI_ENRICHMENT_MODEL || "gpt-4o-mini";
export const QA_MODEL = process.env.OPENAI_QA_MODEL || ENRICHMENT_MODEL;
const WEB_RESEARCH_MODEL = process.env.OPENAI_WEB_RESEARCH_MODEL || "gpt-4o-mini";

export function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function runJsonPrompt(prompt: string, model = ENRICHMENT_MODEL) {
  const response = await getOpenAiClient().responses.create({
    model,
    input: prompt,
    text: { format: { type: "json_object" } },
  });
  return parseJsonObject(response.output_text);
}

export async function runWebResearchPrompt(prompt: string, model = WEB_RESEARCH_MODEL) {
  const response = await getOpenAiClient().responses.create({
    model,
    input: prompt,
    tools: [{ type: "web_search_preview" }],
  });
  return parseJsonObject(response.output_text);
}

function parseJsonObject(value: string) {
  const trimmed = value.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(trimmed.slice(first, last + 1));
    throw new Error("OpenAI response did not contain a JSON object.");
  }
}
