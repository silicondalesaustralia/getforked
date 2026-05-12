"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function BuilderApplicationForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/builders/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json() as { error?: string };
        setMessage(error.error ?? "Application failed.");
        return;
      }
      await response.json();
      router.push("/builder");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Application failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-zinc-800 p-5">
      {["name", "email", "slug", "headline", "skills", "tools"].map((name) => (
        <label key={name} className="grid gap-1 text-sm text-zinc-300">
          {name}
          <input name={name} required className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
        </label>
      ))}
      <label className="grid gap-1 text-sm text-zinc-300">
        bio
        <textarea name="bio" required className="min-h-32 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </label>
      {message ? <p className="text-sm text-red-400">{message}</p> : null}
      <button className="rounded-md bg-accent px-4 py-2 font-semibold text-zinc-950" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
