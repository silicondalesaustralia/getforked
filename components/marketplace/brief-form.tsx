"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function BriefForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json() as { error?: string };
        setMessage(error.error ?? "Brief submission failed.");
        return;
      }
      await response.json();
      router.push("/brief/thanks");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Brief submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 rounded-2xl border border-border bg-card p-6">
      <section className="grid gap-3">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">STEP 1 OF 8</p>
        <label className="grid gap-1 text-sm text-zinc-300">
          What are you looking for?
          <input
            name="projectType"
            required
            placeholder="Replace a SaaS tool / automate a process / build a dashboard"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-zinc-300">
          Current tools in this workflow
          <input
            name="tools"
            required
            placeholder="HubSpot, Zapier, Airtable, Sheets"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm text-zinc-300">
          Monthly SaaS spend (optional)
          <input
            name="saasSpend"
            placeholder="$500-$1,000"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
      </section>
      <section className="grid gap-3">
        <label className="grid gap-1 text-sm text-zinc-300">
          What is not working?
          <textarea
            name="problem"
            required
            placeholder="Describe what is frustrating, slow, or broken."
            className="min-h-24 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm text-zinc-300">
          What does good look like?
          <textarea
            name="desiredOutcome"
            required
            placeholder="Describe the ideal outcome for your team or customers."
            className="min-h-24 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-zinc-300">
          Data flow / integrations needed
          <textarea
            name="dataFlow"
            required
            placeholder="What apps need to sync or exchange data?"
            className="min-h-20 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm text-zinc-300">
          Access and users
          <textarea
            name="accessModel"
            required
            placeholder="How many users, team vs client-facing, login needs."
            className="min-h-20 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm text-zinc-300">
          Budget range
          <input name="budget" required placeholder="$3,000-$7,000" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-zinc-300">
          Timeline
          <input name="urgency" required placeholder="Within 3 months" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-zinc-300">
          Contact email
          <input
            name="contactEmail"
            type="email"
            required
            placeholder="you@company.com"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
      </section>
      {message ? <p className="text-sm text-red-400">{message}</p> : null}
      <button className="rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Brief"}
      </button>
    </form>
  );
}
