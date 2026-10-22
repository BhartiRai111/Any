"use client";

import { useActionState } from "react";
import { sendMessage } from "@/app/actions/contact";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, undefined);
  const input = "w-full border border-stone-400 bg-white px-3 py-2";
  if (state?.sent)
    return <p role="status" className="stamp">Thanks, we will reply within 2 working days</p>;
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">Name<input name="name" required defaultValue={state?.values?.name} className={input} autoComplete="name" /></label>
      <label className="block text-sm">Email<input name="email" type="email" required defaultValue={state?.values?.email} className={input} autoComplete="email" /></label>
      <label className="block text-sm">Message<textarea name="message" required rows={5} defaultValue={state?.values?.message} className={input} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {state?.error && <p role="alert" className="text-rose-600">{state.error}</p>}
      <button disabled={pending} className="bg-brand px-6 py-2.5 text-white disabled:opacity-60">{pending ? "Sending…" : "send message"}</button>
    </form>
  );
}
