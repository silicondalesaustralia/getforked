import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierCostComparison({ page }: Props) {
  return (
    <section className="container py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">Cost context</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Zapier subscription vs scoped build</h2>
          <p className="mt-4 leading-7 text-[#B8C2BE]">{page.zapierCostContext}</p>
          <p className="mt-3 text-sm text-[#7E8A86]">
            Assumption: {page.estimatedTaskVolume || "task volume varies by workflow"}.
          </p>
        </div>
        <div className="rounded-[18px] border border-[#243034] bg-[#0F1517] p-6">
          <div
            className="zapier-table text-sm text-[#B8C2BE]"
            dangerouslySetInnerHTML={{ __html: page.costComparisonHtml || "" }}
          />
          <Link
            href={buildBriefUrl(page)}
            className="mt-6 inline-flex rounded-[10px] bg-[#18E38A] px-5 py-3 font-bold text-[#02100A]"
          >
            Compare your workflow cost
          </Link>
        </div>
      </div>
    </section>
  );
}
