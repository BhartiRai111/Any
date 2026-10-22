"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";

type P = { id: number; slug: string; name: string; tone: string; priceCents: number; colors: string[]; sizes: string[] };

export function AddToCart({ p }: { p: P }) {
  const [size, setSize] = useState(p.sizes.length === 1 ? p.sizes[0] : "");
  const [color, setColor] = useState(p.colors[0]);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const router = useRouter();

  function submit(goToBag: boolean) {
    if (!size) return setError("Please choose a size");
    setError("");
    add({ productId: p.id, slug: p.slug, name: p.name, tone: p.tone, size, color, unitCents: p.priceCents, quantity: 1 });
    if (goToBag) router.push("/cart");
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">Glaze</p>
        <div className="flex gap-2">
          {p.colors.map((c) => (
            <button key={c} type="button" aria-label={`Colour ${c}`} aria-pressed={c === color} onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-sm border-2 ${c === color ? "border-stone-900" : "border-stone-200"}`} style={{ background: c }} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Size</p>
        <div className="flex flex-wrap gap-2">
          {p.sizes.map((s) => (
            <button key={s} type="button" aria-pressed={s === size} onClick={() => setSize(s)}
              className={`min-w-12 rounded-md border px-3 py-2 text-sm ${s === size ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 hover:bg-stone-100"}`}>
              {s}
            </button>
          ))}
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-rose-600">{error}</p>}
      </div>
      <div className="flex gap-3">
        <button onClick={() => submit(false)} className="flex-1 rounded-sm bg-stone-900 py-3 text-white hover:bg-stone-700">
          {added ? "added ✓" : "add to bag"}
        </button>
        <button onClick={() => submit(true)} className="flex-1 border-2 border-stone-900 py-3 hover:bg-stone-100">
          buy now
        </button>
      </div>
    </div>
  );
}
