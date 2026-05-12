import Link from "next/link";

export default function BuyerBriefsPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Buyer Briefs</h1>
      <p className="mt-2 text-zinc-300">View submitted briefs and status updates from review through matching.</p>
      <Link href="/dashboard/buyer/briefs/new" className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">
        Submit new brief
      </Link>
    </div>
  );
}
