import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage, getStaticPageLinks } from "@/lib/content/static-pages";
import { searchProgrammaticPages } from "@/lib/programmatic-pages";
import { buildStaticPageMetadata } from "@/lib/seo/static-page-seo";
import { generateStaticPageSchema } from "@/lib/schema";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

const staticPage = getStaticPage("search");
const staticPages = getStaticPageLinks();

export const metadata: Metadata = buildStaticPageMetadata(staticPage);

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const schema = generateStaticPageSchema({
    path: staticPage.path,
    title: staticPage.seoTitle,
    headline: staticPage.h1,
    description: staticPage.metaDescription,
    about: staticPage.schemaAbout,
    mentions: staticPage.schemaMentions,
  });
  const programmaticMatches = searchProgrammaticPages(query, 30);
  const staticMatches = staticPages.filter((page) => includesQuery(`${page.title} ${page.description}`, query));
  const hasQuery = query.length > 0;
  const total = programmaticMatches.length + staticMatches.length;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="container py-12 md:py-16">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{staticPage.h1}</h1>
        <p className="mt-4 max-w-3xl text-zinc-300">{staticPage.heroSummary}</p>
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
    </>
  );
}

function includesQuery(value: string, query: string) {
  if (!query.trim()) return false;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}
