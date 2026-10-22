"use client";

import { useState, useTransition } from "react";
import { checkDelivery } from "@/app/actions/address";

export function DeliveryCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-6 text-sm">
      <p className="mb-1 font-medium">Check delivery</p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => setResult(await checkDelivery(pin)));
        }}
      >
        <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" maxLength={6} placeholder="PIN code" aria-label="PIN code" className="w-32 border border-stone-400 bg-white px-3 py-1.5" />
        <button disabled={pending} className="border-2 border-stone-900 px-3 py-1.5 hover:bg-stone-900 hover:text-white disabled:opacity-60">check</button>
      </form>
      {result && <p role="status" className={`mt-2 ${result.ok ? "" : "text-rose-600"}`}>{result.message}</p>}
    </div>
  );
}
