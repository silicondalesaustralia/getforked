import type { ProgrammaticPage } from "@/lib/programmatic-pages";

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
