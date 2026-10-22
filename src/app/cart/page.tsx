"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { money } from "@/lib/format";
import { SHIPPING_CENTS, FREE_SHIPPING_OVER } from "@/lib/shipping";

export default function CartPage() {
  const { lines, subtotalCents, setQuantity } = useCart();
  const shipping = lines.length === 0 || subtotalCents >= FREE_SHIPPING_OVER ? 0 : SHIPPING_CENTS;

  if (lines.length === 0)
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-stone-900 px-8 py-3 text-white">Continue shopping</Link>
      </div>
    );

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="font-serif text-3xl">Your bag</h1>
        <ul className="mt-6 divide-y divide-stone-200">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.size}-${l.color}`} className="flex gap-4 py-4">
              <div className="h-28 w-20 shrink-0 rounded-md" style={{ background: l.tone }} />
              <div className="flex-1 text-sm">
                <Link href={`/product/${l.slug}`} className="font-medium hover:underline">{l.name}</Link>
                <p className="mt-1 flex items-center gap-2 text-stone-600">
                  <span className="h-3 w-3 rounded-full border border-stone-300" style={{ background: l.color }} /> Size {l.size}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button aria-label="Decrease quantity" className="h-8 w-8 rounded-full border border-stone-300"
                    onClick={() => setQuantity(l.productId, l.size, l.color, l.quantity - 1)}>−</button>
                  <span aria-live="polite">{l.quantity}</span>
                  <button aria-label="Increase quantity" className="h-8 w-8 rounded-full border border-stone-300"
                    onClick={() => setQuantity(l.productId, l.size, l.color, l.quantity + 1)}>+</button>
                  <button className="ml-4 underline" onClick={() => setQuantity(l.productId, l.size, l.color, 0)}>Remove</button>
                </div>
              </div>
              <p className="text-sm font-medium">{money(l.unitCents * l.quantity)}</p>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit rounded-xl border border-stone-200 p-5 text-sm">
        <h2 className="text-lg font-medium">Summary</h2>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotalCents)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? money(shipping) : "Free"}</dd></div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold">
            <dt>Total</dt><dd>{money(subtotalCents + shipping)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="mt-5 block rounded-full bg-stone-900 py-3 text-center text-white hover:bg-stone-700">
          Checkout
        </Link>
      </aside>
    </div>
  );
}
