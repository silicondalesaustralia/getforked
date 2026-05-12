import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierFinalCTA({ page }: Props) {
  return (
    <section className="container pb-20 pt-12">
      <div className="rounded-[26px] border border-[rgba(24,227,138,0.24)] bg-gradient-to-br from-[#101719] to-[#050708] p-8 text-center md:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">Ready when you are</p>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Submit your Zapier replacement brief</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#B8C2BE]">
          We scope before you commit, then match the brief with an approved builder who understands the workflow.
        </p>
        <Link
          href={buildBriefUrl(page)}
          className="mt-8 inline-flex rounded-[10px] bg-gradient-to-br from-[#18E38A] to-[#12C978] px-6 py-3 font-bold text-[#02100A]"
        >
          {page.primaryCta || "Submit Your Brief"}
        </Link>
        <p className="mt-4 text-sm text-[#7E8A86]">No bid spam. No freelancer roulette. Scoped before build.</p>
      </div>
    </section>
  );
}
