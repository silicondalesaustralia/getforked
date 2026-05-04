import { LeadForm } from "@/components/forms/lead-form";

export default function BookPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Book A Call</h1>
      <p className="mt-2 text-zinc-300">
        Share your details and current SaaS stack. We will reply with available times.
      </p>
      <div className="mt-6 max-w-xl">
        <LeadForm source="book_page" />
      </div>
    </div>
  );
}
