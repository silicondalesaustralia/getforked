import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="container max-w-2xl py-16">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <p className="mt-3 text-zinc-300">
        Account registration is onboarding-driven in Phase 1. Choose whether you need work built or want to build projects.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/onboarding/buyer" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
          I need work built
        </Link>
        <Link href="/onboarding/builder" className="rounded-full border border-border px-5 py-2.5">
          I want to build projects
        </Link>
      </div>
    </div>
  );
}
