export const aiAutomationConsolidationMap: Record<string, string> = {
  "ai-workflow-automation-tools": "ai-workflow-automation",
  "ai-for-workflow-automation": "ai-workflow-automation",
  "ai-agent-workflow-automation": "ai-workflow-automation",

  "ai-for-business-process-automation": "business-process-automation-with-ai",
  "business-process-automation-ai": "business-process-automation-with-ai",
  "ai-in-business-process-automation": "business-process-automation-with-ai",
  "ai-business-process-automation": "business-process-automation-with-ai",

  "sales-automation-ai": "ai-sales-automation",
  "ai-sales-automation-tools": "ai-sales-automation",
  "ai-for-sales-automation": "ai-sales-automation",

  "task-automation-ai": "ai-task-automation",
  "ai-tools-for-task-automation": "ai-task-automation",

  "accounting-automation-ai": "ai-accounting-automation",
  "ai-tools-for-hr-automation": "ai-and-automation-in-hr",
  "agentic-ai-workflow-automation": "agentic-ai-automation",

  "ai-and-process-automation": "ai-process-automation",
  "ai-for-process-automation": "ai-process-automation",

  "ai-agent-automation": "ai-workflow-automation",
  "ai-automation-agent": "ai-workflow-automation",

  "ai-for-email-automation": "ai-email-automation",
  "ai-email-automation-tools": "ai-email-automation",

  "best-ai-sales-automation-tools": "best-ai-sales-automation-software",
  "best-crm-with-ai-sales-automation": "best-ai-sales-automation-software",

  "healthcare-ai-automation": "ai-automation-in-healthcare",
  "ai-automation-for-healthcare": "ai-automation-in-healthcare",

  "ai-document-automation-software": "ai-document-automation",
  "document-automation-ai": "ai-document-automation",

  "ai-agents-workflow-automation": "ai-agents-automation",
  "ai-agents-for-automation": "ai-agents-automation",
  "ai-automation-agents": "ai-agents-automation",
  "ai-agents-for-workflow-automation": "ai-agents-automation",

  "ai-customer-service-automation-solutions": "ai-customer-service-automation",
  "customer-service-automation-ai": "ai-customer-service-automation",
  "ai-customer-service-automation-tools": "ai-customer-service-automation",

  "accounts-payable-automation-ai": "ai-accounts-payable-automation-software",
  "ai-email-automation-for-customer-support": "ai-customer-support-automation",

  "ai-for-data-entry-automation": "ai-data-entry-automation",
  "ai-tools-for-data-entry-automation": "ai-data-entry-automation",
};

export function getCanonicalProgrammaticSlug(silo: string, slug: string) {
  if (silo === "ai-automation") {
    return aiAutomationConsolidationMap[slug] ?? slug;
  }
  return slug;
}

export function isConsolidatedAlias(silo: string, slug: string) {
  return getCanonicalProgrammaticSlug(silo, slug) !== slug;
}
