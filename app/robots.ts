import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/ai-automation/",
          "/zapier/",
          "/how-it-works/",
          "/for-businesses/",
          "/for-builders/",
          "/pricing/",
        ],
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/brief/internal/",
          "/onboarding/",
          "/search/",
          "/filter/",
          "/tag/",
          "/results/",
        ],
      },
    ],
    sitemap: "https://getforked.dev/sitemap.xml",
  };
}
