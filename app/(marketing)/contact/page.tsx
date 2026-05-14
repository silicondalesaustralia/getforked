import { ContactForm } from "@/components/marketplace/contact-form";
import { EnrichedStaticPage } from "@/components/marketplace/enriched-static-page";
import { getStaticPage } from "@/lib/content/static-pages";
import { buildStaticPageMetadata } from "@/lib/seo/static-page-seo";
import { generateStaticPageSchema } from "@/lib/schema";

const staticPage = getStaticPage("contact");

export const metadata = buildStaticPageMetadata(staticPage);

export default function ContactPage() {
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
        <div className="mt-4 rounded-xl border border-border bg-card p-4 text-zinc-200">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Business address</p>
          <p className="mt-2 leading-7">
            41B Luck St
            <br />
            Macclesfield, South Australian, 5153
          </p>
        </div>
        <div className="mt-6">
          <ContactForm endpoint="/api/contact" />
        </div>
      </EnrichedStaticPage>
    </>
  );
}
