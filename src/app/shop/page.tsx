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
  const sort = one("sort") && sorts[one("sort")!] ? one("sort")! : "featured";

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { id: "asc" } }),
    db.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: sorts[sort],
    }),
  ]);

  const ratings = await getRatings(products.map((p) => p.id));

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { category, q, sort: one("sort"), ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div>
      <h1 className="font-serif text-5xl italic">{categories.find((c) => c.slug === category)?.name ?? "All pieces"}</h1>

      <form action="/shop" className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        {category && <input type="hidden" name="category" value={category} />}
        <input name="q" defaultValue={q} placeholder="Search products…" aria-label="Search products"
          className="w-56 rounded-sm border border-stone-300 px-4 py-2" />
        <select name="sort" defaultValue={sort} aria-label="Sort" className="rounded-sm border border-stone-300 px-4 py-2">
          <option value="featured">Featured</option>
          <option value="new">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <button className="rounded-sm bg-stone-900 px-5 py-2 text-white">Apply</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {[{ slug: undefined, name: "All" }, ...categories].map((c) => (
          <Link key={c.name} href={href({ category: c.slug })}
            className={`rounded-sm border px-4 py-1.5 ${category === c.slug ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 hover:bg-stone-100"}`}>
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-stone-600">No products match your search.</p>
      ) : (
        <div className="mt-8 polaroid-grid grid grid-cols-2 gap-5 md:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} p={p} rating={ratings.get(p.id)} />)}
        </div>
      )}
    </div>
  );
}
