export default function AdminVideosPage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Video Content Manager</h2>
      <p className="text-zinc-300">Upload videos, assign industries, and manage metadata templates.</p>
      <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-300">
        Bulk upload and template variable substitution are scaffolded via `/api/upload` and scheduler APIs.
      </div>
    </section>
  );
}
