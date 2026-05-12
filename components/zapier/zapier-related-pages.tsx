import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";

type Props = {
  page: ProgrammaticPage;
  relatedPages: ProgrammaticPage[];
};

export function ZapierRelatedPages({ page, relatedPages }: Props) {
  const links = relatedPages.filter((related) => related.fullUrl !== page.fullUrl).slice(0, 5);

  return (
    <section className="container py-16">
      <div className="rounded-[22px] border border-[#243034] bg-[#0F1517] p-6 md:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#7E8A86]">Related pages</p>
        <h2 className="text-3xl font-bold tracking-tight">Related Zapier replacements</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link href="/zapier/" className="rounded-xl border border-[#243034] bg-[#050708] p-4 text-[#18E38A]">
            Zapier replacement builders
          </Link>
          {links.map((related) => (
            <Link
              key={related.id}
              href={related.fullUrl}
              className="rounded-xl border border-[#243034] bg-[#050708] p-4 hover:border-[rgba(24,227,138,0.4)]"
            >
              <span className="block font-semibold">{related.h1Heading}</span>
              <span className="mt-2 block text-sm leading-6 text-[#B8C2BE]">{related.metaDescription}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
