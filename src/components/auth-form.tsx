"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/app/actions/auth";

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "register";
  action: (s: FormState, f: FormData) => Promise<FormState>;
  next: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const input = "w-full rounded-md border border-stone-300 px-3 py-2";
  return (
    <form action={formAction} className="mx-auto mt-12 max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h1>
      <input type="hidden" name="next" value={next} />
      {mode === "register" && (
        <label className="block text-sm">Name<input name="name" required className={input} autoComplete="name" /></label>
      )}
      <label className="block text-sm">Email<input name="email" type="email" required className={input} autoComplete="email" /></label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" required minLength={mode === "register" ? 8 : undefined} className={input}
          autoComplete={mode === "login" ? "current-password" : "new-password"} />
      </label>
      {state?.error && <p role="alert" className="text-sm text-rose-600">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-md bg-stone-900 py-2.5 text-white disabled:opacity-60">
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
      <p className="text-sm text-stone-600">
        {mode === "login" ? (
          <>New here? <Link className="underline" href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></>
        ) : (
          <>Have an account? <Link className="underline" href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></>
        )}
      </p>
    </form>
  );
}
