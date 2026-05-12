import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiAutomationPage } from "@/components/ai-automation/ai-automation-page";
import { generatePageSchema } from "@/lib/schema";
import {
  getPublishedAiAutomationPageBySlug,
  getPublishedAiAutomationPages,
  getRelatedPages,
} from "@/lib/programmatic-pages";

type Props = {
  params: Promise<{ page_slug: string }>;
};

export function generateStaticParams() {
  return getPublishedAiAutomationPages().map((page) => ({ page_slug: page.pageSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page_slug: pageSlug } = await params;
  const page = getPublishedAiAutomationPageBySlug(pageSlug);
  if (!page) return {};

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

export default async function AiAutomationDetailPage({ params }: Props) {
  const { page_slug: pageSlug } = await params;
  const page = getPublishedAiAutomationPageBySlug(pageSlug);
  if (!page) notFound();

  const relatedPages = getRelatedPages(page);
  const schema = generatePageSchema(page, relatedPages);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AiAutomationPage page={page} relatedPages={relatedPages} />
    </>
  );
}
