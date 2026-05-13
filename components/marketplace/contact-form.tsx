"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  endpoint: "/api/contact" | "/api/support";
};

export function ContactForm({ endpoint }: ContactFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      if (!response.ok) {
        const error = await response.json() as { error?: string };
        setMessage(error.error ?? "Submission failed.");
        return;
      }
      await response.json();
      setMessage("Thanks. We received your message.");
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-5">
      {["name", "email", "company"].map((name) => (
        <input key={name} name={name} placeholder={name} required className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
      ))}
      <select name="reason" required className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2">
        {[
          { value: "buyer enquiry", label: "Buyer enquiry" },
          { value: "builder enquiry", label: "Builder enquiry" },
          { value: "partnership", label: "Partnership" },
          { value: "support", label: "Support" },
          { value: "other", label: "Other" },
        ].map((reason) => (
          <option key={reason.value} value={reason.value}>
            {reason.label}
          </option>
        ))}
      </select>
      <textarea name="message" placeholder="message" required className="min-h-32 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      <button className="rounded-full bg-accent px-5 py-2.5 font-semibold text-zinc-950">Send</button>
    </form>
  );
}
