import { ContactForm } from "@/components/marketplace/contact-form";

export default function SupportPage() {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-bold">Support</h1>
      <p className="mt-2 text-zinc-300">Get help with buyer briefs, builder onboarding, projects, and payment status questions.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {["Buyer support", "Builder support", "Payment and project support", "General platform support"].map((item) => (
          <div key={item} className="rounded-xl border border-border bg-card p-4 text-zinc-300">
            {item}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <ContactForm endpoint="/api/support" />
      </div>
    </div>
  );
}
