import Link from "next/link";
import { db } from "@/lib/db";
import { storeEmail } from "@/lib/store";
import { NewsletterForm } from "./newsletter-form";

export async function Footer() {
  const categories = await db.category.findMany({ orderBy: { id: "asc" } });
  const h = "mb-3 text-sm font-bold";
  const li = "py-1 text-stone-300 hover:text-white";
  return (
    <footer className="mt-12 bg-stone-900 text-sm text-stone-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-stone-700 pb-8 md:flex-row md:items-center">
          <div>
            <p className="text-lg font-bold text-white">Subscribe to get our updates</p>
            <p className="text-stone-400">New pieces, restocks and studio news. No spam.</p>
          </div>
          <NewsletterForm dark />
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="text-2xl font-bold text-white">Willow &amp; Clay<span className="text-brand">.</span></p>
            <p className="mt-3 max-w-xs text-stone-400">Handmade ceramics and candles, made in small batches in a one-room studio.</p>
            <p className="mt-4 select-all">{storeEmail()}</p>
          </div>
          <div>
            <p className={h}>Links</p>
            <ul><li><Link className={li} href="/shop">All products</Link></li><li><Link className={li} href="/orders">Order tracking</Link></li><li><Link className={li} href="/cart">Shopping bag</Link></li><li><Link className={li} href="/wishlist">Wishlist</Link></li></ul>
          </div>
          <div>
            <p className={h}>Support</p>
            <ul><li><Link className={li} href="/about">About us</Link></li><li><Link className={li} href="/contact">Contact</Link></li><li><Link className={li} href="/payments">Payment options</Link></li><li><Link className={li} href="/careers">Careers</Link></li></ul>
          </div>
          <div>
            <p className={h}>Categories</p>
            <ul>{categories.map((c) => <li key={c.id}><Link className={li} href={`/shop?category=${c.slug}`}>{c.name}</Link></li>)}</ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-stone-700 pt-6 text-xs text-stone-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Willow &amp; Clay. Demo store.</p>
          <p className="flex flex-wrap gap-2" aria-label="Accepted payments">
            {["UPI", "Visa", "Mastercard", "RuPay", "Net banking", "Wallets", "EMI"].map((m) => <span key={m} className="rounded border border-stone-600 px-2 py-0.5 text-stone-300">{m}</span>)}
          </p>
        </div>
      </div>
    </footer>
  );
}
