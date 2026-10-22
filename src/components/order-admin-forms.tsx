"use client";

import { useActionState } from "react";
import { saveTracking, refundOrder } from "@/app/actions/admin";

export function TrackingForm({ orderId, courier, trackingNumber }: { orderId: number; courier: string; trackingNumber: string }) {
  const [state, action, pending] = useActionState(saveTracking.bind(null, orderId), undefined);
  const input = "border border-stone-400 bg-white px-2 py-1";
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
      <input name="courier" required defaultValue={courier} placeholder="Courier" aria-label={`Courier for order ${orderId}`} className={input} />
      <input name="trackingNumber" required defaultValue={trackingNumber} placeholder="Tracking number" aria-label={`Tracking number for order ${orderId}`} className={input} />
      <button disabled={pending} className="bg-stone-900 px-3 py-1 text-white disabled:opacity-60">{courier ? "update tracking" : "mark shipped"}</button>
      {state?.error && <span role="alert" className="text-rose-600">{state.error}</span>}
    </form>
  );
}

export function RefundForm({ orderId, amount }: { orderId: number; amount: string }) {
  const [state, action, pending] = useActionState(refundOrder.bind(null, orderId), undefined);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-3 border-t border-stone-300 pt-3">
      <label className="flex items-center gap-2"><input type="checkbox" name="confirm" /> Refund {amount} to the customer and cancel the order</label>
      <button disabled={pending} className="border-2 border-rose-600 px-3 py-1 text-rose-600 disabled:opacity-60">{pending ? "Refunding…" : "refund"}</button>
      {state?.error && <span role="alert" className="text-rose-600">{state.error}</span>}
    </form>
  );
}
