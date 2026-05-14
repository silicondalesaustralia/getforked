import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";
import { splitZapierParagraph, useZapierLayoutTest } from "@/components/zapier/zapier-layout-test";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierProblemSection({ page }: Props) {
  const heading = page.nuancedContent?.problem_heading || "Why this Zapier workflow becomes fragile";
  const failureModes = page.nuancedContent?.failure_modes?.length
    ? page.nuancedContent.failure_modes
    : ["Brittle field mappings", "Hidden manual fixes", "Task volume pressure", "Delayed triggers or failed retries"];
  const layoutTest = useZapierLayoutTest(page);
  const problemParagraphs = splitZapierParagraph(page.problemSummary || page.buyerPainPoint);

  if (layoutTest) {
    return (
      <section className="container py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#F97316]">The problem</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
          </div>
          <div className="rounded-[18px] border border-[#243034] bg-[#0F1517]/80 p-5 md:p-6">
            <div className="max-w-3xl space-y-4 text-[17px] leading-8 text-[#B8C2BE]">
              {problemParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className="mt-6 grid gap-2.5 text-sm text-[#B8C2BE] sm:grid-cols-2">
              {failureModes.map((item) => (
                <li key={item} className="flex gap-3 rounded-xl border border-[#243034]/80 bg-[#050708]/70 p-3 leading-6">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F97316]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={buildBriefUrl(page)}
              className="mt-5 inline-flex rounded-[10px] bg-[#18E38A] px-5 py-3 font-bold text-[#02100A]"
            >
              Submit a replacement brief
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-16">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#F97316]">The problem</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
        </div>
        <div className="rounded-[18px] border border-[#243034] bg-[#0F1517] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <p className="text-lg leading-8 text-[#B8C2BE]">{page.problemSummary || page.buyerPainPoint}</p>
          <ul className="mt-6 grid gap-3 text-sm text-[#B8C2BE] md:grid-cols-2">
            {failureModes.map((item) => (
              <li key={item} className="rounded-xl border border-[#243034] bg-[#050708] p-3">
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={buildBriefUrl(page)}
            className="mt-6 inline-flex rounded-[10px] bg-[#18E38A] px-5 py-3 font-bold text-[#02100A]"
          >
            Submit a replacement brief
          </Link>
        </div>
      </div>
    </section>
  );
}
