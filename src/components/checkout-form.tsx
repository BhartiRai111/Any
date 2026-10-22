"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";
import { money } from "@/lib/format";
import { shippingFor } from "@/lib/shipping";
import { placeOrder, confirmPayment, cancelUnpaidOrder, type PayRequest } from "@/app/actions/order";

type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RzpInstance = { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RzpInstance;
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const el = document.createElement("script");
    el.src = "https://checkout.razorpay.com/v1/checkout.js";
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

export function CheckoutForm({ defaults, bankAvailable, onlineAvailable }: { defaults: { name: string; email: string }; bankAvailable: boolean; onlineAvailable: boolean }) {
  const { lines, subtotalCents } = useCart();
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const router = useRouter();
  const [payMessage, setPayMessage] = useState("");
  const shipping = shippingFor(subtotalCents);
  const v = (k: string, fallback = "") => state?.values?.[k] ?? fallback;
  const input = "w-full rounded-md border border-stone-300 px-3 py-2";


  useEffect(() => {
    const pay: PayRequest | undefined = state?.pay;
    if (!pay) return;
    let cancelled = false;
    (async () => {
      setPayMessage("");
      if (!(await loadRazorpay()) || cancelled || !window.Razorpay) {
        await cancelUnpaidOrder(pay.orderId, pay.razorpayOrderId);
        setPayMessage("The payment window could not load. Check your connection and try again.");
        return;
      }
      let finished = false;
      const rzp = new window.Razorpay({
        key: pay.keyId,
        amount: pay.amount,
        currency: "INR",
        name: "Willow & Clay",
        description: `Order #${pay.orderId}`,
        order_id: pay.razorpayOrderId,
        prefill: { name: pay.name, email: pay.email },
        theme: { color: "#2b2118" },
        handler: async (r: RzpResponse) => {
          finished = true;
          setPayMessage("Confirming your payment…");
          const res = await confirmPayment(pay.orderId, r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature);
          if (res.ok) router.push(`/checkout/success?order=${pay.orderId}&pay=ONLINE`);
          else setPayMessage("We could not confirm your payment yet. If money was deducted it will be matched to your order automatically.");
        },
        modal: {
          ondismiss: async () => {
            if (finished) return;
            await cancelUnpaidOrder(pay.orderId, pay.razorpayOrderId);
            setPayMessage("Payment cancelled. Your bag is still here.");
          },
        },
      });
      rzp.on("payment.failed", (r) => setPayMessage(r.error?.description ?? "Payment failed. You can try again."));
      rzp.open();
    })();
    return () => {
      cancelled = true;
    };
  }, [state, router]);

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
        <label className="block text-sm">Country<input name="country" required defaultValue={v("country", "India")} className={input} autoComplete="country-name" /></label>
        <fieldset className="space-y-2 border border-stone-400 p-4">
          <legend className="px-1 text-sm">Payment</legend>
          {onlineAvailable && (
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="paymentMethod" value="ONLINE" defaultChecked={v("paymentMethod", "ONLINE") === "ONLINE"} className="mt-1" />
              <span>UPI, cards, net banking, wallets, EMI <span className="block text-xs text-stone-600">Secure payment by Razorpay</span></span>
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="paymentMethod" value="COD" defaultChecked={v("paymentMethod", onlineAvailable ? "ONLINE" : "COD") === "COD"} /> Pay on delivery
          </label>
          {bankAvailable && (
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="paymentMethod" value="BANK_TRANSFER" defaultChecked={v("paymentMethod") === "BANK_TRANSFER"} /> Bank transfer (details shown after ordering)
            </label>
          )}
          <p className="text-xs text-stone-600">See <Link href="/payments" className="underline">payment options</Link>.</p>
        </fieldset>
      </div>
      <aside className="h-fit rounded-sm border border-stone-200 p-5 text-sm">
        <h2 className="text-lg font-medium">Order summary</h2>
        <ul className="mt-3 space-y-2">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.size}-${l.color}`} className="flex justify-between gap-2">
              <span>{l.quantity} × {l.name} ({l.size})</span>
              <span className="shrink-0 whitespace-nowrap">{money(l.unitCents * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></div>
        <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-base font-semibold">
          <span>Total</span><span>{money(subtotalCents + shipping)}</span>
        </div>
        {state?.error && <p role="alert" className="mt-3 text-rose-600">{state.error}</p>}
        {payMessage && <p role="status" className="mt-3">{payMessage}</p>}
        <button disabled={pending} className="mt-5 w-full rounded-sm bg-stone-900 py-3 text-white disabled:opacity-60">
          {pending ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
