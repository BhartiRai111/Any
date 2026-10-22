import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  return { title: p?.name ?? "Product" };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!p) notFound();
  const related = await db.product.findMany({ where: { categoryId: p.categoryId, id: { not: p.id } }, take: 4 });

  return (
    <div className="space-y-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl" style={{ background: p.tone }}>
          <span className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">✦</span>
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-stone-500">{p.category.name}</p>
          <h1 className="mt-1 font-serif text-4xl">{p.name}</h1>
          <p className="mt-3 text-xl">
            {p.comparePriceCents && <span className="mr-2 text-stone-400 line-through">{money(p.comparePriceCents)}</span>}
            {money(p.priceCents)}
          </p>
          <p className="mt-5 text-stone-700">{p.description}</p>
          <div className="mt-8"><AddToCart p={p} /></div>
          <ul className="mt-8 space-y-1 text-sm text-stone-600">
            <li>Free shipping on orders over $100</li>
            <li>30-day returns</li>
          </ul>
        </div>
      </div>
      {related.length > 0 && (
        <section>
          <h2 className="mb-6 font-serif text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
