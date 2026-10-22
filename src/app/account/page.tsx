import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function Account() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  const card = "block border border-stone-400 bg-white p-5 hover:bg-stone-50";
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl italic">Hello, {user.name.split(" ")[0]}</h1>
      <p className="text-stone-700">{user.email}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/orders" className={card}><p className="font-medium">My orders</p><p className="text-sm text-stone-600">Track and download invoices</p></Link>
        <Link href="/account/addresses" className={card}><p className="font-medium">Addresses</p><p className="text-sm text-stone-600">Saved for faster checkout</p></Link>
        <Link href="/wishlist" className={card}><p className="font-medium">Wishlist</p><p className="text-sm text-stone-600">Pieces you saved</p></Link>
      </div>
    </div>
  );
}
