"use client";

import { FormEvent, useState } from "react";
import type { LeadFormConfig } from "@/types/industry";

type LeadFormProps = {
  industrySlug?: string;
  leadForm?: LeadFormConfig;
  source?: string;
};

const fieldClass = "rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2";

export function LeadForm({ industrySlug, leadForm, source = "site" }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const softwareSelections = formData.getAll("softwareSelections").map(String);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, softwareSelections, source, industrySlug }),
      });

      if (!response.ok) {
        setStatus("error");
        setMessage("Could not submit your details. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("Thanks. We will be in touch within one business day.");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please email hello@getforked.dev.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-zinc-800 bg-card p-4">
      <input required name="name" placeholder="Name" className={fieldClass} />
      <input required name="email" type="email" placeholder="Email" className={fieldClass} />
      <input name="phone" placeholder="Phone" className={fieldClass} />
      <input name="businessType" placeholder={leadForm?.companyLabel ?? "Business type"} className={fieldClass} />
      {leadForm?.teamSizeField ? (
        <label className="grid gap-1 text-sm text-zinc-300">
          {leadForm.teamSizeField.label}
          <select name={leadForm.teamSizeField.name} className={fieldClass}>
            <option value="">Select an option</option>
            {leadForm.teamSizeField.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {leadForm?.extraFields?.map((field) => (
        <label key={field.name} className="grid gap-1 text-sm text-zinc-300">
          {field.label}
          <select name={field.name} className={fieldClass}>
            <option value="">Select an option</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}
      {leadForm ? (
        <fieldset className="grid gap-2 rounded-md border border-zinc-800 p-3">
          <legend className="px-1 text-sm text-zinc-300">What software are you currently using?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {leadForm.softwareOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-zinc-300">
                <input name="softwareSelections" type="checkbox" value={option} />
                {option}
              </label>
            ))}
          </div>
          <input name="otherSoftware" placeholder="Other software" className={fieldClass} />
        </fieldset>
      ) : (
        <textarea name="saasTools" rows={3} placeholder="What SaaS are you paying for?" className={fieldClass} />
      )}
      {leadForm ? (
        <select name="monthlySpendRange" className={fieldClass}>
          <option value="">Estimated monthly SaaS spend (local currency)</option>
          {leadForm.spendOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}
      <button disabled={status === "submitting"} className="rounded-md bg-accent px-4 py-2 font-medium text-zinc-950 disabled:opacity-50">
        {status === "submitting" ? "Submitting..." : "Get Forked"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </form>
  );
}
