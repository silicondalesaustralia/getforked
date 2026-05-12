import { BuilderApplicationForm } from "@/components/marketplace/builder-application-form";

export default function BuilderApplyPage() {
  return (
    <div className="container max-w-3xl py-14">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Builder application</p>
      <h1 className="mt-3 text-4xl font-bold">Apply to join the approved builder network.</h1>
      <p className="mt-3 text-zinc-300">
        Share your profile, tools, skills, and samples so admins can review your fit for matched projects.
      </p>
      <div className="mt-8">
        <BuilderApplicationForm />
      </div>
    </div>
  );
}
