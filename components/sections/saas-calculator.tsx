"use client";

import { useMemo, useState } from "react";

type SaasCalculatorProps = {
  initialTools?: number;
  initialAverageMonthlyCost?: number;
  multiplier?: number;
  breakevenMessage?: string;
};

export function SaasCalculator({
  initialTools = 4,
  initialAverageMonthlyCost = 180,
  multiplier = 1.4,
  breakevenMessage,
}: SaasCalculatorProps) {
  const [tools, setTools] = useState(initialTools);
  const [cost, setCost] = useState(initialAverageMonthlyCost);

  const annualCost = useMemo(() => tools * cost * 12, [cost, tools]);
  const suggestedBuild = useMemo(() => Math.round(annualCost * multiplier), [annualCost, multiplier]);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_14px_42px_rgba(0,0,0,0.18)]">
      <h3 className="text-xl font-semibold">SaaS tax calculator</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Number of tools
          <input
            type="number"
            min={1}
            value={tools}
            onChange={(event) => setTools(Number(event.target.value))}
            className="rounded-[10px] border border-[#2a3639] bg-[#050708] px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Average monthly cost per tool
          <input
            type="number"
            min={50}
            value={cost}
            onChange={(event) => setCost(Number(event.target.value))}
            className="rounded-[10px] border border-[#2a3639] bg-[#050708] px-3 py-2"
          />
        </label>
      </div>
      <p className="mt-4 text-zinc-300">
        Annual SaaS spend: <span className="font-semibold text-white">${annualCost.toLocaleString()}</span>
      </p>
      <p className="text-zinc-300">
        Typical one-time custom build:{" "}
        <span className="font-semibold text-accent">${suggestedBuild.toLocaleString()}</span>
      </p>
      {breakevenMessage ? <p className="mt-3 text-sm text-zinc-400">{breakevenMessage}</p> : null}
    </section>
  );
}
