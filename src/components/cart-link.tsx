"use client";

import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "./cart";
import { money } from "@/lib/format";

export function CartLink() {
  const { count, subtotalCents } = useCart();
  return (
    <Link href="/cart" className="flex items-center gap-2 hover:text-brand" aria-label={`Cart, ${count} items`}>
      <span className="relative">
        <FiShoppingCart size={24} aria-hidden="true" />
        {count > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{count}</span>}
      </span>
      <span className="hidden text-xs leading-tight sm:block"><span className="block text-stone-500">Cart</span><span className="font-semibold">{money(subtotalCents)}</span></span>
    </Link>
  );
}
