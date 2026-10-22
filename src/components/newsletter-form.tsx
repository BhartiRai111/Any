"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/actions/newsletter";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribe, undefined);
  if (state?.done) return <p role="status" className="font-medium">Thanks for subscribing!</p>;
  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input name="email" type="email" required placeholder="Enter your email address" aria-label="Email address" className={`min-w-0 flex-1 rounded border px-4 py-2.5 text-sm ${dark ? "border-stone-600 bg-stone-800 text-white placeholder:text-stone-400" : "border-stone-300 bg-white"}`} />
      <button disabled={pending} className="rounded bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{pending ? "…" : "Subscribe"}</button>
      {state?.error && <p role="alert" className="text-sm text-rose-600 sm:basis-full">{state.error}</p>}
    </form>
  );
}
