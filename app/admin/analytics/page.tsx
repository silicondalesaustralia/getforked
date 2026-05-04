export default function AdminAnalyticsPage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      <p className="text-zinc-300">
        Monitor platform performance, landing page conversions, and lead source attribution.
      </p>
      <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-300">
        Event capture and aggregation tables are defined in the schema for reporting.
      </div>
    </section>
  );
}
