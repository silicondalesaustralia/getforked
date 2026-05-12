import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierProblemSection({ page }: Props) {
  return (
    <section className="container py-16">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#F97316]">The problem</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Why this Zapier workflow becomes fragile
          </h2>
        </div>
        <div className="rounded-[18px] border border-[#243034] bg-[#0F1517] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <p className="text-lg leading-8 text-[#B8C2BE]">{page.problemSummary || page.buyerPainPoint}</p>
          <ul className="mt-6 grid gap-3 text-sm text-[#B8C2BE] md:grid-cols-2">
            {["Brittle field mappings", "Hidden manual fixes", "Task volume pressure", "Delayed triggers or failed retries"].map(
              (item) => (
                <li key={item} className="rounded-xl border border-[#243034] bg-[#050708] p-3">
                  {item}
                </li>
              ),
            )}
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
