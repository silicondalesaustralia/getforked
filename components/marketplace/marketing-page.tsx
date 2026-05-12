import Link from "next/link";

type MarketingPageProps = {
  title: string;
  eyebrow?: string;
  description: string;
  points?: string[];
  ctaHref?: string;
  ctaLabel?: string;
};

export function MarketingPage({
  title,
  eyebrow,
  description,
  points = [],
  ctaHref = "/brief/new",
  ctaLabel = "Submit Your Brief",
}: MarketingPageProps) {
  return (
    <div className="container py-14">
      <section className="max-w-3xl">
        {eyebrow ? <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">{eyebrow}</p> : null}
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-zinc-300">{description}</p>
        <Link
          href={ctaHref}
          className="mt-8 inline-flex rounded-md bg-accent px-4 py-2 font-semibold text-zinc-950"
        >
          {ctaLabel}
        </Link>
      </section>
      {points.length > 0 ? (
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {points.map((point) => (
            <article key={point} className="rounded-xl border border-zinc-800 bg-card p-5 text-zinc-300">
              {point}
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
