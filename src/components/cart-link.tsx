"use client";

import Link from "next/link";
import { useCart } from "./cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative border-2 border-stone-900 px-3 py-1 hover:bg-stone-900 hover:text-white">
      bag{count > 0 && <span className="ml-1 font-semibold">({count})</span>}
    </Link>
  );
}
