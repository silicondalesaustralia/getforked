import Link from "next/link";
import type { ReactNode } from "react";
import type { StaticPageContent } from "@/lib/content/static-pages";

type Props = {
  page: StaticPageContent;
  children?: ReactNode;
};

export function EnrichedStaticPage({ page, children }: Props) {
  return (
    <div className="container py-14">
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">{page.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{page.h1}</h1>
        <p className="mt-4 text-lg text-zinc-300">{page.heroSummary}</p>
        <Link
          href={page.ctaHref ?? "/brief/new"}
          className="mt-8 inline-flex rounded-md bg-accent px-4 py-2 font-semibold text-zinc-950"
        >
          {page.ctaLabel ?? "Submit Your Brief"}
        </Link>
      </section>

      {page.points.length > 0 ? (
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {page.points.map((point) => (
            <article key={point} className="rounded-xl border border-zinc-800 bg-card p-5 text-zinc-300">
              {point}
            </article>
          ))}
        </section>
      ) : null}

      {page.sections.map((section) => (
        <section key={section.heading} className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-semibold">{section.heading}</h2>
          <div className="mt-4 space-y-4 text-zinc-300">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {children ? <div className="mt-12">{children}</div> : null}

      {page.faq.length > 0 ? (
        <section className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-semibold">Common questions</h2>
          <div className="mt-5 grid gap-4">
            {page.faq.map((item) => (
              <article key={item.question} className="rounded-xl border border-zinc-800 bg-card p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-zinc-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
