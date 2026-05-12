import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ZapierLandingPage } from "@/components/zapier/zapier-landing-page";
import { getPublishedZapierPageBySlug, getPublishedZapierPages, getRelatedPages } from "@/lib/programmatic-pages";
import { generatePageSchema } from "@/lib/schema";
import { normaliseZapierSlug } from "@/lib/url-normalisation";

type Props = {
  params: Promise<{ page_slug: string }>;
};

export async function generateStaticParams() {
  const pages = await getPublishedZapierPages(["zapier_hub", "zapier_pair"]);
  return pages.map((page) => ({ page_slug: page.pageSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page_slug: pageSlug } = await params;
  const normalisedSlug = normaliseZapierSlug(pageSlug);
  if (normalisedSlug !== pageSlug) {
    return {};
  }

  const page = await getPublishedZapierPageBySlug(pageSlug);
  if (!page) {
    return {};
  }

  return {
    title: page.pageTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `https://getforked.dev${page.fullUrl}`,
    },
    openGraph: {
      title: page.pageTitle,
      description: page.metaDescription,
      url: `https://getforked.dev${page.fullUrl}`,
      type: "website",
      siteName: "GetForked",
    },
  };
}

export default async function ZapierProgrammaticPage({ params }: Props) {
  const { page_slug: pageSlug } = await params;
  const normalisedSlug = normaliseZapierSlug(pageSlug);

  if (normalisedSlug !== pageSlug) {
    permanentRedirect(`/zapier/${normalisedSlug}/`);
  }

  const page = await getPublishedZapierPageBySlug(pageSlug);
  if (!page) {
    notFound();
  }

  const relatedPages = await getRelatedPages(page);
  const schema = generatePageSchema(page, relatedPages);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ZapierLandingPage page={page} relatedPages={relatedPages} />
    </>
  );
}
