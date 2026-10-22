"use client";

import Link from "next/link";
import { useCart } from "./cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative rounded-full border border-stone-300 px-3 py-1 hover:bg-stone-100">
      Bag{count > 0 && <span className="ml-1 font-semibold">({count})</span>}
    </Link>
  );
}
