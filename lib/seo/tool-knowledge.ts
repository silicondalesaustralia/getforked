import { categoryForTool, workflowTaxonomy } from "@/lib/seo/workflow-taxonomy";

export const toolKnowledge = {
  basecamp: {
    builderSkills: ["Basecamp API", "project-management workflows", "notification routing", "dashboard builds"],
  },
  airtable: {
    builderSkills: ["Airtable API", "database workflow design", "validation logic", "approval workflows"],
  },
  slack: {
    builderSkills: ["Slack API", "notification design", "conditional routing", "workflow alerts", "digest generation"],
  },
  "google-sheets": {
    builderSkills: ["Google Sheets API", "spreadsheet validation", "scheduled syncs", "dashboard builds"],
  },
  hubspot: {
    builderSkills: ["HubSpot API", "CRM workflows", "lead routing", "pipeline reporting"],
  },
  gmail: {
    builderSkills: ["Gmail API", "inbox routing", "email parsing", "reply drafting workflows"],
  },
};

export function knowledgeForTool(slug: string | null | undefined) {
  const category = categoryForTool(slug);
  const taxonomy = category === "general_workflow" ? {} : workflowTaxonomy[category];
  return { category, taxonomy, ...(slug ? toolKnowledge[slug as keyof typeof toolKnowledge] : {}) };
}

export function combinedKnowledge(primary: string | null | undefined, secondary: string | null | undefined) {
  return { primary: knowledgeForTool(primary), secondary: knowledgeForTool(secondary) };
}
