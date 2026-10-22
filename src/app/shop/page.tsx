import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getRatings } from "@/lib/ratings";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

const sorts: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  new: { createdAt: "desc" },
  "price-asc": { priceCents: "asc" },
  "price-desc": { priceCents: "desc" },
  featured: { id: "asc" },
};

export default async function Shop({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const category = one("category");
  const q = one("q")?.trim();
  const onSale = one("filter") === "sale";
  const sortParam = one("sort");
  const best = sortParam === "best";
  const sort = sortParam && sorts[sortParam] ? sortParam : "featured";

  // Best sellers are ranked by units sold in orders that were not cancelled.
  const sold = best
    ? await db.orderItem.groupBy({ by: ["productId"], where: { order: { status: { not: "CANCELLED" } } }, _sum: { quantity: true } })
    : [];
  const soldBy = new Map(sold.map((s) => [s.productId, s._sum.quantity ?? 0]));

  const [categories, found] = await Promise.all([
    db.category.findMany({ orderBy: { id: "asc" } }),
    db.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(onSale ? { comparePriceCents: { not: null } } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
      },
      include: { category: true },
      orderBy: sorts[sort],
    }),
  ]);
  const products = best ? [...found].sort((a, b) => (soldBy.get(b.id) ?? 0) - (soldBy.get(a.id) ?? 0) || Number(b.featured) - Number(a.featured)) : found;
  const ratings = await getRatings(products.map((p) => p.id));

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { category, q, sort: sortParam, filter: one("filter"), ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };
  const title = onSale ? "Limited sale" : best ? "Best sellers" : sortParam === "new" ? "New arrivals" : categories.find((c) => c.slug === category)?.name ?? "All products";

  return (
    <div>
      <p className="text-xs text-stone-500"><Link href="/" className="hover:text-brand">Home</Link> / Shop</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl">{title} <span className="text-base font-normal text-stone-500">({products.length})</span></h1>
        <form action="/shop" className="flex flex-wrap items-center gap-2 text-sm">
          {category && <input type="hidden" name="category" value={category} />}
          {onSale && <input type="hidden" name="filter" value="sale" />}
          {q && <input type="hidden" name="q" value={q} />}
          <label className="text-stone-500" htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" defaultValue={best ? "best" : sort} className="rounded border border-stone-300 bg-white px-3 py-2">
            <option value="featured">Featured</option>
            <option value="best">Best sellers</option>
            <option value="new">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <button className="rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark">Apply</button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {[{ slug: undefined, name: "All" }, ...categories].map((c) => (
          <Link key={c.name} href={href({ category: c.slug })}
            className={`rounded-full border px-4 py-1.5 ${category === c.slug ? "border-brand bg-brand text-white" : "border-stone-300 hover:border-brand hover:text-brand"}`}>
            {c.name}
          </Link>
        ))}
        <Link href={href({ filter: onSale ? undefined : "sale" })} className={`rounded-full border px-4 py-1.5 ${onSale ? "border-brand bg-brand text-white" : "border-stone-300 hover:border-brand hover:text-brand"}`}>On sale</Link>
      </div>
      {q && <p className="mt-4 text-sm text-stone-600">Results for “{q}” · <Link href={href({ q: undefined })} className="text-brand underline">clear</Link></p>}

      {products.length === 0 ? (
        <p className="mt-12 text-stone-600">No products match.</p>
      ) : (
        <div className="polaroid-grid mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} rating={ratings.get(p.id)} />)}
        </div>
      )}
    </div>
  );
}
