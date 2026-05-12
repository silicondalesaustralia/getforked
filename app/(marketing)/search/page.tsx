import type { Metadata } from "next";
import Link from "next/link";
import { searchProgrammaticPages } from "@/lib/programmatic-pages";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

const staticPages = [
  { href: "/how-it-works/", title: "How It Works", description: "See the scoped brief-to-build matching process." },
  { href: "/for-businesses/", title: "For Businesses", description: "How business owners reduce the SaaS tax." },
  { href: "/for-builders/", title: "For Builders", description: "Apply to join the approved builder network." },
  { href: "/pricing/", title: "Pricing", description: "GetForked pricing and delivery model." },
  { href: "/about/", title: "About GetForked", description: "Why we started by replacing our own SaaS stack." },
  { href: "/ai-automation/", title: "AI Automation", description: "AI workflow automation and custom systems." },
  { href: "/zapier/", title: "Zapier Replacements", description: "Replace Zapier workflows with owned systems." },
];

export const metadata: Metadata = {
  title: "Search | GetForked",
  description: "Search for a customisation or automation you need.",
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const programmaticMatches = searchProgrammaticPages(query, 30);
  const staticMatches = staticPages.filter((page) => includesQuery(`${page.title} ${page.description}`, query));
  const hasQuery = query.length > 0;
  const total = programmaticMatches.length + staticMatches.length;

  return (
    <main className="container py-12 md:py-16">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Search</h1>
      <form action="/search/" className="mt-6 max-w-3xl">
        <label className="sr-only" htmlFor="site-search-input">
          Search
        </label>
        <input
          id="site-search-input"
          name="q"
          defaultValue={query}
          placeholder="Search for a customisation or automation you need"
          className="h-12 w-full rounded-[10px] border border-[#2a3639] bg-[#050708] px-4 text-zinc-100 placeholder:text-zinc-500"
        />
      </form>

      {!hasQuery ? <p className="mt-5 text-zinc-400">Try searching for CRM, dashboard, workflow or Zapier replacement.</p> : null}
      {hasQuery ? <p className="mt-5 text-zinc-300">Showing {total} results for "{query}".</p> : null}
      {hasQuery && total === 0 ? <p className="mt-5 text-zinc-400">No matches yet. Try broader terms like automation, CRM, or dashboard.</p> : null}

      {staticMatches.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Core pages</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {staticMatches.map((page) => (
              <Link key={page.href} href={page.href} className="rounded-2xl border border-[#243034] bg-[#0F1517] p-5">
                <span className="block font-semibold">{page.title}</span>
                <span className="mt-2 block text-sm text-[#B8C2BE]">{page.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {programmaticMatches.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Automation pages</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmaticMatches.map((page) => (
              <Link key={page.id} href={page.fullUrl} className="rounded-2xl border border-[#243034] bg-[#0F1517] p-5">
                <span className="block font-semibold">{page.h1Heading}</span>
                <span className="mt-2 block text-sm text-[#B8C2BE]">{page.metaDescription}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function includesQuery(value: string, query: string) {
  if (!query.trim()) return false;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}
