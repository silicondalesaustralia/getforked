import Link from "next/link";

export default function ZapierPageNotFound() {
  return (
    <main className="min-h-screen bg-[#050708] text-[#F4F7F5]">
      <section className="container py-24">
        <p className="text-sm uppercase tracking-[0.22em] text-[#7E8A86]">Zapier page not found</p>
        <h1 className="mt-4 text-4xl font-bold">This Zapier replacement page is not published yet.</h1>
        <Link href="/zapier/" className="mt-8 inline-flex rounded-[10px] bg-[#18E38A] px-5 py-3 font-bold text-[#02100A]">
          Browse Zapier replacements
        </Link>
      </section>
    </main>
  );
}
