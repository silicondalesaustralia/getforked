import type { MetadataRoute } from "next";
import { getPublishedAiAutomationPages, getPublishedShopifyPages, getPublishedZapierPages } from "@/lib/programmatic-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://getforked.dev";
  const staticPages = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/ai-automation/", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/zapier/", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/shopify/", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/how-it-works/", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/for-businesses/", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/for-builders/", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/pricing/", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/approved-builders/", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/why-not-upwork/", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about/", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/contact/", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/support/", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/sitemap/", changeFrequency: "weekly" as const, priority: 0.5 },
    { path: "/terms/", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/privacy/", changeFrequency: "yearly" as const, priority: 0.3 },
  ];
  const staticEntries = staticPages.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
  const aiAutomationPages = getPublishedAiAutomationPages();
  const aiAutomationEntries = aiAutomationPages.map((page) => ({
    url: `${base}${page.fullUrl}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly" as const,
    priority: page.priority === 1 ? 0.8 : page.priority === 2 ? 0.7 : 0.6,
  }));
  const zapierPages = await getPublishedZapierPages(["zapier_hub", "zapier_pair"]);
  const zapierEntries = zapierPages.map((page) => ({
    url: `${base}${page.fullUrl}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly" as const,
    priority: page.priority === 1 ? 0.8 : page.priority === 2 ? 0.7 : 0.6,
  }));
  const shopifyPages = getPublishedShopifyPages(["shopify_app"]);
  const shopifyEntries = shopifyPages.map((page) => ({
    url: `${base}${page.fullUrl}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly" as const,
    priority: page.priority === 1 ? 0.8 : page.priority === 2 ? 0.7 : 0.6,
  }));

  return [...staticEntries, ...aiAutomationEntries, ...zapierEntries, ...shopifyEntries];
}
