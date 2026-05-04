import type { Industry } from "@/types/industry";

export const plumbing: Industry = {
  slug: "plumbing",
  name: "Plumbing",
  status: "published",
  saasTools: ["ServiceTitan", "Housecall Pro", "Jobber", "SimPRO"],
  monthlyCost: 1500,
  pageTitle: "Plumbing: Fork Your SaaS Stack | getforked.dev",
  metaDescription:
    "Stop paying $250-$500/tech/month for ServiceTitan. We build custom plumbing software you own - job scheduling, dispatch, invoicing, pricebook - no monthly fees.",
  ogImageText: "Plumbing: Own Your Code. Stop Renting ServiceTitan.",
  heroHeadline: "Plumbing: Fork Your SaaS Stack",
  heroSubtitle: "Typical SaaS spend: $1,500-$4,000/month",
  supportingText:
    "A 5-tech plumbing company pays $1,225-$1,990/month in ServiceTitan fees alone - before add-ons. That's $15,000-$24,000/year renting software someone else owns. Add Jobber, Housecall Pro, or SimPRO and you're bleeding even more. We build the same tools, customised to how your team actually works. You own the code. No per-technician fees. No contracts. No price hikes.",
  painPoints: [
    {
      title: "Per-technician pricing that punishes growth",
      body: "ServiceTitan charges $245-$500 per tech per month. Add 3 techs next year and your bill jumps $750-$1,500/month automatically.",
    },
    {
      title: "$5K-$50K implementation fees before you even start",
      body: "Onboarding can take 2-12 months and cost thousands upfront while some contractors pay full subscriptions before go-live.",
    },
    {
      title: "Bloated features you'll never use",
      body: "You need scheduling, dispatch, quoting, and invoicing - not enterprise marketing suites built for 50-tech operations.",
    },
    {
      title: "Contract lock-in and cancellation traps",
      body: "Minimum 12-month contracts and messy data retrieval make cancelling harder than it should be.",
    },
    {
      title: "Mobile app gaps",
      body: "Techs in the field need reliable tools, not a half-baked mobile experience with missing features.",
    },
  ],
  replacementRows: [
    {
      current: "ServiceTitan / Housecall Pro / Jobber ($245-$500/tech/mo)",
      replacement: "Custom job management - scheduling, dispatch, tech assignment. No per-user fees.",
    },
    {
      current: "Pricebook Pro add-on ($50-$150/user/mo extra)",
      replacement: "Your own flat-rate pricebook with supplier catalogue integration and auto-price updates.",
    },
    {
      current: "Marketing Pro add-on",
      replacement: "Built-in customer comms: en-route texts, follow-up emails, and review requests.",
    },
    {
      current: "QuickBooks / Xero integration",
      replacement: "Native invoicing with direct accounting sync - no middleware.",
    },
    { current: "Separate GPS / fleet tracking tool", replacement: "Built-in tech location tracking on the dispatch board." },
    { current: "Phone system add-on", replacement: "Call tracking and recording integrated into customer records." },
  ],
  regionalStackExamples: [
    { country: "USA", examples: ["ServiceTitan", "Housecall Pro", "Jobber", "Service Fusion"] },
    { country: "Australia", examples: ["ServiceM8", "Fergus", "SimPRO", "Tradify"] },
    { country: "UK", examples: ["Joblogic", "Commusoft", "BigChange", "Tradify"] },
    { country: "Canada", examples: ["Jobber", "Housecall Pro", "ServiceTitan", "Workiz"] },
  ],
  calculatorDefaults: {
    tools: 4,
    averageMonthlyCost: 350,
    multiplier: 1.4,
    breakevenMessage: "You'll own your entire plumbing software stack in ~17 months. After that, $0/month. Forever.",
  },
  leadForm: {
    companyLabel: "Business name",
    teamSizeField: { name: "teamSize", label: "Number of technicians", options: ["1-5", "6-10", "11-20", "20+"] },
    softwareOptions: [
      "ServiceTitan",
      "Housecall Pro",
      "Jobber",
      "SimPRO",
      "Fergus",
      "ServiceM8",
      "Tradify",
      "Joblogic",
      "Commusoft",
      "BigChange",
      "Workiz",
      "Other",
    ],
    spendOptions: ["Under $500", "$500-$1,000", "$1,000-$2,000", "$2,000-$5,000", "$5,000+"],
  },
  video: {
    hookScript:
      "You're a plumber paying ServiceTitan $300 a tech, every month, forever. Five techs? That's eighteen grand a year - for software you don't even own. What if you owned your own job management system? Custom-built for your workflow. No per-tech fees. No contracts. We build it. You own it. Get forked.",
  },
  seoKeywords: [
    "plumbing software own",
    "ServiceTitan alternative",
    "Jobber alternative",
    "ServiceM8 alternative",
    "Joblogic alternative",
    "custom plumbing job management",
    "replace ServiceTitan",
    "plumbing dispatch software no subscription",
    "plumbing CRM own code",
  ],
};
