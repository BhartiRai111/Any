import Link from "next/link";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { logout } from "@/app/actions/auth";
import { storeEmail } from "@/lib/store";
import { FREE_SHIPPING_OVER } from "@/lib/shipping";
import { money } from "@/lib/format";
import { CartLink } from "./cart-link";

export async function Header() {
  const [user, categories] = await Promise.all([currentUser(), db.category.findMany({ orderBy: { id: "asc" } })]);
  return (
    <>
      <div className="hidden border-b border-stone-200 bg-white text-xs text-stone-600 sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <span>{storeEmail()}</span>
          <span>Free shipping over {money(FREE_SHIPPING_OVER)} · Ships within 3 working days</span>
        </div>
      </div>
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">Willow &amp; Clay<span className="text-brand">.</span></Link>
          <form action="/shop" className="order-last flex min-w-0 basis-full sm:order-none sm:basis-auto sm:flex-1 sm:max-w-md sm:mx-auto">
            <input name="q" placeholder="Search products…" aria-label="Search products" className="min-w-0 flex-1 rounded-l border border-r-0 border-stone-300 px-4 py-2 text-sm" />
            <button aria-label="Search" className="rounded-r bg-brand px-4 text-white hover:bg-brand-dark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </button>
          </form>
          <div className="ml-auto flex items-center gap-5 text-sm sm:ml-0">
            <CartLink />
            <span className="hidden h-8 w-px bg-stone-200 sm:block" />
            {user ? (
              <div className="flex items-center gap-3 text-xs">
                <Link href="/account" className="leading-tight hover:text-brand"><span className="block text-stone-500">Hello</span><span className="block max-w-24 truncate text-sm font-semibold">{user.name.split(" ")[0]}</span></Link>
                <Link href="/wishlist" className="hover:text-brand">Wishlist</Link>
                {user.role === "ADMIN" && <Link href="/admin" className="hover:text-brand">Admin</Link>}
                <form action={logout}><button className="hover:text-brand">Sign out</button></form>
              </div>
            ) : (
              <Link href="/login" className="leading-tight hover:text-brand"><span className="block text-xs text-stone-500">User</span><span className="font-semibold">Sign in</span></Link>
            )}
          </div>
        </div>
        <nav className="bg-brand text-sm font-semibold text-white" aria-label="Main">
          <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto whitespace-nowrap px-4 py-3">
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                All categories
              </summary>
              <ul className="absolute left-0 top-9 z-40 min-w-48 rounded-md bg-white py-2 font-medium text-stone-900 shadow-lg">
                {categories.map((c) => <li key={c.id}><Link href={`/shop?category=${c.slug}`} className="block px-4 py-2 hover:bg-brand-soft hover:text-brand">{c.name}</Link></li>)}
              </ul>
            </details>
            <Link href="/shop" className="hover:underline">Shop</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <span className="ml-auto flex gap-6">
              <Link href="/shop?filter=sale" className="uppercase hover:underline">Limited sale</Link>
              <Link href="/shop?sort=best" className="hover:underline">Best sellers</Link>
              <Link href="/shop?sort=new" className="hover:underline">New arrivals</Link>
            </span>
          </div>
        </nav>
      </header>
    </>
  );
}
