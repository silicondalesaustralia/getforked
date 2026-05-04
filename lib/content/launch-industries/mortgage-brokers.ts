import type { Industry } from "@/types/industry";

export const mortgageBrokers: Industry = {
  slug: "mortgage-brokers",
  name: "Mortgage Brokers",
  status: "published",
  saasTools: ["Salesforce", "MyCRM", "SalesTrekker", "BrokerEngine"],
  monthlyCost: 800,
  pageTitle: "Mortgage Brokers: Fork Your SaaS Stack | getforked.dev",
  metaDescription:
    "Stop renting your CRM. We build custom mortgage broker software you own - lead capture, pipeline tracking, compliance, client nurture - no per-user fees.",
  ogImageText: "Mortgage Brokers: Own Your Code. Stop Renting Your CRM.",
  heroHeadline: "Mortgage Brokers: Fork Your SaaS Stack",
  heroSubtitle: "Typical SaaS spend: $800-$2,500/month",
  supportingText:
    "Between your CRM, marketing automation, document collection tools, compliance trackers, and lead gen platforms - you're renting an entire tech stack that someone else controls. Salesforce alone runs $25-$330/user/month. Add Jungo, email, e-signatures, and client portals. We build it all into one system. Yours. No per-user fees. No aggregator lock-in.",
  painPoints: [
    {
      title: "Per-user CRM pricing that scales against you",
      body: "Salesforce Financial Services Cloud starts at $325/user/month. Add a broker or support staff member and your bill jumps immediately.",
    },
    {
      title: "Aggregator-locked tools you can't take with you",
      body: "MyCRM, Infynity, and SalesTrekker are tied to aggregators. Switch and you risk losing your CRM, data, and workflows.",
    },
    {
      title: "Cobbled-together tech stacks",
      body: "CRM here, document collection there, e-signatures somewhere else, and compliance in spreadsheets.",
    },
    {
      title: "No real ownership of your client data",
      body: "Your client database and referral network live in someone else's system under someone else's terms.",
    },
    {
      title: "Generic tools not built for broking",
      body: "HubSpot does not know loan stages. Monday.com does not understand serviceability. You are paying full price for the wrong shape.",
    },
  ],
  replacementRows: [
    {
      current: "Salesforce / MyCRM / SalesTrekker ($100-$330/user/mo)",
      replacement: "Custom broker CRM - leads, pipeline, client history, referral tracking. No per-user fees.",
    },
    {
      current: "Jungo / BNTouch ($96-$149/mo)",
      replacement: "Mortgage-specific pipeline with loan stage tracking and milestone alerts.",
    },
    {
      current: "ActiveCampaign / Mailchimp ($50-$300/mo)",
      replacement: "Built-in email drip campaigns and SMS nurture triggered by loan milestones.",
    },
    { current: "FileInvite / Floify ($100+/mo)", replacement: "Custom client portal with uploads, checklists, and live status updates." },
    { current: "DocuSign ($25-$65/user/mo)", replacement: "Integrated e-signature capture inside your own portal." },
    { current: "Compliance spreadsheets", replacement: "Audit trails, responsible lending checklists, and auto-generated file notes." },
    { current: "Lead gen landing pages ($75-$200/mo)", replacement: "Custom lead pages integrated directly into your CRM pipeline." },
  ],
  regionalStackExamples: [
    { country: "USA", examples: ["Salesforce", "Jungo", "BNTouch", "Floify", "SimpleNexus"] },
    { country: "Australia", examples: ["MyCRM", "BrokerEngine", "Infynity", "Mercury Nexus", "SalesTrekker"] },
    { country: "UK", examples: ["Twenty7Tec", "Iress Xplan", "Mortgage Brain", "Smartsheet-based workflows"] },
    { country: "Canada", examples: ["Filogix", "Velocity", "BluMortgage", "Pipedrive-based workflows"] },
  ],
  calculatorDefaults: {
    tools: 5,
    averageMonthlyCost: 180,
    multiplier: 1.4,
    breakevenMessage: "You'll own your entire broker tech stack in ~17 months. After that, $0/month. Forever.",
  },
  leadForm: {
    companyLabel: "Brokerage name",
    teamSizeField: { name: "teamSize", label: "Number of brokers", options: ["Solo", "2-5", "6-10", "10+"] },
    extraFields: [
      {
        name: "aggregator",
        label: "Current aggregator",
        options: [
          "Independent",
          "Loan Market",
          "Finsure",
          "AFG",
          "Connective",
          "Mortgage Choice",
          "PLAN",
          "Network / aggregator",
          "Other",
        ],
      },
    ],
    softwareOptions: [
      "Salesforce",
      "MyCRM",
      "SalesTrekker",
      "BrokerEngine",
      "Infynity",
      "Mercury Nexus",
      "HubSpot",
      "Xplan",
      "Jungo",
      "BNTouch",
      "Floify",
      "SimpleNexus",
      "Twenty7Tec",
      "Filogix",
      "Other",
    ],
    spendOptions: ["Under $300", "$300-$800", "$800-$1,500", "$1,500-$3,000", "$3,000+"],
  },
  video: {
    hookScript:
      "You're a mortgage broker paying Salesforce three hundred bucks a user, every month. Got three brokers and a support person? That's fifteen grand a year - for a CRM that doesn't even understand loan stages. What if you owned your own CRM? We build it. You own it. Get forked.",
  },
  seoKeywords: [
    "mortgage broker CRM own",
    "Salesforce alternative mortgage broker",
    "MyCRM alternative",
    "Jungo alternative",
    "Filogix alternative",
    "custom broker CRM",
    "replace MyCRM",
    "mortgage broker software no subscription",
    "broker lead management own code",
  ],
};
