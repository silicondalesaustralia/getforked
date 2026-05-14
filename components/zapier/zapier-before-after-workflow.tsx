import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { splitZapierParagraph, useZapierLayoutTest } from "@/components/zapier/zapier-layout-test";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierBeforeAfterWorkflow({ page }: Props) {
  const layoutTest = useZapierLayoutTest(page);

  if (layoutTest) {
    return (
      <section id="what-this-replaces" className="container py-10 md:py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <WorkflowPanel
            accent="orange"
            label="Before"
            title="Zapier in the middle"
            paragraphs={splitZapierParagraph(page.workflowBeforeLabel, 1)}
          />
          <WorkflowPanel
            accent="green"
            label="After"
            title="A workflow you control"
            paragraphs={splitZapierParagraph(page.workflowAfterLabel, 1)}
          />
        </div>
      </section>
    );
  }

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

function WorkflowPanel({
  accent,
  label,
  title,
  paragraphs,
}: {
  accent: "orange" | "green";
  label: string;
  title: string;
  paragraphs: string[];
}) {
  const accentClass = accent === "orange" ? "border-l-[#F97316] text-[#F97316]" : "border-l-[#18E38A] text-[#18E38A]";
  return (
    <div className={`rounded-[18px] border border-[#243034] border-l-4 ${accentClass} bg-[#0F1517]/80 p-5 md:p-6`}>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <h2 className="mb-3 text-2xl font-bold text-[#F4F7F5]">{title}</h2>
      <div className="space-y-3 leading-7 text-[#B8C2BE]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
