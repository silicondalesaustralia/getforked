type Focus = "homepage" | "ai" | "zapier" | "shopify";

type Props = {
  focus: Focus;
  className?: string;
};

const citations = [
  { label: "SaaS disruption and market correction (Intellectia)", href: "https://www.intellectia.ai/" },
  { label: "SaaS valuation compression (SaaS Capital)", href: "https://www.saas-capital.com/" },
  { label: "Build vs buy split in AI use cases (Menlo Ventures)", href: "https://menlovc.com/" },
  { label: "License utilization and waste trend (Zylo)", href: "https://zylo.com/" },
  { label: "SaaS app count and agentic AI adoption (BetterCloud)", href: "https://www.bettercloud.com/" },
  { label: "AI agent pricing and replacement outlook (Deloitte Insights)", href: "https://www2.deloitte.com/us/en/insights.html" },
  { label: "AI model cost compression context (Monetizely)", href: "https://www.getmonetizely.com/" },
];

export function MarketContextSection({ focus, className = "" }: Props) {
  const heading =
    focus === "homepage"
      ? "AI is pressuring SaaS, but most teams still buy before they build."
      : "The build vs buy shift is real, but practical teams still prioritize scoped replacement.";

  const close =
    focus === "zapier"
      ? "For Zapier-heavy stacks, this usually means replacing brittle point workflows first, not rebuilding everything."
      : focus === "shopify"
        ? "For Shopify stacks, this usually means replacing high-friction app dependencies first, then expanding owned store workflows."
      : focus === "ai"
        ? "For AI automation, this usually means scoping one workflow at a time where ownership and review controls matter."
        : "The practical strategy is replacing fragile, high-friction workflows first, then expanding what you own.";

  return (
    <section className={`rounded-2xl border border-border bg-card p-8 md:p-10 ${className}`}>
      <p className="text-sm uppercase tracking-[0.22em] text-[#7e8a86]">2026 market context</p>
      <h2 className="mt-2 text-3xl font-bold md:text-4xl">{heading}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-[#0F1517] p-5 text-zinc-300">
          In 2025, 76% of AI use cases were purchased versus 24% built internally, even as in-house build economics
          improved.
        </div>
        <div className="rounded-xl border border-border bg-[#0F1517] p-5 text-zinc-300">
          Gartner projects up to 40% of enterprise SaaS spend shifting to usage-, agent-, or outcome-based pricing by
          2030, with point-product tools most exposed.
        </div>
        <div className="rounded-xl border border-border bg-[#0F1517] p-5 text-zinc-300">
          SaaS waste remains meaningful: license utilization improved from 47% to 54%, but average app counts are still
          high and consolidation has slowed.
        </div>
        <div className="rounded-xl border border-border bg-[#0F1517] p-5 text-zinc-300">{close}</div>
      </div>
      <div className="mt-6 space-y-2 text-sm text-zinc-400">
        <p className="font-semibold text-zinc-300">Sources</p>
        {citations.map((citation) => (
          <p key={citation.href}>
            <a href={citation.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-200">
              {citation.label}
            </a>
          </p>
        ))}
      </div>
    </section>
  );
}
