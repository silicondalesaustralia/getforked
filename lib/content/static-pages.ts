import staticPages from "@/content/generated/static-pages.json";

export type StaticPageSection = {
  heading: string;
  paragraphs: string[];
};

export type StaticPageFaq = {
  question: string;
  answer: string;
};

export type StaticPageContent = {
  id: string;
  path: string;
  status: "published" | "draft";
  pageRole: string;
  searchIntent: string;
  commercialJob: string;
  eyebrow: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  heroSummary: string;
  points: string[];
  sections: StaticPageSection[];
  faq: StaticPageFaq[];
  schemaAbout: string[];
  schemaMentions: string[];
  updatedAt: string;
  enrichmentStatus: string;
  ctaHref?: string;
  ctaLabel?: string;
};

const pages = staticPages as StaticPageContent[];

export function getStaticPages() {
  return pages.filter((page) => page.status === "published");
}

export function getStaticPage(id: string) {
  const page = pages.find((item) => item.id === id && item.status === "published");
  if (!page) {
    throw new Error(`Static page not found: ${id}`);
  }
  return page;
}

export function getStaticPageByPath(path: string) {
  const normalized = normalizePath(path);
  return pages.find((page) => page.path === normalized && page.status === "published") ?? null;
}

export function getStaticPageLinks() {
  return getStaticPages()
    .filter((page) => !page.path.startsWith("/blog/") || page.path === "/blog/")
    .map((page) => ({
      href: page.path,
      title: page.h1,
      description: page.metaDescription,
    }));
}

function normalizePath(path: string) {
  if (path === "/") return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}
