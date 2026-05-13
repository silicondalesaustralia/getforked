import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";
import { HeroSummary } from "@/components/programmatic/hero-summary";
import { MarketContextSection } from "@/components/programmatic/market-context-section";
import { ZapierBriefCard } from "@/components/zapier/zapier-brief-card";
import { ZapierTrustBar } from "@/components/zapier/zapier-trust-bar";

type Props = {
  page: ProgrammaticPage;
  pages: ProgrammaticPage[];
};

export function ZapierSiloIndex({ page, pages }: Props) {
  const hubs = pages.filter((item) => item.pageType === "zapier_hub").slice(0, 12);
  const pairs = pages.filter((item) => item.pageType === "zapier_pair").slice(0, 18);

  return (
    <main className="min-h-screen bg-[#050708] text-[#F4F7F5]">
      <section className="container pb-16 pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.8fr)]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">
              Zapier replacement builders
            </p>
            <h1 className="text-[clamp(46px,6vw,78px)] font-extrabold leading-[0.96] tracking-[-0.055em]">
              {page.h1Heading}
            </h1>
            <HeroSummary text={page.heroSummary} className="mt-8" />
            <Link
              href={buildBriefUrl(page)}
              className="mt-8 inline-flex rounded-[10px] bg-[#18E38A] px-5 py-3 font-bold text-[#02100A]"
            >
              Submit Your Zapier Replacement Brief
            </Link>
          </div>
          <ZapierBriefCard page={page} />
        </div>
      </section>
      <ZapierTrustBar />
      <section className="container py-12">
        <MarketContextSection focus="zapier" />
      </section>
      <PageGrid title="App hub pages" pages={hubs} />
      <PageGrid title="Integration-pair pages" pages={pairs} />
    </main>
  );
}

function PageGrid({ title, pages }: { title: string; pages: ProgrammaticPage[] }) {
  return (
    <section className="container py-16">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link key={page.id} href={page.fullUrl} className="rounded-2xl border border-[#243034] bg-[#0F1517] p-5">
            <span className="block font-semibold">{page.h1Heading}</span>
            <span className="mt-3 block text-sm leading-6 text-[#B8C2BE]">{page.metaDescription}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
