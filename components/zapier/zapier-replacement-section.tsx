import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { splitZapierParagraph, useZapierLayoutTest } from "@/components/zapier/zapier-layout-test";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierReplacementSection({ page }: Props) {
  const heading = page.nuancedContent?.replacement_heading || "What a custom Zapier replacement looks like";
  const options = page.nuancedContent?.replacement_cards?.length
    ? page.nuancedContent.replacement_cards
    : [
        { title: "Direct API connector", description: "Scoped to the workflow, tools, retry needs, and visibility your team actually needs." },
        { title: "Webhook handler", description: "Scoped to the workflow, tools, retry needs, and visibility your team actually needs." },
        { title: "Scheduled sync", description: "Scoped to the workflow, tools, retry needs, and visibility your team actually needs." },
        { title: "Internal dashboard", description: "Scoped to the workflow, tools, retry needs, and visibility your team actually needs." },
      ];
  const layoutTest = useZapierLayoutTest(page);
  const summaryParagraphs = splitZapierParagraph(page.replacementSummary);

  if (layoutTest) {
    return (
      <section className="container py-10 md:py-12">
        <div className="border-y border-[rgba(24,227,138,0.18)] py-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">The replacement</p>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
            </div>
            <div className="space-y-4 text-[17px] leading-8 text-[#B8C2BE]">
              {summaryParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {options.map((option) => (
              <div key={option.title} className="rounded-2xl border border-[#243034] bg-[#050708]/75 p-5">
                <h3 className="font-semibold text-[#F4F7F5]">{option.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#B8C2BE]">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-16">
      <div className="rounded-[22px] border border-[rgba(24,227,138,0.18)] bg-[#0F1517] p-6 md:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">The replacement</p>
        <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#B8C2BE]">{page.replacementSummary}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {options.map((option) => (
            <div key={option.title} className="rounded-2xl border border-[#243034] bg-[#050708] p-4">
              <h3 className="font-semibold text-[#F4F7F5]">{option.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#B8C2BE]">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
