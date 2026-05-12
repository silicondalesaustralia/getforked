import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="container max-w-2xl py-16">
      <h1 className="text-3xl font-bold">Onboarding</h1>
      <p className="mt-3 text-zinc-300">Select your path to continue setup.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/onboarding/buyer" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
          Buyer onboarding
        </Link>
        <Link href="/onboarding/builder" className="rounded-full border border-border px-5 py-2.5">
          Builder onboarding
        </Link>
      </div>
    </div>
  );
}
