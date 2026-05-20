import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopifySiloIndex } from "@/components/shopify/shopify-silo-index";
import { generatePageSchema } from "@/lib/schema";
import { getPublishedShopifyPages, getShopifySiloIndexPage } from "@/lib/programmatic-pages";

export const metadata: Metadata = {
  title: "Shopify App Replacement Pages | GetForked",
  description:
    "Explore Shopify app replacement pages for subscriptions, inventory, shipping, returns, loyalty, and integrations you can own.",
  alternates: {
    canonical: "https://getforked.dev/shopify/",
  },
  openGraph: {
    title: "Shopify App Replacement Pages | GetForked",
    description:
      "Explore Shopify app replacement pages for subscriptions, inventory, shipping, returns, loyalty, and integrations you can own.",
    url: "https://getforked.dev/shopify/",
    type: "website",
    siteName: "GetForked",
  },
};

export default function ShopifyIndexPage() {
  const page = getShopifySiloIndexPage();
  const pages = getPublishedShopifyPages();

  if (!page) {
    notFound();
  }

  const schema = generatePageSchema(page, pages);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ShopifySiloIndex page={page} pages={pages} />
    </>
  );
}
