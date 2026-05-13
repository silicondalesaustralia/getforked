export const workflowTaxonomy = {
  project_management: {
    tools: ["basecamp", "asana", "trello", "clickup", "monday"],
    entities: ["projects", "tasks", "to-dos", "comments", "deadlines", "assignees", "client updates"],
    failureModes: ["project updates scattered across tools", "manual client follow-up", "duplicate task status updates"],
    replacementPatterns: ["project dashboard", "notification router", "scheduled project report", "approval-aware handoff"],
  },
  spreadsheet_database: {
    tools: ["google-sheets", "sheets", "airtable"],
    entities: ["rows", "records", "fields", "views", "form submissions", "validation rules"],
    failureModes: ["field schema changes", "manual edits bypassing validation", "duplicate records"],
    replacementPatterns: ["validation layer", "approval queue", "scheduled sync", "audit dashboard"],
  },
  communication: {
    tools: ["slack", "gmail", "microsoft-outlook", "outlook"],
    entities: ["messages", "channels", "threads", "inboxes", "alerts", "reply drafts"],
    failureModes: ["alert fatigue", "wrong channel routing", "buried updates", "duplicate notifications"],
    replacementPatterns: ["conditional routing", "message digest", "approval-aware notification", "reply drafting workflow"],
  },
  finance_accounting: {
    tools: ["xero", "quickbooks", "stripe"],
    entities: ["invoices", "payments", "contacts", "line items", "reconciliation", "failed payments"],
    failureModes: ["bad invoice data", "duplicate contacts", "manual reconciliation", "payment status mismatch"],
    replacementPatterns: ["invoice validation workflow", "payment dashboard", "approval queue", "finance exception report"],
  },
  ecommerce: {
    tools: ["shopify", "woocommerce"],
    entities: ["orders", "customers", "refunds", "fulfilment status", "inventory", "abandoned carts"],
    failureModes: ["order sync delays", "inventory mismatch", "manual refund checks", "customer follow-up missed"],
    replacementPatterns: ["order operations dashboard", "fulfilment status workflow", "inventory sync", "refund review queue"],
  },
  crm_marketing: {
    tools: ["activecampaign", "hubspot", "pipedrive", "salesforce", "mailchimp", "ontraport"],
    entities: ["contacts", "deals", "leads", "tags", "lists", "pipeline stages", "email activity"],
    failureModes: ["field mapping breakage", "duplicate contacts", "stale lead status", "missed follow-up"],
    replacementPatterns: ["CRM sync workflow", "lead routing dashboard", "follow-up automation", "contact validation"],
  },
  forms_intake: {
    tools: ["typeform", "jotform", "google-forms"],
    entities: ["form submissions", "answers", "attachments", "lead details", "routing rules"],
    failureModes: ["missing required data", "wrong destination routing", "duplicate submissions", "manual qualification"],
    replacementPatterns: ["intake dashboard", "qualification workflow", "routing rules", "CRM handoff"],
  },
};

export type WorkflowCategory = keyof typeof workflowTaxonomy;

export function categoryForTool(slug: string | null | undefined): WorkflowCategory | "general_workflow" {
  const match = Object.entries(workflowTaxonomy).find(([, item]) => slug && item.tools.includes(slug));
  return (match?.[0] as WorkflowCategory | undefined) ?? "general_workflow";
}
