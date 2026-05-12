type AdminSectionProps = {
  title: string;
  description: string;
  items: string[];
};

export function AdminSection({ title, description, items }: AdminSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_30px_60px_-45px_rgba(124,156,255,0.6)]">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-zinc-300">{description}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-border bg-surface/45 p-4 text-sm text-zinc-300">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
