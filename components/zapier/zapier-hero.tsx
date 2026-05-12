import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";
import { HeroSummary } from "@/components/programmatic/hero-summary";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierHero({ page }: Props) {
  return (
    <div>
      <nav className="mb-8 text-sm text-[#7E8A86]">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/zapier/">Zapier Replacements</Link>
        <span className="mx-2">/</span>
        <span>{page.h1Heading}</span>
      </nav>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(24,227,138,0.28)] bg-[rgba(24,227,138,0.12)] px-3 py-1.5 text-sm text-[#A7F3D0]">
        Zapier replacement builders
      </div>
      <h1 className="mb-6 text-[clamp(46px,6vw,78px)] font-extrabold leading-[0.96] tracking-[-0.055em]">
        {page.h1Heading}
      </h1>
      <HeroSummary text={page.heroSummary || page.introSummary} className="mb-8" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={buildBriefUrl(page)}
          className="rounded-[10px] bg-gradient-to-br from-[#18E38A] to-[#12C978] px-5 py-3 text-center font-bold text-[#02100A] shadow-[0_14px_36px_rgba(24,227,138,0.22)]"
        >
          {page.primaryCta || "Get Matched With an Approved Builder"}
        </Link>
        <a
          href="#what-this-replaces"
          className="rounded-[10px] border border-[#243034] bg-white/[0.02] px-5 py-3 text-center text-[#F4F7F5]"
        >
          {page.secondaryCta || "See What This Replaces"}
        </a>
      </div>
      <p className="text-sm text-[#7E8A86]">No bid spam. No freelancer roulette. Scoped before you commit.</p>
    </div>
  );
}
