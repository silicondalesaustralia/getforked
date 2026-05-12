import { ContactForm } from "@/components/marketplace/contact-form";

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-bold">Contact GetForked</h1>
      <p className="mt-2 text-zinc-300">Send buyer, builder, partnership, support, or general enquiries.</p>
      <div className="mt-4 rounded-xl border border-border bg-card p-4 text-zinc-200">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Business address</p>
        <p className="mt-2 leading-7">
          41B Luck St
          <br />
          Macclesfield, South Australian, 5153
        </p>
      </div>
      <div className="mt-6">
        <ContactForm endpoint="/api/contact" />
      </div>
    </div>
  );
}
