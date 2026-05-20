import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { slugifyProgrammaticPart } from "@/lib/url-normalisation";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";

const keywordFile = process.env.SHOPIFY_KEYWORDS_PATH ?? "content/inputs/shopify-keywords.txt";
const outputPath = process.env.SHOPIFY_OUTPUT_PATH ?? "content/generated/shopify-pages.json";
const updatedAt = new Date().toISOString();

const topicRules: Array<{ slug: string; label: string; match: RegExp }> = [
  { slug: "custom-app-development", label: "Custom App Development", match: /\bcustom app|replace app with custom\b/i },
  { slug: "subscription", label: "Subscription", match: /\bsubscription\b/i },
  { slug: "inventory-management", label: "Inventory Management", match: /\binventory\b/i },
  { slug: "shipping", label: "Shipping", match: /\bshipping|rate calculator|multi-origin\b/i },
  { slug: "bundles", label: "Bundles", match: /\bbundle|bundles\b/i },
  { slug: "upsell-cross-sell", label: "Upsell and Cross-sell", match: /\bupsell|cross-sell\b/i },
  { slug: "returns", label: "Returns", match: /\breturns?\b/i },
  { slug: "loyalty-rewards", label: "Loyalty and Rewards", match: /\bloyalty|rewards\b/i },
  { slug: "b2b-wholesale", label: "B2B and Wholesale", match: /\bb2b|wholesale\b/i },
  { slug: "booking-appointments", label: "Booking and Appointments", match: /\bbooking|appointment\b/i },
  { slug: "pre-order", label: "Pre-order", match: /\bpre-order\b/i },
  { slug: "product-customization", label: "Product Customization", match: /\bcustomizer|product options|add-ons\b/i },
  { slug: "quickbooks-integration", label: "QuickBooks Integration", match: /\bquickbooks\b/i },
  { slug: "xero-integration", label: "Xero Integration", match: /\bxero\b/i },
  { slug: "netsuite-integration", label: "NetSuite Integration", match: /\bnetsuite\b/i },
  { slug: "amazon-integration", label: "Amazon Integration", match: /\bamazon\b/i },
  { slug: "fulfilment", label: "Fulfilment", match: /\bfulfilment\b/i },
  { slug: "invoice", label: "Invoice", match: /\binvoice\b/i },
  { slug: "tracking", label: "Tracking", match: /\btracking\b/i },
  { slug: "back-in-stock", label: "Back In Stock", match: /\bback in stock\b/i },
  { slug: "order-printer", label: "Order Printer", match: /\border printer\b/i },
  { slug: "purchase-order", label: "Purchase Order", match: /\bpurchase order\b/i },
  { slug: "local-delivery", label: "Local Delivery", match: /\blocal delivery\b/i },
  { slug: "request-a-quote", label: "Request a Quote", match: /\brequest a quote\b/i },
  { slug: "product-feed", label: "Product Feed", match: /\bproduct feed\b/i },
  { slug: "google-shopping-feed", label: "Google Shopping Feed", match: /\bgoogle shopping feed\b/i },
  { slug: "mechanic-alternative", label: "Mechanic Alternative", match: /\bmechanic\b/i },
  { slug: "matrixify-alternative", label: "Matrixify Alternative", match: /\bmatrixify\b/i },
  { slug: "metafields", label: "Metafields", match: /\bmetafields\b/i },
  { slug: "customer-accounts", label: "Customer Accounts", match: /\bcustomer accounts\b/i },
  { slug: "barcode-labels", label: "Barcode Labels", match: /\bbarcode labels?\b/i },
  { slug: "pos", label: "POS", match: /\bpos\b/i },
  { slug: "seo", label: "SEO", match: /\bseo\b/i },
  { slug: "membership", label: "Membership", match: /\bmembership\b/i },
];

