import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { FREE_SHIPPING_OVER } from "@/lib/shipping";
import { ProductImage } from "@/components/product-image";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { Stars } from "@/components/stars";
import { DeliveryCheck } from "@/components/delivery-check";
import { ReviewForm } from "@/components/review-form";
import { currentUser } from "@/lib/session";
import { toggleWishlist } from "@/app/actions/wishlist";
import { canReview } from "@/app/actions/reviews";
import { getRatings } from "@/lib/ratings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  return { title: p?.name ?? "Product" };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!p || !p.active) notFound();
  const related = await db.product.findMany({ where: { categoryId: p.categoryId, active: true, id: { not: p.id } }, take: 4 });

  const user = await currentUser();
  const [reviews, wished, mayReview, relatedRatings] = await Promise.all([
    db.review.findMany({ where: { productId: p.id }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
    user ? db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId: p.id } } }) : null,
    user ? canReview(user.id, p.id) : false,
    getRatings(related.map((r) => r.id)),
  ]);
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  const mine = user ? reviews.find((r) => r.userId === user.id) : undefined;

  return (
    <div className="space-y-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="polaroid h-fit rotate-[1.5deg] !pb-10">
          <ProductImage tone={p.tone} imageUrl={p.imageUrl} alt={p.name} />
          <p className="mt-3 text-center text-xs">made by hand</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-stone-500">{p.category.name}</p>
          <h1 className="mt-1 font-serif text-5xl italic">{p.name}</h1>
          {reviews.length > 0 && <div className="mt-2"><Stars value={avg} count={reviews.length} /></div>}
          <p className="mt-3 text-xl">
            {p.comparePriceCents && <span className="mr-2 text-stone-400 line-through">{money(p.comparePriceCents)}</span>}
            {money(p.priceCents)}
          </p>
          <p className="mt-5 text-stone-700">{p.description}</p>
          <div className="mt-8">
            {p.stock === 0 ? <p className="stamp">Sold out</p> : <AddToCart p={p} />}
          </div>
          <form action={toggleWishlist.bind(null, p.id, p.slug)} className="mt-4">
            <button className="text-sm underline" aria-pressed={Boolean(wished)}>{wished ? "♥ saved to wishlist (remove)" : "♡ save to wishlist"}</button>
          </form>
          <DeliveryCheck />
          <ul className="mt-8 space-y-1 text-sm text-stone-600">
            <li>Ships within 3 working days</li>
            <li>Free shipping over {money(FREE_SHIPPING_OVER)}</li>
            <li>Arrives damaged? We remake it.</li>
          </ul>
        </div>
      </div>
      <section>
        <h2 className="mb-4 font-serif text-3xl italic">Reviews</h2>
        {reviews.length === 0 ? <p className="text-sm">No reviews yet.</p> : (
          <ul className="max-w-2xl space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-stone-300 pb-3 text-sm">
                <Stars value={r.rating} />
                <p className="mt-1">{r.body}</p>
                <p className="mt-1 text-xs text-stone-600">{r.user.name.split(" ")[0]} · {r.createdAt.toLocaleDateString("en-IN")}</p>
              </li>
            ))}
          </ul>
        )}
        {mayReview ? <ReviewForm productId={p.id} slug={p.slug} existing={mine} /> : (
          <p className="mt-4 text-sm text-stone-600">{user ? "You can review this piece after you order it." : "Sign in and order this piece to review it."}</p>
        )}
      </section>
      {related.length > 0 && (
        <section>
          <h2 className="mb-6 font-serif text-2xl">More from the studio</h2>
          <div className="polaroid-grid grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} rating={relatedRatings.get(r.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
