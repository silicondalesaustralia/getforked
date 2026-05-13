"use client";

import { FormEvent, useState } from "react";
import type { LeadFormConfig } from "@/types/industry";

type LeadFormProps = {
  industrySlug?: string;
  leadForm?: LeadFormConfig;
  source?: string;
};

const fieldClass = "input-field rounded-[10px] border border-[#2a3639] bg-[#050708] px-3.5 py-2.5 text-[#f4f7f5] placeholder:text-[#7e8a86] focus:border-accent focus:outline-none focus:ring-3 focus:ring-emerald-400/15";

export function LeadForm({ industrySlug, leadForm, source = "site" }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
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
      formElement.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please email hello@getforked.dev.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="form-stack ml-auto grid max-w-[480px] gap-[14px] rounded-[20px] border border-emerald-400/20 bg-gradient-to-b from-[#101719] to-[#0b1012] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
    >
      {source.includes("homepage") ? (
        <>
          <h3 className="text-xl font-semibold text-[#f4f7f5]">Submit your brief</h3>
          <p className="-mt-1 text-sm text-muted">
            Tell us what you want to replace, connect or automate. We will match the right builder.
          </p>
        </>
      ) : null}
      <label className="sr-only" htmlFor="lead-name">
        Name
      </label>
      <input id="lead-name" required name="name" placeholder="Name" className={fieldClass} />
      <label className="sr-only" htmlFor="lead-email">
        Email
      </label>
      <input id="lead-email" required name="email" type="email" placeholder="Email" className={fieldClass} />
      <label className="sr-only" htmlFor="lead-phone">
        Phone
      </label>
      <input id="lead-phone" name="phone" placeholder="Phone" className={fieldClass} />
      <label className="sr-only" htmlFor="lead-business-type">
        Business type
      </label>
      <input
        id="lead-business-type"
        name="businessType"
        placeholder={leadForm?.companyLabel ?? "Business type"}
        className={fieldClass}
      />
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
      <button
        disabled={status === "submitting"}
        className="w-full rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-500 px-4 py-2.5 font-semibold text-[#02100a] shadow-[0_14px_36px_rgba(24,227,138,0.22)] disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting..." : "Get Matched"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </form>
  );
}
