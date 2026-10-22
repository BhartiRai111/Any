import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
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
  if (!p || !p.active) notFound();
  const related = await db.product.findMany({ where: { categoryId: p.categoryId, active: true, id: { not: p.id } }, take: 4 });

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
          <p className="mt-3 text-xl">
            {p.comparePriceCents && <span className="mr-2 text-stone-400 line-through">{money(p.comparePriceCents)}</span>}
            {money(p.priceCents)}
          </p>
          <p className="mt-5 text-stone-700">{p.description}</p>
          <div className="mt-8">
            {p.stock === 0 ? <p className="stamp">Sold out</p> : <AddToCart p={p} />}
          </div>
          <ul className="mt-8 space-y-1 text-sm text-stone-600">
            <li>Ships within 3 working days</li>
            <li>Free shipping over $100</li>
            <li>Arrives damaged? We remake it.</li>
          </ul>
        </div>
      </div>
      {related.length > 0 && (
        <section>
          <h2 className="mb-6 font-serif text-2xl">More from the studio</h2>
          <div className="polaroid-grid grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
