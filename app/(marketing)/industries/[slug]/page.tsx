import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/forms/lead-form";
import { SaasCalculator } from "@/components/sections/saas-calculator";
import { getIndustryBySlug, getPublishedIndustries } from "@/lib/content/industries";

type IndustryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPublishedIndustries().map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry || industry.status !== "published") {
    return {};
  }

  return {
    title: industry.pageTitle ?? `${industry.name} Software Replacement | getforked.dev`,
    description: industry.metaDescription,
    openGraph: {
      title: industry.ogImageText ?? industry.pageTitle ?? industry.name,
      description: industry.metaDescription,
    },
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);

  if (!industry || industry.status !== "published") {
    notFound();
  }

  return (
    <div className="container py-14">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="grid gap-12">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Industry landing page</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              {industry.heroHeadline ?? `${industry.name}: Fork Your SaaS Stack`}
            </h1>
            <p className="mt-4 text-xl font-semibold text-accent">
              {industry.heroSubtitle ?? `Typical SaaS spend: $${industry.monthlyCost}/month`}
            </p>
            <p className="mt-4 text-zinc-300">{industry.supportingText ?? industry.metaDescription}</p>
          </div>
          <section>
            <h2 className="text-2xl font-semibold">Pain Points We Replace</h2>
            <div className="mt-5 grid gap-4">
              {industry.painPoints.map((pain) => (
                <article key={pain.title} className="rounded-xl border border-zinc-800 p-5">
                  <h3 className="font-semibold">{pain.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{pain.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
        <aside className="grid gap-6">
          <LeadForm
            source={`industry_${industry.slug}`}
            industrySlug={industry.slug}
            leadForm={industry.leadForm}
          />
          <SaasCalculator
            initialTools={industry.calculatorDefaults?.tools}
            initialAverageMonthlyCost={industry.calculatorDefaults?.averageMonthlyCost}
            multiplier={industry.calculatorDefaults?.multiplier}
            breakevenMessage={industry.calculatorDefaults?.breakevenMessage}
          />
          <section className="rounded-xl border border-zinc-800 p-5">
            <h2 className="text-2xl font-semibold">Video</h2>
            <p className="mt-2 text-zinc-300">
              {industry.video?.embedUrl ? "Video embed ready." : "Video coming soon."}
            </p>
            {industry.video?.hookScript ? (
              <blockquote className="mt-4 border-l-2 border-accent pl-4 text-sm text-zinc-400">
                {industry.video.hookScript}
              </blockquote>
            ) : null}
          </section>
        </aside>
      </section>
      {industry.replacementRows ? (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">What We Replace → What We Build</h2>
          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-900 text-zinc-200">
                <tr>
                  <th className="p-4">You are currently paying for</th>
                  <th className="p-4">What we build you</th>
                </tr>
              </thead>
              <tbody>
                {industry.replacementRows.map((row) => (
                  <tr key={row.current} className="border-t border-zinc-800">
                    <td className="p-4 text-zinc-300">{row.current}</td>
                    <td className="p-4 text-zinc-100">{row.replacement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {industry.regionalStackExamples ? (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Stacks We Replace Across Markets</h2>
          <p className="mt-2 max-w-3xl text-zinc-300">
            The names change by country. The problem is the same: rented tools, locked data, and monthly
            software tax.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {industry.regionalStackExamples.map((region) => (
              <article key={region.country} className="rounded-xl border border-zinc-800 p-5">
                <h3 className="font-semibold text-accent">{region.country}</h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  {region.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
