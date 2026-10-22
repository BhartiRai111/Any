import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { ProductCard } from "@/components/product-card";
import { getRatings } from "@/lib/ratings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wishlist" };

export default async function Wishlist() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/wishlist");
  const rows = await db.wishlistItem.findMany({ where: { userId: user.id, product: { active: true } }, include: { product: { include: { category: true } } }, orderBy: { createdAt: "desc" } });
  const ratings = await getRatings(rows.map((r) => r.productId));
  return (
    <div>
      <h1 className="font-serif text-5xl italic">Wishlist</h1>
      {rows.length === 0 ? (
        <p className="mt-6">Nothing saved yet. <Link href="/shop" className="underline">Browse the shop</Link>.</p>
      ) : (
        <div className="polaroid-grid mt-8 grid grid-cols-2 gap-5 md:grid-cols-3">
          {rows.map((r) => <ProductCard key={r.productId} p={r.product} rating={ratings.get(r.productId)} />)}
        </div>
      )}
    </div>
  );
}