const keywords = readFileSync(keywordFile, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const grouped = keywords.reduce((map, keyword) => {
  const rule = topicRules.find((candidate) => candidate.match.test(keyword));
  if (!rule) return map;
  map.set(rule.slug, { label: rule.label, keywords: [...(map.get(rule.slug)?.keywords ?? []), keyword] });
  return map;
}, new Map<string, { label: string; keywords: string[] }>());

const appPages = [...grouped.entries()].map(([slug, entry], index) => buildAppPage(slug, entry.label, entry.keywords, index + 2));
const pages = [buildIndexPage(appPages), ...appPages];

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(pages, null, 2)}\n`);
console.info(JSON.stringify({ source: keywordFile, output: outputPath, pages: pages.length, seededApps: appPages.length }, null, 2));

function buildIndexPage(appPages: ProgrammaticPage[]): ProgrammaticPage {
  return {
    ...basePage("shopify", "App Stack", ["shopify app replacement", "shopify custom app"], 1, "/shopify/", "shopify_index"),
    id: "shopify-index",
    pageTitle: "Shopify App Replacement Pages | GetForked",
    h1Heading: "Replace Shopify App Dependencies with Owned Workflows",
    metaDescription: "Explore Shopify app replacement pages for subscriptions, inventory, shipping, returns, loyalty, and integrations you can own.",
    attribute: "shopify app replacement",
    entityAttributePair: "Shopify App Replacement",
    macroContext: "Replacing Shopify app dependencies with owned workflows",
    contextualVector: "H1: Replace Shopify App Dependencies\nH2: Common Shopify app workflows to replace\nH2: What an owned replacement controls\nH2: Submit a scoped replacement brief",
    introSummary: "This hub links Shopify app replacement workflows where stores outgrow app-only setups and need direct ownership.",
    heroSummary: "Use these pages to scope Shopify app replacements by workflow category and submit a builder-ready brief.",
    appPrimary: "shopify",
    appPrimaryShort: "shopify",
    sourceParam: "shopify-index",
    integrationDirection: "Shopify app dependency to owned custom workflow",
    triggerEvent: "Store workflow blocked by app constraints",
    destinationAction: "Scoped replacement brief and builder match",
    briefPrefillTools: "shopify",
    seedLinks: appPages.slice(0, 10).map((page) => page.fullUrl).join(", "),
    nodeLinks: appPages.slice(10, 20).map((page) => page.fullUrl).join(", "),
  };
}

function buildAppPage(slug: string, label: string, topicKeywords: string[], priority: number): ProgrammaticPage {
  const fullUrl = `/shopify/${slugifyProgrammaticPart(slug)}/`;
  return {
    ...basePage(slug, label, topicKeywords, priority, fullUrl, "shopify_app"),
    id: `shopify-${slug}`,
    appPrimary: slug,
    appPrimaryShort: slug,
    sourceParam: `shopify-${slug}`,
    integrationDirection: `Shopify ${label.toLowerCase()} app to owned custom workflow`,
    triggerEvent: `Store event requiring ${label.toLowerCase()} control`,
    destinationAction: "Owned app behavior with review and exception handling",
    briefPrefillTools: `shopify,${slug}`,
  };
}

function basePage(slug: string, label: string, topicKeywords: string[], priority: number, fullUrl: string, pageType: ProgrammaticPage["pageType"]): ProgrammaticPage {
  const primaryKeyword = topicKeywords[0] || `shopify ${label.toLowerCase()} app`;
  return {
    id: "",
    siloSlug: "shopify",
    pageSlug: slug,
    fullUrl,
    pageType,
    status: "published",
    priority,
    pageTitle: `Replace Shopify ${label} App with a Custom Build | GetForked`,
    h1Heading: `Replace Shopify ${label} App with an Owned Workflow`,
    metaDescription: `Scope a custom Shopify ${label.toLowerCase()} replacement that keeps your workflow owned, reviewable, and easier to adapt than app-only setups.`,
    canonicalUrl: `https://getforked.dev${fullUrl}`,
    centralEntity: "Shopify",
    attribute: `${label} app replacement`,
    entityAttributePair: `Shopify ${label} Replacement`,
    macroContext: `Replacing Shopify ${label.toLowerCase()} app dependency with an owned workflow`,
    microContexts: "Shopify app replacement; workflow ownership; app sprawl reduction; custom implementation",
    centralSearchIntent: "Replacing a Shopify app dependency with an owned custom build",
    sourceContextBridge: "GetForked scopes the replacement brief and matches it with approved builders.",
    contextualVector: `H1: Replace Shopify ${label} App\nH2: Why stores outgrow app-only setups\nH2: What an owned replacement controls\nH2: How GetForked scopes and matches builders`,
    appPrimary: null, appSecondary: null, appPrimaryShort: null, appSecondaryShort: null,
    integrationDirection: "", triggerEvent: "", destinationAction: "",
    introSummary: `Many stores rely on Shopify ${label.toLowerCase()} apps, but the workflow often needs tighter control as complexity grows.`,
    heroSummary: `GetForked helps scope a custom Shopify ${label.toLowerCase()} replacement that your business can own and evolve.`,
    problemSummary: `App-first setups can become brittle when store rules, edge cases, and reporting needs outgrow default app behavior.`,
    replacementSummary: "A custom build can preserve outcomes while adding store-specific rules, better visibility, and clearer exception handling.",
    uniqueContentAngle: `Shopify ${label} replacement page focused on owning the workflow and reducing app dependency.`,
    bodyHtml: `<h2>Why Shopify ${label} app workflows get stuck</h2><p>As store operations evolve, app defaults can create hidden manual fixes and overlapping subscriptions.</p><h2>What a custom replacement can control</h2><p>A scoped build can add store-specific rule handling, review states, and clearer operational visibility.</p>`,
    supplementaryBridge: "Related Shopify app replacement pages by workflow category.",
    mainContentFormat: "problem-solution",
    primaryCta: `Scope My Shopify ${label} Replacement`,
    secondaryCta: "See replacement fit",
    briefPrefillCategory: "replace-shopify-app",
    briefPrefillTools: "",
    buyerPainPoint: `The ${label.toLowerCase()} workflow works until edge cases and scale make app constraints expensive to manage.`,
    projectType: "Shopify app replacement workflow",
    sourceParam: "",
    zapierCostContext: "Shopify app costs can grow with feature add-ons, app overlap, and manual reconciliation work.",
    estimatedTaskVolume: "Varies by order volume and workflow complexity",
    customBuildContext: "A scoped custom app can reduce app sprawl while keeping the workflow owned by the store.",
    costComparisonHtml: "<table><thead><tr><th>Cost factor</th><th>Shopify app stack</th><th>Custom build</th></tr></thead><tbody><tr><td>Recurring fees</td><td>Monthly app subscriptions and add-ons.</td><td>Scoped implementation with ownership and maintenance choices.</td></tr><tr><td>Control</td><td>App-defined behavior.</td><td>Store-defined rules and exception handling.</td></tr></tbody></table>",
    builderSkillProfile: "Shopify app architecture, data modeling, automation rules, QA, and handover documentation.",
    builderMatchFactors: "Workflow complexity, app overlap, integration risk, and builder delivery history.",
    requiredBuilderBadges: "Shopify app development, workflow automation, API integrations",
    trustProofElements: "Approved builders only. Scoped before implementation.",
    groundednessSignals: "No unsupported savings claims; practical ownership framing.",
    temporalFreshness: "Refresh examples and platform assumptions quarterly.",
    lastVerifiedNote: "Seeded from Shopify keyword list.",
    primaryKeyword,
    secondaryKeywords: topicKeywords.slice(1, 7).join(", "),
    semanticTerms: "Shopify app replacement, custom Shopify app, owned workflow, SaaS tax reduction",
    rootLink: "/shopify/",
    seedLinks: "/shopify/",
    nodeLinks: "",
    crossSiloLinks: "",
    anchorTexts: "shopify app replacement | custom shopify workflow | owned store systems",
    relatedPageIds: "",
    imageAltPrimary: `Shopify ${label} app replacement workflow`,
    imageUrlSlug: slug,
    workflowBeforeLabel: `Store uses a third-party Shopify ${label.toLowerCase()} app with manual fixes for exceptions.`,
    workflowAfterLabel: `Store runs an owned Shopify ${label.toLowerCase()} workflow with explicit rules and review controls.`,
    schemaType: "Service",
    updatedAt,
  };
}
