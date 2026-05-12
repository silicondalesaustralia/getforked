import Link from "next/link";

const statuses = ["Submitted briefs", "In review", "Matching", "Matched projects"];

export default function BuyerDashboardPage() {
  return (
    <div className="container py-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Buyer Dashboard</h1>
          <p className="mt-2 text-zinc-300">Track briefs, matched projects, org settings, and requests for info.</p>
        </div>
        <Link href="/brief/new" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
          Submit another brief
        </Link>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {statuses.map((status) => (
          <article key={status} className="rounded-2xl border border-border bg-card p-5 shadow-[0_20px_40px_-36px_rgba(124,156,255,0.7)]">
            <p className="text-2xl font-bold">0</p>
            <h2 className="mt-2 text-zinc-300">{status}</h2>
          </article>
        ))}
      </section>
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-xl font-semibold">Messages placeholder</h2>
        <p className="mt-2 text-zinc-300">Project updates and admin requests will appear here in Phase 1.</p>
      </section>
    </div>
  );
}
