"use client";

import Link from "next/link";
import { useCart } from "./cart";
import { money } from "@/lib/format";

export function CartLink() {
  const { count, subtotalCents } = useCart();
  return (
    <Link href="/cart" className="flex items-center gap-2 hover:text-brand" aria-label={`Cart, ${count} items`}>
      <span className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.4 12.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6" /></svg>
        {count > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{count}</span>}
      </span>
      <span className="hidden text-xs leading-tight sm:block"><span className="block text-stone-500">Cart</span><span className="font-semibold">{money(subtotalCents)}</span></span>
    </Link>
  );
}
