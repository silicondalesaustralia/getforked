import { industrySeed } from "@/lib/content/industry-seed";

export default function AdminIndustriesPage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Industry Manager</h2>
      <p className="text-zinc-300">Control draft, ready, and published states for industry landing pages.</p>
      <div className="rounded-xl border border-zinc-800 p-4">
        <ul className="grid gap-2 text-sm text-zinc-300">
          {industrySeed.map((industry) => (
            <li key={industry.slug} className="flex justify-between">
              <span>{industry.name}</span>
              <span className="capitalize">{industry.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
