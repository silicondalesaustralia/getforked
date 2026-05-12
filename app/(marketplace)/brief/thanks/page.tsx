import Link from "next/link";

export default function BriefThanksPage() {
  return (
    <div className="container max-w-2xl py-14">
      <h1 className="text-4xl font-bold">Brief submitted.</h1>
      <p className="mt-4 text-zinc-300">
        GetForked will review the brief, tag the work, estimate complexity, and move it into the matching queue.
      </p>
      <Link href="/dashboard/buyer" className="mt-8 inline-flex rounded-md border border-zinc-700 px-4 py-2">
        View buyer dashboard
      </Link>
    </div>
  );
}
