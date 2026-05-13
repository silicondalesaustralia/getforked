import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierSEOContent({ page }: Props) {
  return (
    <section className="container py-16">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,760px)_280px]">
        <div>
          <div className="zapier-prose max-w-none text-[#B8C2BE]" dangerouslySetInnerHTML={{ __html: page.bodyHtml || "" }} />
          {page.nuancedContent?.faq?.length ? (
            <div className="mt-10 rounded-2xl border border-[#243034] bg-[#0F1517] p-6">
              <h3 className="text-2xl font-bold">Frequently asked questions</h3>
              <div className="mt-4 space-y-4">
                {page.nuancedContent.faq.slice(0, 5).map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#243034] bg-[#050708] p-4">
                    <p className="font-semibold text-[#F4F7F5]">{item.question}</p>
                    <p className="mt-2 text-sm leading-6 text-[#B8C2BE]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <aside className="hidden rounded-2xl border border-[#243034] bg-[#0F1517] p-5 lg:sticky lg:top-24 lg:block">
          <p className="mb-3 text-sm font-semibold">Ready to replace this workflow?</p>
          <Link
            href={buildBriefUrl(page)}
            className="block rounded-[10px] bg-[#18E38A] px-4 py-3 text-center text-sm font-bold text-[#02100A]"
          >
            Submit Brief
          </Link>
          <p className="mt-4 text-xs leading-5 text-[#7E8A86]">{page.lastVerifiedNote}</p>
        </aside>
      </div>
    </section>
  );
}
