import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About GetForked | Own Your Business Workflows",
  description:
    "GetForked was started by developers and business owners who build custom automations, dashboards and SaaS replacements for businesses.",
  alternates: {
    canonical: "https://getforked.dev/about/",
  },
  openGraph: {
    title: "About GetForked | Own Your Business Workflows",
    description:
      "GetForked was started by developers and business owners who build custom automations, dashboards and SaaS replacements for businesses.",
    type: "website",
    url: "https://getforked.dev/about/",
    siteName: "GetForked",
  },
  twitter: {
    title: "About GetForked | Own Your Business Workflows",
    description:
      "GetForked was started by developers and business owners who build custom automations, dashboards and SaaS replacements for businesses.",
    card: "summary_large_image",
  },
};

export default function AboutPage() {
  return (
    <main className="container py-12 md:py-16">
      <section className="max-w-4xl space-y-6 pt-8 md:pt-14">
        <p className="text-sm uppercase tracking-[0.22em] text-[#7e8a86]">About GetForked</p>
        <h1 className="text-[clamp(38px,6vw,62px)] font-extrabold leading-[0.98] tracking-[-0.045em]">
          We Built GetForked After Replacing Our Own SaaS Stack
        </h1>
        <p className="text-lg leading-8 text-zinc-300">
          GetForked was started by a group of developers and business owners who ran into the same problem many growing
          businesses face: too many subscriptions, too many disconnected tools, and too many workflows held together by
          spreadsheets, middleware, and manual admin.
        </p>
        <p className="text-lg leading-8 text-zinc-300">We were paying the SaaS tax.</p>
      </section>

      <section className="mt-12 max-w-4xl space-y-5 text-zinc-300">
        <p>
          Every new tool solved one problem but created another. CRMs became bloated. Automation tools became fragile.
          Dashboards lived in spreadsheets. Important workflows depended on third-party platforms we did not control.
          When something broke, it usually meant more manual cleanup, more subscriptions, or another workaround.
        </p>
        <p>So we started building our own replacements.</p>
      </section>

      <section className="mt-14 max-w-4xl space-y-5 text-zinc-300">
        <h2 className="text-3xl font-bold text-zinc-100">From rented software to owned workflows</h2>
        <p>
          The first goal was simple: stop paying for tools that did not fit the way the business actually worked. We
          built custom dashboards, direct API connectors, lightweight CRM systems, internal tools, and AI-assisted
          workflows.
        </p>
        <p>
          Some replaced expensive SaaS products entirely. Others connected the tools we still wanted to keep. The
          result was not always less software. It was better software ownership.
        </p>
      </section>

      <section className="mt-14 max-w-4xl space-y-5 text-zinc-300">
        <h2 className="text-3xl font-bold text-zinc-100">What we learned</h2>
        <p>Most businesses do not need a giant software project straight away. They need a clear practical process:</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Understand the workflow.</li>
          <li>Identify what is manual, fragile, expensive, or duplicated.</li>
          <li>Decide what should stay, connect, or be replaced.</li>
          <li>Build the smallest useful system first.</li>
          <li>Keep the workflow visible, documented, and owned by the business.</li>
          <li>Add automation or AI only where it genuinely saves time.</li>
        </ol>
        <p>That process became GetForked.</p>
      </section>

      <section className="mt-14 max-w-4xl space-y-5 text-zinc-300">
        <h2 className="text-3xl font-bold text-zinc-100">What GetForked does</h2>
        <p>GetForked matches businesses with approved builders who can scope and build practical workflow replacements.</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Zapier replacement workflows</li>
          <li>AI workflow automation</li>
          <li>Google Sheets dashboards</li>
          <li>Custom CRM systems</li>
          <li>Internal business tools</li>
          <li>Direct API connectors</li>
          <li>Reporting dashboards</li>
          <li>Lead management workflows</li>
          <li>Customer follow-up automation</li>
          <li>Invoice and finance workflows</li>
        </ul>
        <p>The aim is to reduce software waste and help teams own the systems they depend on.</p>
      </section>

      <section className="mt-14 max-w-4xl space-y-5 text-zinc-300">
        <h2 className="text-3xl font-bold text-zinc-100">Why we are different</h2>
        <p>
          Most freelance marketplaces force buyers through proposal spam and guesswork. GetForked focuses on structured
          briefs, approved builders, clear scopes, and practical business outcomes.
        </p>
        <p>No bid spam. No freelancer roulette. Scoped before you commit.</p>
      </section>

      <section className="mt-14 max-w-4xl space-y-5 text-zinc-300">
        <h2 className="text-3xl font-bold text-zinc-100">Why now?</h2>
        <p>
          SaaS costs keep rising while teams are buried in admin. AI has changed what small teams can build quickly.
          Instead of buying another subscription, business owners can now own focused systems that fit their workflows.
        </p>
      </section>

      <section className="mt-14 max-w-4xl space-y-5 text-zinc-300">
        <h2 className="text-3xl font-bold text-zinc-100">Our belief</h2>
        <p>
          The future is not more disconnected SaaS. The future is businesses owning more of the workflows that make
          them money, save them time, and keep customers moving.
        </p>
        <p>GetForked exists to make that practical.</p>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-10">
        <h2 className="text-3xl font-bold text-zinc-100">Ready to replace a workflow?</h2>
        <p className="mt-3 max-w-3xl text-zinc-300">
          Tell us what you want to automate, connect, or replace. We will help scope the project and match it with an
          approved builder.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/brief/new"
            className="inline-flex h-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-500 px-[22px] font-bold text-[#02100a]"
          >
            Submit Your Brief
          </Link>
        </div>
      </section>
    </main>
  );
}
