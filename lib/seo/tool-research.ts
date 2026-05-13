import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { runWebResearchPrompt } from "@/lib/ai/openai-client";
import { displayName } from "@/lib/seo/display-names";
import { combinedKnowledge } from "@/lib/seo/tool-knowledge";

type ToolProfile = {
  docsUrl: string;
  entities: string[];
  events: string[];
  notes: string[];
};

const toolProfiles: Record<string, ToolProfile> = {
  airtable: {
    docsUrl: "https://airtable.com/developers/web/api/introduction",
    entities: ["bases", "tables", "records", "views", "fields"],
    events: ["record created", "record updated", "field changed"],
    notes: ["Schema/view changes often break downstream payloads.", "Record-level filtering is essential to avoid alert noise."],
  },
  slack: {
    docsUrl: "https://api.slack.com/apis",
    entities: ["channels", "messages", "threads", "users"],
    events: ["message posted", "mention triggered", "thread reply"],
    notes: ["Channel routing and message formatting are common failure points.", "Digest workflows reduce notification fatigue."],
  },
  basecamp: {
    docsUrl: "https://github.com/basecamp/bc3-api",
    entities: ["projects", "to-dos", "message boards", "schedules", "documents"],
    events: ["todo updated", "milestone changed", "project status updated"],
    notes: ["Client update workflows need approvals before broadcast.", "Project handoff visibility is a common gap."],
  },
  "google-sheets": {
    docsUrl: "https://developers.google.com/sheets/api",
    entities: ["spreadsheets", "sheets", "rows", "ranges", "cells"],
    events: ["row added", "cell changed", "range updated"],
    notes: ["Sheet structure changes break brittle mappings quickly.", "Validation before sync is critical for finance/sales sheets."],
  },
  gmail: {
    docsUrl: "https://developers.google.com/gmail/api",
    entities: ["messages", "threads", "labels", "drafts"],
    events: ["message received", "label changed", "reply sent"],
    notes: ["Inbox routing and deduplication are common workflow issues.", "Parsing email context reliably needs review controls."],
  },
  hubspot: {
    docsUrl: "https://developers.hubspot.com/docs/api/overview",
    entities: ["contacts", "companies", "deals", "tickets", "custom properties"],
    events: ["contact updated", "deal stage changed", "ticket status changed"],
    notes: ["Field mapping drift causes sync failures.", "Lead routing and stage transitions need explicit rules."],
  },
};

export async function buildResearchNotes(page: ProgrammaticPage) {
  const primary = page.appPrimaryShort || page.appPrimary || page.pageSlug;
  const secondary = page.appSecondaryShort || page.appSecondary || null;
  const primaryProfile = toolProfiles[primary] ?? null;
  const secondaryProfile = secondary ? toolProfiles[secondary] ?? null : null;
  const knowledge = combinedKnowledge(primary, secondary);
  const webResearch = process.env.OPENAI_API_KEY ? await fetchWebResearch(page, primary, secondary) : null;

  return {
    pageType: page.pageType,
    businessContext: page.uniqueContentAngle || page.macroContext,
    primaryTool: { slug: primary, displayName: displayName(primary), profile: primaryProfile },
    secondaryTool: secondary ? { slug: secondary, displayName: displayName(secondary), profile: secondaryProfile } : null,
    taxonomyKnowledge: knowledge,
    webResearch,
    constraints: [
      "Use verified facts only from provided research notes.",
      "If a claim is uncertain, use soft language (may/can/often).",
      "Do not invent pricing or official limits.",
    ],
  };
}

async function fetchWebResearch(page: ProgrammaticPage, primary: string, secondary: string | null) {
  const queryBase = secondary
    ? `${displayName(primary)} ${displayName(secondary)} integration`
    : `${displayName(primary)} automation`;
  const prompt = [
    "Research this workflow on the public web and return JSON only.",
    "Focus on official docs and trustworthy sources.",
    "Collect facts that help write page-specific failure modes, before/after workflow, implementation nuance, and QA risks.",
    "Output shape:",
    JSON.stringify(
      {
        summary: "string",
        trigger_examples: ["string", "string", "string"],
        entity_examples: ["string", "string", "string"],
        failure_signatures: ["string", "string", "string", "string"],
        implementation_notes: ["string", "string", "string"],
        source_urls: ["string", "string", "string"],
      },
      null,
      2,
    ),
    "Workflow context:",
    JSON.stringify(
      {
        pageType: page.pageType,
        pageSlug: page.pageSlug,
        query: queryBase,
        primaryTool: displayName(primary),
        secondaryTool: secondary ? displayName(secondary) : null,
      },
      null,
      2,
    ),
  ].join("\n\n");

  try {
    return await runWebResearchPrompt(prompt);
  } catch (error) {
    return {
      summary: "Live web research failed; using local research profiles.",
      trigger_examples: [],
      entity_examples: [],
      failure_signatures: [],
      implementation_notes: [],
      source_urls: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
