import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedAiAutomationPages, getPublishedZapierPages } from "@/lib/programmatic-pages";

const corePages = [
  { href: "/", label: "Home" },
  { href: "/how-it-works/", label: "How It Works" },
  { href: "/for-businesses/", label: "For Businesses" },
  { href: "/for-builders/", label: "For Builders" },
  { href: "/approved-builders/", label: "Approved Builders" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/why-not-upwork/", label: "Why Not Upwork" },
  { href: "/contact/", label: "Contact" },
  { href: "/support/", label: "Support" },
];

export const metadata: Metadata = {
  title: "HTML Sitemap | GetForked",
  description: "Browse public GetForked pages, AI automation pages, Zapier replacement categories, and integration-pair pages.",
  alternates: {
    canonical: "https://getforked.dev/sitemap/",
  },
};

export default function HtmlSitemapPage() {
  const aiAutomationHubs = getPublishedAiAutomationPages(["ai_automation_sub_hub"]);
  const aiAutomationLeaves = getPublishedAiAutomationPages(["ai_automation_leaf"]);
  const zapierHubs = getPublishedZapierPages(["zapier_hub"]);
  const zapierPairs = getPublishedZapierPages(["zapier_pair"]);

  return (
    <div className="container py-14">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">HTML sitemap</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Browse GetForked pages</h1>
      <p className="mt-4 max-w-3xl text-zinc-300">
        A crawlable index of public pages, including AI automation pages, Zapier replacement categories and integration-pair landing
        pages.
      </p>

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
