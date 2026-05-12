import { buildBriefUrl } from "@/lib/brief-prefill";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";

type JsonLd = Record<string, unknown>;
type Thing = { "@type": "Thing"; name: string };

const siteUrl = "https://getforked.dev";

export function generatePageSchema(page: ProgrammaticPage, relatedPages: ProgrammaticPage[] = []) {
  const graph: JsonLd[] = [organizationSchema(), websiteSchema(), webpageSchema(page), serviceSchema(page), breadcrumbSchema(page)];

  if (isIndexPage(page) && relatedPages.length > 0) {
    graph.push(itemListSchema(page, relatedPages));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "GetForked",
    url: `${siteUrl}/`,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteUrl}/#logo`,
      url: `${siteUrl}/logo.png`,
      contentUrl: `${siteUrl}/logo.png`,
      caption: "GetForked",
    },
    description:
      "GetForked matches businesses with approved builders for AI automation, Zapier replacement workflows, custom dashboards, internal tools, and workflow automation projects.",
    sameAs: [],
    knowsAbout: [
      "AI workflow automation",
      "Zapier replacement workflows",
      "Business process automation",
      "Google Sheets automation",
      "Custom CRM software",
      "API integrations",
      "Internal business tools",
      "Workflow dashboards",
      "AI admin assistants",
      "Customer support automation",
      "Sales automation",
      "Lead management automation",
      "Invoice automation",
      "No-code automation replacement",
      "SaaS replacement",
      "Business operations automation",
    ],
  };
}

function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: "GetForked",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    inLanguage: "en",
  };
}

function webpageSchema(page: ProgrammaticPage) {
  return {
    "@type": "WebPage",
    "@id": `${siteUrl}${page.fullUrl}#webpage`,
    url: `${siteUrl}${page.fullUrl}`,
    name: page.pageTitle,
    headline: page.h1Heading,
    description: page.metaDescription,
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    about: aboutThings(page),
    mentions: mentionThings(page),
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${siteUrl}/og/${page.siloSlug}.png`,
    },
    dateModified: dateOnly(page.updatedAt),
    datePublished: dateOnly(page.updatedAt),
    inLanguage: "en",
  };
}

function serviceSchema(page: ProgrammaticPage) {
  return {
    "@type": "Service",
    "@id": `${siteUrl}${page.fullUrl}#service`,
    name: page.h1Heading,
    description: page.metaDescription,
    serviceType: page.entityAttributePair || page.h1Heading,
    provider: {
      "@id": `${siteUrl}/#organization`,
    },
    areaServed: {
      "@type": "Place",
      name: "Worldwide",
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        page.siloSlug === "zapier"
          ? "Businesses using Zapier workflows"
          : "Businesses looking to automate workflows with AI",
    },
    category: serviceCategories(page),
    termsOfService: `${siteUrl}/terms/`,
    url: `${siteUrl}${page.fullUrl}`,
    potentialAction: {
      "@type": "OrderAction",
      name: page.primaryCta || "Submit Your Brief",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}${buildBriefUrl(page)}`,
        actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"],
      },
    },
  };
}

function breadcrumbSchema(page: ProgrammaticPage) {
  const siloCrumb =
    page.siloSlug === "ai-automation"
      ? { name: "AI Automation", item: `${siteUrl}/ai-automation/` }
      : { name: "Zapier Replacements", item: `${siteUrl}/zapier/` };
  const items = [{ name: "Home", item: `${siteUrl}/` }, siloCrumb];

  if (!isIndexPage(page)) {
    items.push({ name: breadcrumbLeafName(page), item: `${siteUrl}${page.fullUrl}` });
  }

  return {
    "@type": "BreadcrumbList",
    "@id": `${siteUrl}${page.fullUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function breadcrumbLeafName(page: ProgrammaticPage) {
  if (page.siloSlug === "ai-automation" && page.pageSlug === "ai-workflow-automation") {
    return "AI Workflow Automation";
  }
  return page.h1Heading;
}

function itemListSchema(page: ProgrammaticPage, relatedPages: ProgrammaticPage[]) {
  return {
    "@type": "ItemList",
    "@id": `${siteUrl}${page.fullUrl}#itemlist`,
    name: page.siloSlug === "zapier" ? "Zapier replacement pages" : "AI automation landing pages",
    itemListElement: relatedPages.slice(0, 30).map((related, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${related.fullUrl}`,
      name: related.h1Heading,
    })),
  };
}

function aboutThings(page: ProgrammaticPage): Thing[] {
  if (page.siloSlug === "zapier") {
    return toThings([
      page.appPrimary ? `${displayName(page.appPrimary)} automation` : "Zapier replacement",
      "Zapier replacement",
      "Workflow automation",
      "API connectors",
    ]);
  }

  return toThings([page.primaryKeyword, "Business process automation", "Workflow automation", "AI automation"]);
}

function mentionThings(page: ProgrammaticPage): Thing[] {
  if (page.siloSlug === "zapier") {
    return toThings([
      page.appPrimary ? `${displayName(page.appPrimary)} API` : "API integrations",
      "scheduled sync",
      "workflow dashboards",
      "task volume",
      "manual data cleanup",
    ]);
  }

  return toThings([
    "human-in-the-loop review",
    "approval workflows",
    "AI summarisation",
    "AI classification",
    "API integrations",
    "workflow dashboards",
  ]);
}

function serviceCategories(page: ProgrammaticPage) {
  return page.siloSlug === "zapier"
    ? ["Zapier replacement", "Workflow automation", "API integration"]
    : ["AI automation", "Workflow automation", "Business process automation"];
}

function toThings(values: Array<string | null | undefined>) {
  return [...new Set(values.filter(isString))].map((name) => ({ "@type": "Thing" as const, name }));
}

function displayName(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (part === "ai") return "AI";
      if (part === "api") return "API";
      if (part === "crm") return "CRM";
      if (part === "fb") return "Facebook";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function dateOnly(value: string) {
  return value.split("T")[0] || value;
}

function isIndexPage(page: ProgrammaticPage) {
  return page.pageType === "zapier_index" || page.pageType === "ai_automation_index";
}

function isString(value: string | null | undefined): value is string {
  return Boolean(value);
}
