import { LeadForm } from "@/components/forms/lead-form";

export default function ContactPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-zinc-300">Tell us your current software stack and monthly spend.</p>
      <div className="mt-6 max-w-xl">
        <LeadForm source="contact_page" />
      </div>
    </div>
  );
}
