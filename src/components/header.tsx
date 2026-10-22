import Link from "next/link";
import { currentUser } from "@/lib/session";
import { CartLink } from "./cart-link";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const user = await currentUser();
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-[0.25em]">
          MAISON
        </Link>
        <nav className="hidden gap-6 text-sm sm:flex">
          <Link href="/shop?category=women" className="hover:underline">Women</Link>
          <Link href="/shop?category=men" className="hover:underline">Men</Link>
          <Link href="/shop?category=shoes" className="hover:underline">Shoes</Link>
          <Link href="/shop?category=bags" className="hover:underline">Bags</Link>
          <Link href="/shop?sort=new" className="hover:underline">New</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/orders" className="hover:underline">{user.name.split(" ")[0]}</Link>
              <form action={logout}>
                <button className="hover:underline">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:underline">Sign in</Link>
          )}
          <CartLink />
        </div>
      </div>
    </header>
  );
}
