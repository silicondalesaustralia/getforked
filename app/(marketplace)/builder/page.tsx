import Link from "next/link";

const cards = ["Application status", "Invitations", "Matched projects", "Availability"];

export default function BuilderDashboardPage() {
  return (
    <div className="container py-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Builder Dashboard</h1>
          <p className="mt-2 text-zinc-300">Manage your application, availability, invitations, and matched work.</p>
        </div>
        <Link href="/builder/apply" className="rounded-full border border-border bg-card px-5 py-2.5">
          Update application
        </Link>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <article key={card} className="rounded-2xl border border-border bg-card p-5 shadow-[0_20px_40px_-36px_rgba(124,156,255,0.7)]">
            <h2 className="text-lg font-semibold">{card}</h2>
            <p className="mt-2 text-sm text-zinc-400">Ready for live records.</p>
          </article>
        ))}
      </section>
    </div>
  );
}
