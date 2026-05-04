import type { Industry } from "@/types/industry";

export const realEstate: Industry = {
  slug: "real-estate",
  name: "Real Estate Agents",
  status: "published",
  saasTools: ["Rex", "Agentbox", "VaultRE", "Box+Dice"],
  monthlyCost: 1000,
  pageTitle: "Real Estate Agents: Fork Your SaaS Stack | getforked.dev",
  metaDescription:
    "Stop renting Rex, Agentbox, or VaultRE. We build custom real estate CRM software you own - prospecting, listings, buyer matching, marketing - no lock-in.",
  ogImageText: "Real Estate Agents: Own Your Code. Stop Renting Your CRM.",
  heroHeadline: "Real Estate Agents: Fork Your SaaS Stack",
  heroSubtitle: "Typical SaaS spend: $1,000-$3,000/month",
  supportingText:
    "Rex, Agentbox, VaultRE - none of them publish pricing. You had to sit through a demo just to find out what it costs. Your contacts, vendor relationships, and buyer database are locked inside someone else's system. We build a CRM that works exactly like your agency operates. You own every line of code and every record.",
  painPoints: [
    {
      title: "Opaque pricing with no published rates",
      body: "Rex, Agentbox, and VaultRE hide pricing behind sales calls, making comparison harder than it should be.",
    },
    {
      title: "Franchise and network lock-in",
      body: "Switch brands and you can lose years of contact data, prospecting history, and workflow knowledge.",
    },
    {
      title: "Add-on creep that inflates your bill",
      body: "Websites, digital advertising, AI features, property management modules - each quietly increases the monthly bill.",
    },
    {
      title: "Portal listing fees on top of CRM fees",
      body: "You pay for the CRM, then pay again for integrations to push listings to major portals.",
    },
    {
      title: "Data you can't easily take with you",
      body: "Your database is your livelihood. It should be exportable anytime, in any useful format.",
    },
    {
      title: "Generic mobile apps",
      body: "Agents live on phones between inspections and meetings. Mobile should be primary, not an afterthought.",
    },
  ],
  replacementRows: [
    {
      current: "Rex / Agentbox / VaultRE ($150-$400+/office/mo)",
      replacement: "Custom CRM - contacts, listings, buyer matching, vendor pipeline. Your data, no lock-in.",
    },
    { current: "Rex Sites / agency website ($100-$300/mo)", replacement: "Your own agency website with live listings from your CRM." },
    { current: "Rex Reach / digital advertising", replacement: "Social listing promotion tools integrated into your CRM." },
    { current: "ActivePipe / email marketing ($100+/mo)", replacement: "Built-in campaigns for listings, market updates, and prospecting drips." },
    { current: "Separate e-signature tool ($25-$65/user/mo)", replacement: "Integrated e-signatures for contracts and authority forms." },
    { current: "Trust accounting add-on", replacement: "Sales trust accounting and invoicing built into the same system." },
    { current: "Open home apps / inspection tools", replacement: "Open home registration, buyer feedback, and automatic follow-up." },
  ],
  regionalStackExamples: [
    { country: "USA", examples: ["Follow Up Boss", "kvCORE", "BoomTown", "Chime", "Real Geeks"] },
    { country: "Australia", examples: ["Rex", "Agentbox", "VaultRE", "Box+Dice", "Eagle"] },
    { country: "UK", examples: ["Reapit", "Dezrez", "Street.co.uk", "Alto", "Jupix"] },
    { country: "Canada", examples: ["kvCORE", "Follow Up Boss", "RealtyJuggler", "IXACT Contact"] },
  ],
  calculatorDefaults: {
    tools: 5,
    averageMonthlyCost: 200,
    multiplier: 1.4,
    breakevenMessage: "You'll own your entire agency tech stack in ~17 months. After that, $0/month. Forever.",
  },
  leadForm: {
    companyLabel: "Agency name",
    teamSizeField: { name: "teamSize", label: "Number of agents", options: ["Solo", "2-5", "6-10", "10-20", "20+"] },
    extraFields: [
      { name: "agencyType", label: "Agency type", options: ["Independent", "Franchise", "Boutique", "Property Management + Sales", "Commercial", "Other"] },
    ],
    softwareOptions: [
      "Rex",
      "Agentbox (Reapit)",
      "VaultRE",
      "Box+Dice",
      "Eagle",
      "Zenu",
      "MyDesktop",
      "AroSoftware",
      "Follow Up Boss",
      "kvCORE",
      "BoomTown",
      "Chime",
      "Reapit",
      "Dezrez",
      "Street.co.uk",
      "IXACT Contact",
      "Other",
    ],
    spendOptions: ["Under $500", "$500-$1,000", "$1,000-$2,000", "$2,000-$5,000", "$5,000+"],
  },
  video: {
    hookScript:
      "You're a real estate agent. You pay Rex or Agentbox hundreds a month for your CRM. But what does it actually cost? No - because they won't tell you without a sales demo. What if you owned your own CRM? We build it. You own it. Get forked.",
  },
  seoKeywords: [
    "real estate CRM own code",
    "Rex alternative",
    "Agentbox alternative",
    "Follow Up Boss alternative",
    "Reapit alternative",
    "custom real estate software",
    "replace VaultRE",
    "real estate agent CRM no subscription",
    "agency CRM own data",
  ],
};
