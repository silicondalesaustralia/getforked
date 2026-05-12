const trustItems = [
  "Approved builders only",
  "No open bid spam",
  "Scoped before you commit",
  "Matched by tool experience",
];

export function ZapierTrustBar() {
  return (
    <section className="border-y border-[#243034] bg-[#0B1012]/80">
      <div className="container grid gap-3 py-5 md:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item} className="rounded-xl border border-[#243034] bg-[#0F1517] px-4 py-3 text-sm text-[#B8C2BE]">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
