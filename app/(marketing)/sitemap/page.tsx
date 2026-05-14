import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage, getStaticPageLinks } from "@/lib/content/static-pages";
import { getPublishedAiAutomationPages, getPublishedZapierPages } from "@/lib/programmatic-pages";
import { buildStaticPageMetadata } from "@/lib/seo/static-page-seo";
import { generateStaticPageSchema } from "@/lib/schema";

const staticPage = getStaticPage("sitemap");
const corePages = getStaticPageLinks().map((page) => ({ href: page.href, label: page.title }));

export const metadata: Metadata = buildStaticPageMetadata(staticPage);

export default function HtmlSitemapPage() {
  const aiAutomationHubs = getPublishedAiAutomationPages(["ai_automation_sub_hub"]);
  const aiAutomationLeaves = getPublishedAiAutomationPages(["ai_automation_leaf"]);
  const zapierHubs = getPublishedZapierPages(["zapier_hub"]);
  const zapierPairs = getPublishedZapierPages(["zapier_pair"]);
  const schema = generateStaticPageSchema({
    path: staticPage.path,
    title: staticPage.seoTitle,
    headline: staticPage.h1,
    description: staticPage.metaDescription,
    about: staticPage.schemaAbout,
    mentions: staticPage.schemaMentions,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="container py-14">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">{staticPage.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{staticPage.h1}</h1>
        <p className="mt-4 max-w-3xl text-zinc-300">{staticPage.heroSummary}</p>

        <SitemapSection title="Core pages" links={corePages} />
        <SitemapSection
          title="AI automation categories"
          links={[{ href: "/ai-automation/", label: "AI automation" }, ...aiAutomationHubs.map(toLink)]}
          columns="lg:grid-cols-3"
        />
        <SitemapSection title="AI automation pages" links={aiAutomationLeaves.map(toLink)} columns="lg:grid-cols-3" />
        <SitemapSection
          title="Zapier categories"
          links={[{ href: "/zapier/", label: "Zapier replacement builders" }, ...zapierHubs.map(toLink)]}
        />
        <SitemapSection title="Zapier integration pairs" links={zapierPairs.map(toLink)} columns="lg:grid-cols-3" />
      </div>
    </>
  );
}

function SitemapSection({
  title,
  links,
  columns = "lg:grid-cols-4",
}: {
  title: string;
  links: { href: string; label: string }[];
  columns?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className={`mt-5 grid gap-3 md:grid-cols-2 ${columns}`}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl border border-border bg-card p-4 transition hover:border-zinc-500">
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function toLink(page: { fullUrl: string; h1Heading: string }) {
  return {
    href: page.fullUrl,
    label: page.h1Heading,
  };
}
