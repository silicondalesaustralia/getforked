import type { MetadataRoute } from "next";
import { getPublishedIndustries } from "@/lib/content/industries";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://getforked.dev";
  const core = ["", "/how-it-works", "/pricing", "/about", "/contact", "/book", "/industries"];
  const entries = core.map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  const industryEntries = getPublishedIndustries().map((industry) => ({
    url: `${base}/industries/${industry.slug}`,
    lastModified: new Date(),
  }));

  return [...entries, ...industryEntries];
}
