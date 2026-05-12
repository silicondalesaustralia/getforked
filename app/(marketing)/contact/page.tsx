import { ContactForm } from "@/components/marketplace/contact-form";

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-bold">Contact GetForked</h1>
      <p className="mt-2 text-zinc-300">Send buyer, builder, partnership, support, or general enquiries.</p>
      <div className="mt-6">
        <ContactForm endpoint="/api/contact" />
      </div>
    </div>
  );
}
