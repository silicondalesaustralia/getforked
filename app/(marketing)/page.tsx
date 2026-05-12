import Link from "next/link";
import { LeadForm } from "@/components/forms/lead-form";
import { SaasCalculator } from "@/components/sections/saas-calculator";

const steps = [
  { title: "Brief", body: "Tell us what you want to replace, connect or automate." },
  { title: "Review", body: "GetForked scopes the work and identifies required tools, data and skills." },
  { title: "Match", body: "We match the project with an approved builder based on fit, not bid spam." },
  { title: "Build", body: "Your builder delivers with milestone visibility and clear status updates." },
  { title: "Launch", body: "You receive a working tool, handover notes and support options." },
];

export default function HomePage() {
  return (
    <div className="container py-12 md:py-16">
      <section className="grid gap-9 pt-12 md:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.8fr)] lg:gap-14 lg:pt-18">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-200">
            Stop paying software rent
          </p>
          <h1 className="max-w-[720px] text-[clamp(44px,12vw,58px)] font-extrabold leading-[0.96] tracking-[-0.055em] md:text-[clamp(52px,6vw,82px)]">
            Stop renting software. Start owning it.
          </h1>
          <p className="max-w-[620px] text-[18px] leading-7 text-muted">
            We match your business with approved AI automation builders who replace SaaS subscriptions, messy
            spreadsheets and manual workflows with custom tools built around your business.
          </p>
          <div className="hero-actions flex flex-wrap gap-3 max-[520px]:grid max-[520px]:grid-cols-1">
            <Link
              href="/brief/new"
              className="inline-flex h-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-500 px-[22px] font-bold text-[#02100a] shadow-[0_14px_36px_rgba(24,227,138,0.22)] transition hover:-translate-y-px hover:shadow-[0_18px_44px_rgba(24,227,138,0.28)] max-[520px]:w-full"
            >
              Submit Your Brief
            </Link>
            <Link
              href="/for-builders"
              className="inline-flex h-12 items-center justify-center rounded-[10px] border border-[#314044] bg-white/5 px-[22px] font-semibold text-[#dde5e1] transition hover:border-emerald-400/45 hover:bg-emerald-400/10 hover:text-[#f4f7f5] max-[520px]:w-full"
            >
              Apply as a Builder
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Approved builders only", "Structured project briefs", "Manual matching available", "Support-ready builds"].map((chip) => (
              <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-2.5 py-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {chip}
              </span>
            ))}
          </div>
        </div>
        <LeadForm source="homepage_brief_first" />
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-[18px] border border-border border-l-[3px] border-l-orange-500 bg-card p-7 shadow-[0_14px_42px_rgba(0,0,0,0.18)]">
          <p className="text-sm uppercase tracking-[0.22em] text-[#7e8a86]">The problem</p>
          <h2 className="text-2xl font-semibold">The SaaS tax is real</h2>
          <p className="mt-2 text-zinc-300">
            Businesses run on 10-30 subscriptions, fragile integrations, manual data entry and spreadsheets nobody
            fully trusts.
          </p>
        </div>
        <div className="rounded-[18px] border border-border border-l-[3px] border-l-emerald-400 bg-card p-7 shadow-[0_14px_42px_rgba(0,0,0,0.18)]">
          <p className="text-sm uppercase tracking-[0.22em] text-[#7e8a86]">The replacement</p>
          <h2 className="text-2xl font-semibold">The replacement</h2>
          <p className="mt-2 text-zinc-300">
            Get matched with approved builders who use AI-assisted delivery to build custom tools, dashboards and
            workflows your business can own.
          </p>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-[#7e8a86]">Who are we?</p>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">We started by replacing our own software stack.</h2>
        <div className="mt-6 max-w-4xl space-y-5 text-zinc-300">
          <p>
            GetForked was started by a group of developers and business owners who were tired of renting software
            forever.
          </p>
          <p>
            Like many businesses, we were paying for CRMs, automation tools, spreadsheets, dashboards, connectors, and
            SaaS subscriptions that only solved part of the problem. The more the business grew, the more the stack
            became expensive, fragile, and difficult to manage.
          </p>
          <p>
            So we started building our own replacements. We swapped fragile middleware for direct connectors, turned
            messy spreadsheets into dashboards, and used AI where it saved time while keeping humans in control where
            judgment mattered.
          </p>
          <p>
            Now GetForked helps other business owners reduce the SaaS tax, automate repetitive work, save time, and own
            the systems their business depends on.
          </p>
          <p className="font-semibold text-zinc-100">Stop renting workflows. Start owning them.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/how-it-works"
            className="inline-flex h-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-500 px-[22px] font-bold text-[#02100a]"
          >
            See How It Works
          </Link>
          <Link
            href="/brief/new"
            className="inline-flex h-12 items-center justify-center rounded-[10px] border border-[#314044] bg-white/5 px-[22px] font-semibold text-[#dde5e1] transition hover:border-emerald-400/45 hover:bg-emerald-400/10"
          >
            Submit Your Brief
          </Link>
        </div>
      </section>

      <section className="mt-22">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.22em] text-[#7e8a86]">How it works</p>
          <h2 className="mt-2 text-3xl font-bold">Five managed steps from brief to launch</h2>
        </div>
        <div className="mt-7 grid gap-[18px] md:grid-cols-3 xl:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="min-h-[190px] rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-emerald-400/35 hover:bg-[#111a1d]"
            >
              <p className="text-sm font-bold text-accent">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-zinc-300">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SaasCalculator />
      </section>
    </div>
  );
}
