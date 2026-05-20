import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ShopifyPage } from "@/components/shopify/shopify-page";
import { generatePageSchema } from "@/lib/schema";
import { getPublishedShopifyPageBySlug, getPublishedShopifyPages, getRelatedPages } from "@/lib/programmatic-pages";
import { slugifyProgrammaticPart } from "@/lib/url-normalisation";

type Props = {
  params: Promise<{ page_slug: string }>;
};

export function generateStaticParams() {
  const pages = getPublishedShopifyPages(["shopify_hub", "shopify_app"]);
  return pages.map((page) => ({ page_slug: page.pageSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page_slug: pageSlug } = await params;
  const normalisedSlug = slugifyProgrammaticPart(pageSlug);
  if (normalisedSlug !== pageSlug) return {};
  const page = getPublishedShopifyPageBySlug(pageSlug);
  if (!page) return {};
  return {
    title: page.pageTitle,
    description: page.metaDescription,
    alternates: { canonical: `https://getforked.dev${page.fullUrl}` },
    openGraph: {
      title: page.pageTitle,
      description: page.metaDescription,
      url: `https://getforked.dev${page.fullUrl}`,
      type: "website",
      siteName: "GetForked",
    },
  };
}

export default async function ShopifyProgrammaticPage({ params }: Props) {
  const { page_slug: pageSlug } = await params;
  const normalisedSlug = slugifyProgrammaticPart(pageSlug);
  if (normalisedSlug !== pageSlug) permanentRedirect(`/shopify/${normalisedSlug}/`);
  const page = getPublishedShopifyPageBySlug(pageSlug);
  if (!page) notFound();
  const relatedPages = getRelatedPages(page);
  const schema = generatePageSchema(page, relatedPages);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ShopifyPage page={page} relatedPages={relatedPages} />
    </>
  );
}
