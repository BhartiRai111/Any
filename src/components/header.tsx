import Link from "next/link";
import { currentUser } from "@/lib/session";
import { CartLink } from "./cart-link";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const user = await currentUser();
  return (
    <header className="sticky top-0 z-20 border-b-2 border-stone-900/20 bg-[#d7c4a3]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="font-serif text-3xl italic">
          Willow &amp; Clay
        </Link>
        <nav className="flex gap-5 text-sm lowercase">
          <Link href="/shop" className="hover:underline">shop</Link>
          <Link href="/shop?category=mugs-cups" className="hover:underline">mugs</Link>
          <Link href="/shop?category=candles" className="hover:underline">candles</Link>
          <Link href="/shop?category=planters" className="hover:underline">planters</Link>
          <Link href="/about" className="hover:underline">our story</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/orders" className="hover:underline">{user.name.split(" ")[0]}</Link>
              <form action={logout}>
                <button className="hover:underline">sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:underline">sign in</Link>
          )}
          <CartLink />
        </div>
      </div>
    </header>
  );
}
