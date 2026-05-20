import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";
import { HeroSummary } from "@/components/programmatic/hero-summary";
import { MarketContextSection } from "@/components/programmatic/market-context-section";

type Props = {
  page: ProgrammaticPage;
  relatedPages: ProgrammaticPage[];
};

export function ShopifyPage({ page, relatedPages }: Props) {
  return (
    <div className="min-h-screen bg-[#050708] text-[#F4F7F5]">
      <section className="container pb-12 pt-10 md:pt-14">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.8fr)]">
          <div>
            <nav className="mb-8 text-sm text-[#7E8A86]">
              <Link href="/">Home</Link> <span className="mx-2">/</span>
              <Link href="/shopify/">Shopify</Link> <span className="mx-2">/</span>
              <span>{page.h1Heading}</span>
            </nav>
            <p className="mb-4 inline-flex rounded-full border border-[rgba(24,227,138,0.28)] bg-[rgba(24,227,138,0.12)] px-3 py-1.5 text-sm text-[#A7F3D0]">
              Shopify app replacement
            </p>
            <h1 className="text-[clamp(46px,6vw,78px)] font-extrabold leading-[0.96] tracking-[-0.055em]">{page.h1Heading}</h1>
            <HeroSummary text={page.heroSummary} className="mt-8" />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={buildBriefUrl(page)} className="rounded-[10px] bg-[#18E38A] px-5 py-3 text-center font-bold text-[#02100A]">
                {page.primaryCta}
              </Link>
              <a href="#what-this-build-replaces" className="rounded-[10px] border border-[#243034] px-5 py-3 text-center">
                {page.secondaryCta}
              </a>
            </div>
          </div>
          <BriefCard page={page} />
        </div>
      </section>
      <TrustBar />
      <section className="container py-12">
        <MarketContextSection focus="shopify" />
      </section>
      <SplitSection eyebrow="The problem" title="Where app-only Shopify workflows break down" body={page.problemSummary} />
      <SplitSection eyebrow="The replacement" title="What an owned Shopify workflow controls" body={page.replacementSummary} />
      <Workflow page={page} />
      <Cost page={page} />
      <BuilderMatch page={page} />
      <SeoBody page={page} />
      <PageGrid title="Related Shopify pages" pages={relatedPages} />
      <FinalCta page={page} />
    </div>
  );
}

function BriefCard({ page }: { page: ProgrammaticPage }) {
  return (
    <aside className="w-full max-w-[480px] rounded-[20px] border border-[rgba(24,227,138,0.16)] bg-gradient-to-b from-[#101719] to-[#0B1012] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] lg:sticky lg:top-24 lg:ml-auto">
      <h2 className="text-xl font-semibold">Scope your Shopify replacement</h2>
      <p className="mt-2 text-sm leading-6 text-[#B8C2BE]">Share current apps, store rules, and operational constraints. We match approved builders to the scoped workflow.</p>
      <div className="mt-5 rounded-lg border border-[#243034] bg-[#050708] p-3 text-sm">{page.projectType}</div>
      <div className="mt-3 rounded-lg border border-[#243034] bg-[#050708] p-3 text-sm">{page.briefPrefillTools}</div>
      <Link href={buildBriefUrl(page)} className="mt-5 block rounded-[10px] bg-[#18E38A] px-5 py-3 text-center font-bold text-[#02100A]">
        Submit Shopify Brief
      </Link>
    </aside>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-[#243034] bg-[#0B1012]/80">
      <div className="container grid gap-3 py-5 md:grid-cols-4">
        {["Approved builders only", "No open bid spam", "Scoped before build", "Own the workflow"].map((item) => (
          <div key={item} className="rounded-xl border border-[#243034] bg-[#0F1517] px-4 py-3 text-sm text-[#B8C2BE]">{item}</div>
        ))}
      </div>
    </section>
  );
}

function SplitSection({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="container py-10 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">{eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        </div>
        <div className="rounded-[18px] border border-[#243034] bg-[#0F1517]/80 p-5 md:p-6">
          <p className="max-w-3xl text-[17px] leading-8 text-[#B8C2BE]">{body}</p>
        </div>
      </div>
    </section>
  );
}

function Workflow({ page }: { page: ProgrammaticPage }) {
  return (
    <section id="what-this-build-replaces" className="container grid gap-4 py-10 md:grid-cols-2 md:py-12">
      <Card label="Before" title="App stack with manual exception fixes" body={page.workflowBeforeLabel} accent="#F97316" />
      <Card label="After" title="Owned Shopify workflow" body={page.workflowAfterLabel} accent="#18E38A" />
    </section>
  );
}

function Card({ label, title, body, accent }: { label: string; title: string; body: string; accent: string }) {
  return <div className="rounded-[18px] border border-[#243034] border-l-4 bg-[#0F1517]/80 p-5 md:p-6" style={{ borderLeftColor: accent }}><p className="mb-2 text-sm font-semibold" style={{ color: accent }}>{label}</p><h2 className="mb-3 text-2xl font-bold">{title}</h2><p className="leading-7 text-[#B8C2BE]">{body}</p></div>;
}

function Cost({ page }: { page: ProgrammaticPage }) {
  return <section className="container py-10 md:py-12"><h2 className="text-3xl font-bold">Cost and scoping context</h2><p className="mt-4 max-w-3xl text-[#B8C2BE]">{page.zapierCostContext}</p><div className="zapier-table mt-6 rounded-[18px] border border-[#243034] bg-[#0F1517]/80 p-5 md:p-6" dangerouslySetInnerHTML={{ __html: page.costComparisonHtml }} /></section>;
}

function BuilderMatch({ page }: { page: ProgrammaticPage }) {
  return <section className="container py-10 md:py-12"><div className="border-y border-[rgba(24,227,138,0.18)] py-10"><div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start"><h2 className="text-3xl font-bold tracking-tight md:text-4xl">How GetForked matches the right builder</h2><p className="text-[17px] leading-8 text-[#B8C2BE]">{page.builderMatchFactors}</p></div></div></section>;
}

function SeoBody({ page }: { page: ProgrammaticPage }) {
  return <section className="container py-10 md:py-12"><div className="zapier-prose max-w-3xl text-[#B8C2BE]" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} /></section>;
}

function PageGrid({ title, pages }: { title: string; pages: ProgrammaticPage[] }) {
  if (pages.length === 0) return null;
  return <section className="container py-10 md:py-12"><h2 className="text-3xl font-bold">{title}</h2><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{pages.map((item) => <Link key={item.id} href={item.fullUrl} className="rounded-2xl border border-[#243034] bg-[#0F1517]/75 p-5"><span className="block font-semibold">{item.h1Heading}</span><span className="mt-3 block text-sm leading-6 text-[#B8C2BE]">{item.metaDescription}</span></Link>)}</div></section>;
}

function FinalCta({ page }: { page: ProgrammaticPage }) {
  return <section className="container pb-20 pt-12"><div className="rounded-[26px] border border-[rgba(24,227,138,0.24)] bg-gradient-to-br from-[#101719] to-[#050708] p-8 text-center md:p-12"><h2 className="text-3xl font-bold md:text-5xl">Submit your Shopify replacement brief</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#B8C2BE]">Scope the workflow first, then get matched with an approved builder to replace the app dependency.</p><Link href={buildBriefUrl(page)} className="mt-8 inline-flex rounded-[10px] bg-[#18E38A] px-6 py-3 font-bold text-[#02100A]">{page.primaryCta}</Link></div></section>;
}
