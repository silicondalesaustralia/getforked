import Link from "next/link";

const requiredFields = [
  "Full name and company/team name",
  "Country and timezone",
  "Primary skills and tools/API experience",
  "Portfolio links and profile URLs",
  "Rate range, availability, and project preferences",
];

export default function BuilderOnboardingPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold">Builder onboarding</h1>
      <p className="mt-3 text-zinc-300">Submit your application for review. Approved builders receive matched project invitations.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {requiredFields.map((field) => (
          <div key={field} className="rounded-xl border border-border bg-card p-4 text-zinc-300">
            {field}
          </div>
        ))}
      </div>
      <Link href="/dashboard/builder/application" className="mt-8 inline-flex rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
        Start application
      </Link>
    </div>
  );
}
