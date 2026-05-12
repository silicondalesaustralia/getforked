import Link from "next/link";

const requiredFields = [
  "Name and email",
  "Company name and website",
  "Country and timezone",
  "Industry and company size",
  "Current tools in use",
];

export default function BuyerOnboardingPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold">Buyer onboarding</h1>
      <p className="mt-3 text-zinc-300">Create your buyer organisation profile, then start your first structured brief.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {requiredFields.map((field) => (
          <div key={field} className="rounded-xl border border-border bg-card p-4 text-zinc-300">
            {field}
          </div>
        ))}
      </div>
      <Link href="/dashboard/buyer/briefs/new" className="mt-8 inline-flex rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
        Submit a project brief
      </Link>
    </div>
  );
}
