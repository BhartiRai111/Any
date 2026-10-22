import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

const tiles = [
  { slug: "women", label: "Women", tone: "linear-gradient(135deg,#f3d3c3,#c46a4a)" },
  { slug: "men", label: "Men", tone: "linear-gradient(135deg,#a8c3b6,#27403a)" },
  { slug: "shoes", label: "Shoes", tone: "linear-gradient(135deg,#d8b99a,#8b5e3c)" },
  { slug: "bags", label: "Bags", tone: "linear-gradient(135deg,#f4c7c3,#b91c1c)" },
];

export default async function Home() {
  const featured = await db.product.findMany({ where: { featured: true }, orderBy: { id: "asc" }, take: 8 });
  return (
    <div className="space-y-14">
      <section
        className="flex min-h-[26rem] flex-col items-center justify-center rounded-2xl px-6 text-center"
        style={{ background: "linear-gradient(120deg,#f6e7da,#e7c9b0 60%,#d9a98a)" }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-stone-700">New season</p>
        <h1 className="mt-3 font-serif text-5xl sm:text-6xl">The Autumn Collection</h1>
        <p className="mt-4 max-w-md text-stone-700">Warm textures and quiet colours, made to be worn on repeat.</p>
        <Link href="/shop" className="mt-8 rounded-full bg-stone-900 px-8 py-3 text-white hover:bg-stone-700">
          Shop now
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.slug} href={`/shop?category=${t.slug}`}
            className="flex aspect-[4/3] items-end rounded-xl p-4 text-lg font-medium transition hover:opacity-90"
            style={{ background: t.tone }}>
            {t.label}
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-3xl">Trending now</h2>
          <Link href="/shop" className="text-sm underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
