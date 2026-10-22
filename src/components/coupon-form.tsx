"use client";

import { useActionState } from "react";
import { createCoupon } from "@/app/actions/admin";

export function CouponForm() {
  const [state, action, pending] = useActionState(createCoupon, undefined);
  const input = "w-full border border-stone-400 bg-white px-3 py-2";
  const v = (k: string, d = "") => state?.values?.[k] ?? d;
  return (
    <form action={action} className="grid max-w-xl gap-3 border border-stone-400 bg-white p-4 sm:grid-cols-2">
      <p className="font-medium sm:col-span-2">New coupon</p>
      <label className="text-sm">Code<input name="code" required defaultValue={v("code")} placeholder="WELCOME10" className={`${input} uppercase`} /></label>
      <label className="text-sm">Type
        <select name="type" defaultValue={v("type", "PERCENT")} className={input}><option value="PERCENT">Percent off</option><option value="FIXED">Rupees off</option></select>
      </label>
      <label className="text-sm">Value (% or ₹)<input name="value" required inputMode="decimal" defaultValue={v("value")} className={input} /></label>
      <label className="text-sm">Minimum order (₹)<input name="minSubtotal" inputMode="decimal" defaultValue={v("minSubtotal", "0")} className={input} /></label>
      <label className="text-sm">Max uses (optional)<input name="maxUses" inputMode="numeric" defaultValue={v("maxUses")} className={input} /></label>
      <label className="text-sm">Expires on (optional)<input name="expiresAt" type="date" defaultValue={v("expiresAt")} className={input} /></label>
      {state?.error && <p role="alert" className="text-sm text-rose-600 sm:col-span-2">{state.error}</p>}
      <button disabled={pending} className="w-fit bg-stone-900 px-5 py-2 text-white disabled:opacity-60">{pending ? "Saving…" : "create coupon"}</button>
    </form>
  );
}
