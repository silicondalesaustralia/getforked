"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setErrorMessage("Invalid admin credentials.");
        return;
      }
      router.push(result.url ?? callbackUrl);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4 rounded-xl border border-zinc-800 p-4" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm text-zinc-300">
        Email
        <input
          type="email"
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="grid gap-1 text-sm text-zinc-300">
        Password
        <input
          type="password"
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <button
        type="submit"
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
