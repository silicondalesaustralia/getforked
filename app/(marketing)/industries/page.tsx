import Link from "next/link";
import { getPublishedIndustries } from "@/lib/content/industries";

export default function IndustriesIndexPage() {
  const industries = getPublishedIndustries();

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Industries We Are Forking</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {industries.map((industry) => (
          <Link key={industry.slug} href={`/industries/${industry.slug}`} className="rounded-xl border border-zinc-800 p-5 transition hover:border-zinc-600">
            <h2 className="font-semibold">{industry.name}</h2>
            <p className="mt-2 text-sm text-zinc-300">{industry.metaDescription}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
