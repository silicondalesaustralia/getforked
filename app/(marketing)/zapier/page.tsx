import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ZapierSiloIndex } from "@/components/zapier/zapier-silo-index";
import { generatePageSchema } from "@/lib/schema";
import { getPublishedZapierPages, getZapierSiloIndexPage } from "@/lib/programmatic-pages";

export const metadata: Metadata = {
  title: "Zapier Replacement Builders | GetForked",
  description:
    "Submit your Zapier replacement brief and get matched with an approved builder for direct connectors, dashboards, and owned workflow automation.",
  alternates: {
    canonical: "https://getforked.dev/zapier/",
  },
  openGraph: {
    title: "Zapier Replacement Builders | GetForked",
    description:
      "Submit your Zapier replacement brief and get matched with an approved builder for direct connectors, dashboards, and owned workflow automation.",
    url: "https://getforked.dev/zapier/",
    type: "website",
    siteName: "GetForked",
  },
};

export default async function ZapierIndexPage() {
  const [page, pages] = await Promise.all([getZapierSiloIndexPage(), getPublishedZapierPages()]);

  if (!page) {
    notFound();
  }

  const schema = generatePageSchema(page, pages);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ZapierSiloIndex page={page} pages={pages} />
    </>
  );
}
