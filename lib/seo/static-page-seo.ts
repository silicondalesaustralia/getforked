import type { Metadata } from "next";
import type { StaticPageContent } from "@/lib/content/static-pages";

const siteUrl = "https://getforked.dev";

type StaticMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function buildStaticMetadata(input: StaticMetadataInput): Metadata {
  const fullPath = normalizePath(input.path);
  const canonicalUrl = `${siteUrl}${fullPath}`;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      type: "website",
      url: canonicalUrl,
      siteName: "GetForked",
    },
    twitter: {
      title: input.title,
      description: input.description,
      card: "summary_large_image",
    },
  };
}

export function buildStaticPageMetadata(page: StaticPageContent): Metadata {
  return buildStaticMetadata({
    title: page.seoTitle,
    description: page.metaDescription,
    path: page.path,
  });
}

function normalizePath(path: string) {
  if (path === "/") return "/";
  if (!path.startsWith("/")) return `/${path}/`;
  return path.endsWith("/") ? path : `${path}/`;
}
