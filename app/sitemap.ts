import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://getforked.dev";
  const core = [
    "",
    "/how-it-works",
    "/approved-builders",
    "/for-businesses",
    "/for-builders",
    "/pricing",
    "/why-not-upwork",
    "/about",
    "/contact",
    "/support",
    "/terms",
    "/privacy",
  ];
  return core.map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
