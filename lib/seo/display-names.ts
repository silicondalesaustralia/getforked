export const toolDisplayNames: Record<string, string> = {
  activecampaign: "ActiveCampaign",
  airtable: "Airtable",
  asana: "Asana",
  basecamp: "Basecamp",
  clickup: "ClickUp",
  "facebook-lead-ads": "Facebook Lead Ads",
  "fb-leads": "Facebook Lead Ads",
  gmail: "Gmail",
  "google-calendar": "Google Calendar",
  calendar: "Google Calendar",
  "google-contacts": "Google Contacts",
  "google-drive": "Google Drive",
  "google-forms": "Google Forms",
  "google-sheets": "Google Sheets",
  sheets: "Google Sheets",
  hubspot: "HubSpot",
  jotform: "Jotform",
  mailchimp: "Mailchimp",
  "microsoft-outlook": "Microsoft Outlook",
  outlook: "Microsoft Outlook",
  monday: "Monday.com",
  notion: "Notion",
  ontraport: "Ontraport",
  pipedrive: "Pipedrive",
  quickbooks: "QuickBooks",
  salesforce: "Salesforce",
  servicem8: "ServiceM8",
  shopify: "Shopify",
  slack: "Slack",
  stripe: "Stripe",
  trello: "Trello",
  twilio: "Twilio",
  typeform: "Typeform",
  woocommerce: "WooCommerce",
  xero: "Xero",
};

export function displayName(slug: string | null | undefined) {
  if (!slug) return "";
  return (
    toolDisplayNames[slug] ||
    slug
      .split("-")
      .filter(Boolean)
      .map((part) => (part === "ai" ? "AI" : part === "api" ? "API" : part.charAt(0).toUpperCase() + part.slice(1)))
      .join(" ")
  );
}
