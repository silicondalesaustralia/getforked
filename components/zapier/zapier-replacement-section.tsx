import type { ProgrammaticPage } from "@/lib/programmatic-pages";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierReplacementSection({ page }: Props) {
  const options = ["Direct API connector", "Webhook handler", "Scheduled sync", "Internal dashboard"];

  return (
    <section className="container py-16">
      <div className="rounded-[22px] border border-[rgba(24,227,138,0.18)] bg-[#0F1517] p-6 md:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">The replacement</p>
        <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
          What a custom Zapier replacement looks like
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#B8C2BE]">{page.replacementSummary}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {options.map((option) => (
            <div key={option} className="rounded-2xl border border-[#243034] bg-[#050708] p-4">
              <h3 className="font-semibold text-[#F4F7F5]">{option}</h3>
              <p className="mt-2 text-sm leading-6 text-[#B8C2BE]">
                Scoped to the workflow, tools, retry needs, and visibility your team actually needs.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
