import Link from "next/link";
import { LeadForm } from "@/components/forms/lead-form";
import { SaasCalculator } from "@/components/sections/saas-calculator";

export default function HomePage() {
  return (
    <div className="container py-14">
      <section className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Stop paying software rent</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Paying for SaaS features you do not need?
          </h1>
          <p className="text-zinc-300">
            Own your code. We build custom software around your workflow so you can cancel subscriptions.
          </p>
          <div className="flex gap-3">
            <Link href="/book" className="rounded-md bg-accent px-4 py-2 font-semibold text-zinc-950">
              Get Forked
            </Link>
            <Link href="#how-it-works" className="rounded-md border border-zinc-700 px-4 py-2">
              See How It Works
            </Link>
          </div>
        </div>
        <LeadForm source="homepage_hero" />
      </section>
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 p-6">
          <h2 className="text-2xl font-semibold">The SaaS tax is real</h2>
          <p className="mt-2 text-zinc-300">
            Per-seat pricing, feature bloat, forced upgrades, and lock-in punish growing businesses.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 p-6">
          <h2 className="text-2xl font-semibold">Fork your stack</h2>
          <p className="mt-2 text-zinc-300">
            We audit your tools, rebuild what matters, then hand over the repo and docs.
          </p>
        </div>
      </section>
      <section id="how-it-works" className="mt-16 scroll-mt-24">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">How it works</p>
          <h2 className="mt-2 text-3xl font-bold">Three steps to owning your stack</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 p-5">
            <p className="text-sm font-semibold text-accent">01</p>
            <h3 className="mt-3 text-xl font-semibold">Tell us what you pay for</h3>
            <p className="mt-2 text-zinc-300">We audit your current SaaS stack and identify what to replace.</p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-5">
            <p className="text-sm font-semibold text-accent">02</p>
            <h3 className="mt-3 text-xl font-semibold">We build it</h3>
            <p className="mt-2 text-zinc-300">AI-accelerated custom development, tailored to your exact workflow.</p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-5">
            <p className="text-sm font-semibold text-accent">03</p>
            <h3 className="mt-3 text-xl font-semibold">You own it</h3>
            <p className="mt-2 text-zinc-300">Deployed, documented, and yours. Cancel the subscriptions.</p>
          </div>
        </div>
      </section>
      <section className="mt-16">
        <SaasCalculator />
      </section>
    </div>
  );
}
