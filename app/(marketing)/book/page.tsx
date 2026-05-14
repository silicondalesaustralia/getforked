import { LeadForm } from "@/components/forms/lead-form";
import { EnrichedStaticPage } from "@/components/marketplace/enriched-static-page";
import { getStaticPage } from "@/lib/content/static-pages";
import { buildStaticPageMetadata } from "@/lib/seo/static-page-seo";
import { generateStaticPageSchema } from "@/lib/schema";

const staticPage = getStaticPage("book");

export const metadata = buildStaticPageMetadata(staticPage);

export default function BookPage() {
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
        <div className="mt-6 max-w-xl">
          <LeadForm source="book_page" />
        </div>
      </EnrichedStaticPage>
    </>
  );
}
