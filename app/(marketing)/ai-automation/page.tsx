import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiAutomationPage } from "@/components/ai-automation/ai-automation-page";
import { generatePageSchema } from "@/lib/schema";
import { getAiAutomationSiloIndexPage, getPublishedAiAutomationPages } from "@/lib/programmatic-pages";

export const metadata: Metadata = {
  title: "AI Automation Builders | GetForked",
  description:
    "Get matched with an approved AI automation builder for custom workflows, dashboards, integrations, and AI systems your team can own.",
  alternates: {
    canonical: "https://getforked.dev/ai-automation/",
  },
  openGraph: {
    title: "AI Automation Builders | GetForked",
    description:
      "Get matched with an approved AI automation builder for custom workflows, dashboards, integrations, and AI systems your team can own.",
    url: "https://getforked.dev/ai-automation/",
    type: "website",
    siteName: "GetForked",
  },
};

export default function AiAutomationIndexPage() {
  const page = getAiAutomationSiloIndexPage();
  const pages = getPublishedAiAutomationPages();

  if (!page) {
    notFound();
  }

  const schema = generatePageSchema(page, pages);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AiAutomationPage page={page} relatedPages={pages.slice(0, 6)} allPages={pages} />
    </>
  );
}
