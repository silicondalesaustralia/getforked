import Link from "next/link";

const steps = ["Brief", "Review", "Match", "Build", "Launch"];
const replacements = [
  "HubSpot + Pipedrive + Sheets -> Custom CRM",
  "Zapier + Make + webhooks -> Workflow Automations",
  "Monday + Asana + Slack bots -> Internal Operations Tools",
  "Sheets + Airtable + manual exports -> Reporting Dashboards",
  "Zendesk + Intercom + help docs -> Customer Portals",
  "Disconnected APIs + Zapier glue -> Connectors & Data Pipelines",
];
const benefits = [
  "No bid spam",
  "Approved builders only",
  "Scoped before matched",
  "Matched by fit",
  "One fee, not forever",
  "AI-native builders",
];

export default function HomePage() {
  return (
    <div className="container py-18">
      <section className="rounded-3xl border border-border bg-card/70 p-8 shadow-[0_30px_80px_-50px_rgba(124,156,255,0.6)] md:p-12">
        <p className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
          Average SMB spends $2,847/mo on SaaS
        </p>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-zinc-400">Managed software marketplace</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-tight md:text-6xl">
          Stop renting software. Start owning it.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-300">
          We match your business with developers who replace your SaaS stack with custom tools - built with AI,
          owned by you, at a fraction of the ongoing cost.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/brief/new" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
            Submit Your Brief
          </Link>
          <Link href="/for-builders" className="rounded-full border border-border bg-surface/40 px-5 py-2.5">
            Apply as a Builder
          </Link>
        </div>
      </section>
      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-red-300">THE SAAS TAX</p>
          <h2 className="mt-2 text-2xl font-semibold">You are paying rent on tools you could own.</h2>
          <p className="mt-2 text-zinc-300">
            Most businesses run on 10-30 subscriptions with bloated features, fragile integrations, and data trapped
            across dashboards.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">THE REPLACEMENT</p>
          <h2 className="mt-2 text-2xl font-semibold">Custom tools built for how you actually work.</h2>
          <p className="mt-2 text-zinc-300">
            Get matched with approved builders who use AI to ship tailored systems faster than traditional custom
            development.
          </p>
        </div>
      </section>
      <section className="mt-16">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">What we replace</p>
        <h2 className="mt-2 text-3xl font-bold">SaaS subscriptions to custom tools you own</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {replacements.map((item) => (
            <div key={item} className="rounded-xl border border-border bg-card p-4 text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="mt-16">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">How it works</p>
          <h2 className="mt-2 text-3xl font-bold">Five managed steps from brief to launch</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step} className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-accent">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-xl font-semibold">{step}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-16">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Why managed matching</p>
        <h2 className="mt-2 text-3xl font-bold">Not a marketplace. A matching service.</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {benefits.map((item) => (
            <div key={item} className="rounded-lg border border-border bg-card px-4 py-4 text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">FOR BUSINESSES</p>
          <h3 className="mt-2 text-2xl font-semibold">Replace your SaaS stack</h3>
          <Link href="/brief/new" className="mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
            Submit Your Brief
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">FOR BUILDERS</p>
          <h3 className="mt-2 text-2xl font-semibold">Build with AI. Get matched to real projects.</h3>
          <Link href="/builder/apply" className="mt-5 inline-flex rounded-full border border-border bg-surface/40 px-5 py-2.5">
            Apply as a Builder
          </Link>
        </div>
      </section>
    </div>
  );
}
