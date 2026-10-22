"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useCart } from "./cart";
import { money } from "@/lib/format";
import { shippingFor } from "@/lib/shipping";
import { placeOrder } from "@/app/actions/order";

export function CheckoutForm({ defaults }: { defaults: { name: string; email: string } }) {
  const { lines, subtotalCents } = useCart();
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const shipping = shippingFor(subtotalCents);
  const v = (k: string, fallback = "") => state?.values?.[k] ?? fallback;
  const input = "w-full rounded-md border border-stone-300 px-3 py-2";


  if (lines.length === 0)
    return (
      <div className="py-20 text-center">
        <p>Your bag is empty.</p>
        <Link href="/shop" className="mt-4 inline-block underline">Continue shopping</Link>
      </div>
    );

  const payload = JSON.stringify(lines.map((l) => ({ productId: l.productId, size: l.size, color: l.color, quantity: l.quantity })));

  return (
    <form action={action} className="grid gap-10 md:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <h1 className="font-serif text-3xl">Checkout</h1>
        <input type="hidden" name="lines" value={payload} />
        <label className="block text-sm">Full name<input name="name" required defaultValue={v("name", defaults.name)} className={input} autoComplete="name" /></label>
        <label className="block text-sm">Email<input name="email" type="email" required defaultValue={v("email", defaults.email)} className={input} autoComplete="email" /></label>
        <label className="block text-sm">Address<input name="address" required defaultValue={v("address")} className={input} autoComplete="street-address" /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">City<input name="city" required defaultValue={v("city")} className={input} autoComplete="address-level2" /></label>
          <label className="block text-sm">Postal code<input name="postalCode" required defaultValue={v("postalCode")} className={input} autoComplete="postal-code" /></label>
        </div>
        <label className="block text-sm">Country<input name="country" required defaultValue={v("country", "United States")} className={input} autoComplete="country-name" /></label>
        <p className="rounded-md bg-[#fffaf0] border border-dashed border-stone-500 p-3 text-sm">
          Payment: this demo does not charge cards. Orders are recorded as “pay on delivery”.
        </p>
      </div>
      <aside className="h-fit rounded-sm border border-stone-200 p-5 text-sm">
        <h2 className="text-lg font-medium">Order summary</h2>
        <ul className="mt-3 space-y-2">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.size}-${l.color}`} className="flex justify-between gap-2">
              <span>{l.quantity} × {l.name} ({l.size})</span>
              <span>{money(l.unitCents * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></div>
        <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-base font-semibold">
          <span>Total</span><span>{money(subtotalCents + shipping)}</span>
        </div>
        {state?.error && <p role="alert" className="mt-3 text-rose-600">{state.error}</p>}
        <button disabled={pending} className="mt-5 w-full rounded-sm bg-stone-900 py-3 text-white disabled:opacity-60">
          {pending ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
