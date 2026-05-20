import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";
import { HeroSummary } from "@/components/programmatic/hero-summary";
import { MarketContextSection } from "@/components/programmatic/market-context-section";

type Props = {
  page: ProgrammaticPage;
  pages: ProgrammaticPage[];
};

export function ShopifySiloIndex({ page, pages }: Props) {
  return (
    <main className="min-h-screen bg-[#050708] text-[#F4F7F5]">
      <section className="container pb-16 pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.8fr)]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">Shopify app replacements</p>
            <h1 className="text-[clamp(46px,6vw,78px)] font-extrabold leading-[0.96] tracking-[-0.055em]">{page.h1Heading}</h1>
            <HeroSummary text={page.heroSummary} className="mt-8" />
            <Link href={buildBriefUrl(page)} className="mt-8 inline-flex rounded-[10px] bg-[#18E38A] px-5 py-3 font-bold text-[#02100A]">
              Submit Shopify Replacement Brief
            </Link>
          </div>
          <aside className="w-full max-w-[480px] rounded-[20px] border border-[rgba(24,227,138,0.16)] bg-gradient-to-b from-[#101719] to-[#0B1012] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] lg:ml-auto">
            <h2 className="mb-2 text-xl font-semibold">Scope your Shopify replacement</h2>
            <p className="mb-5 text-sm text-[#B8C2BE]">
              Tell us which apps you want to replace and how the workflow should run. We match approved builders by fit.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-[#7E8A86]">Project type</label>
                <div className="mt-1 rounded-lg border border-[#243034] bg-[#050708] px-3 py-3 text-sm">
                  {page.projectType || "Shopify app replacement workflow"}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-[#7E8A86]">Tools</label>
                <div className="mt-1 rounded-lg border border-[#243034] bg-[#050708] px-3 py-3 text-sm">
                  {page.briefPrefillTools || "shopify"}
                </div>
              </div>
              <Link
                href={buildBriefUrl(page)}
                className="block w-full rounded-[10px] bg-gradient-to-br from-[#18E38A] to-[#12C978] px-5 py-3 text-center font-bold text-[#02100A] shadow-[0_14px_36px_rgba(24,227,138,0.22)]"
              >
                Submit Your Brief
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <section className="border-y border-[#243034] bg-[#0B1012]/80">
        <div className="container grid gap-3 py-5 md:grid-cols-4">
          {["Approved builders only", "No open bid spam", "Scoped before build", "Own the workflow"].map((item) => (
            <div key={item} className="rounded-xl border border-[#243034] bg-[#0F1517] px-4 py-3 text-sm text-[#B8C2BE]">{item}</div>
          ))}
        </div>
      </section>
      <section className="container py-12">
        <MarketContextSection focus="shopify" />
      </section>
      <section className="container py-16">
        <h2 className="text-3xl font-bold tracking-tight">Shopify replacement pages</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((item) => (
            <Link key={item.id} href={item.fullUrl} className="rounded-2xl border border-[#243034] bg-[#0F1517] p-5">
              <span className="block font-semibold">{item.h1Heading}</span>
              <span className="mt-3 block text-sm leading-6 text-[#B8C2BE]">{item.metaDescription}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
