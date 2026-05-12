import { BriefForm } from "@/components/marketplace/brief-form";

export default function NewBriefPage() {
  return (
    <div className="container max-w-4xl py-14">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Buyer brief</p>
      <h1 className="mt-3 text-4xl font-bold">Tell us what you want to replace or build</h1>
      <p className="mt-3 text-zinc-300">
        You do not need technical language. Share what is not working, what you are spending, and what outcome
        you want. We will scope and match the right builder.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {["Most briefs are reviewed within 24 hours", "No obligation - we scope before you commit", "Matched with vetted builders, not a bidding war"].map((item) => (
          <div key={item} className="rounded-xl border border-border bg-card p-4 text-sm text-zinc-300">
            {item}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <BriefForm />
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">What happens next</p>
        <ol className="mt-3 grid gap-2 text-zinc-300 md:grid-cols-3">
          <li>1. We review your brief and scope the work</li>
          <li>2. We match you with an approved builder</li>
          <li>3. You approve scope before work starts</li>
        </ol>
      </div>
    </div>
  );
}
