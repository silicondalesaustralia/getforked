export default function HowItWorksPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">How It Works</h1>
      <ol className="mt-6 grid gap-4">
        <li className="rounded-xl border border-zinc-800 p-5">
          <h2 className="font-semibold">1. Tell us what you are paying for</h2>
          <p className="mt-2 text-zinc-300">We audit your current SaaS stack and map your real workflow.</p>
        </li>
        <li className="rounded-xl border border-zinc-800 p-5">
          <h2 className="font-semibold">2. We build it</h2>
          <p className="mt-2 text-zinc-300">AI-accelerated development produces custom software in weeks.</p>
        </li>
        <li className="rounded-xl border border-zinc-800 p-5">
          <h2 className="font-semibold">3. You own it</h2>
          <p className="mt-2 text-zinc-300">Your code, your infrastructure, your data, no monthly lock-in.</p>
        </li>
      </ol>
    </div>
  );
}
