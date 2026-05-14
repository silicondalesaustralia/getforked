import Link from "next/link";
import { EnrichedStaticPage } from "@/components/marketplace/enriched-static-page";
import { getPublishedIndustries } from "@/lib/content/industries";
import { getStaticPage } from "@/lib/content/static-pages";
import { buildStaticPageMetadata } from "@/lib/seo/static-page-seo";
import { generateStaticPageSchema } from "@/lib/schema";

const staticPage = getStaticPage("industries");

export const metadata = buildStaticPageMetadata(staticPage);

export default function IndustriesIndexPage() {
  const industries = getPublishedIndustries();
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
      <EnrichedStaticPage page={staticPage}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {industries.map((industry) => (
            <Link key={industry.slug} href={`/industries/${industry.slug}`} className="rounded-xl border border-zinc-800 p-5 transition hover:border-zinc-600">
              <h2 className="font-semibold">{industry.name}</h2>
              <p className="mt-2 text-sm text-zinc-300">{industry.metaDescription}</p>
            </Link>
          ))}
        </div>
      </EnrichedStaticPage>
    </>
  );
}
