"use client";

import { useActionState } from "react";
import { addAddress } from "@/app/actions/address";

export function AddressForm() {
  const [state, action, pending] = useActionState(addAddress, undefined);
  const input = "w-full border border-stone-400 bg-white px-3 py-2";
  const v = (k: string, d = "") => state?.values?.[k] ?? d;
  return (
    <form action={action} className="grid max-w-lg gap-3 border border-stone-400 bg-white p-4">
      <p className="font-medium">Add an address</p>
      <label className="text-sm">Name this address<input name="label" required defaultValue={v("label")} placeholder="Home" className={input} /></label>
      <label className="text-sm">Full name<input name="name" required defaultValue={v("name")} className={input} autoComplete="name" /></label>
      <label className="text-sm">Address<input name="address" required defaultValue={v("address")} className={input} autoComplete="street-address" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">City<input name="city" required defaultValue={v("city")} className={input} autoComplete="address-level2" /></label>
        <label className="text-sm">PIN code<input name="postalCode" required defaultValue={v("postalCode")} className={input} autoComplete="postal-code" /></label>
      </div>
      <label className="text-sm">Country<input name="country" required defaultValue={v("country", "India")} className={input} autoComplete="country-name" /></label>
      {state?.error && <p role="alert" className="text-sm text-rose-600">{state.error}</p>}
      <button disabled={pending} className="w-fit bg-stone-900 px-5 py-2 text-white disabled:opacity-60">{pending ? "Saving…" : "save address"}</button>
    </form>
  );
}
