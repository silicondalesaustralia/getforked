import type { ProgrammaticPage } from "@/lib/programmatic-pages";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierBeforeAfterWorkflow({ page }: Props) {
  return (
    <section id="what-this-replaces" className="container py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[18px] border border-[#243034] border-l-4 border-l-[#F97316] bg-[#0F1517] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <p className="mb-2 text-sm font-semibold text-[#F97316]">Before</p>
          <h2 className="mb-3 text-2xl font-bold">Zapier in the middle</h2>
          <p className="leading-7 text-[#B8C2BE]">{page.workflowBeforeLabel}</p>
        </div>
        <div className="rounded-[18px] border border-[#243034] border-l-4 border-l-[#18E38A] bg-[#0F1517] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <p className="mb-2 text-sm font-semibold text-[#18E38A]">After</p>
          <h2 className="mb-3 text-2xl font-bold">A workflow you control</h2>
          <p className="leading-7 text-[#B8C2BE]">{page.workflowAfterLabel}</p>
        </div>
      </div>
    </section>
  );
}
