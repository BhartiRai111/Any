"use client";

import { useActionState } from "react";
import { requestReset, resetPassword } from "@/app/actions/password";

const input = "w-full border border-stone-400 bg-white px-3 py-2";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestReset, undefined);
  if (state?.sent) return <p role="status" className="stamp">If that email has an account, a reset link is on its way</p>;
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">Email<input name="email" type="email" required className={input} autoComplete="email" /></label>
      {state?.error && <p role="alert" className="text-rose-600">{state.error}</p>}
      <button disabled={pending} className="w-full bg-stone-900 py-2.5 text-white disabled:opacity-60">{pending ? "Sending…" : "send reset link"}</button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm">New password<input name="password" type="password" required minLength={8} className={input} autoComplete="new-password" /></label>
      {state?.error && <p role="alert" className="text-rose-600">{state.error}</p>}
      <button disabled={pending} className="w-full bg-stone-900 py-2.5 text-white disabled:opacity-60">{pending ? "Saving…" : "set new password"}</button>
    </form>
  );
}
