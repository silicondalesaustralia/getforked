export default function AdminSchedulePage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Social Scheduler</h2>
      <p className="text-zinc-300">Queue videos by platform and time window for automated publishing.</p>
      <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-300">
        Scheduling API endpoint is available at `/api/schedule` for calendar and queue integrations.
      </div>
    </section>
  );
}
