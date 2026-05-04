export default function AdminLeadsPage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Lead CRM</h2>
      <p className="text-zinc-300">
        Track leads from new to converted, with source and industry attribution.
      </p>
      <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-300">
        CSV export and status updates can be layered onto this view via Neon-backed queries.
      </div>
    </section>
  );
}
