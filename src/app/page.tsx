import Link from "next/link";
import { db } from "@/lib/db";
import { ProductImage } from "@/components/product-image";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, hero] = await Promise.all([
    db.product.findMany({ where: { featured: true, active: true }, orderBy: { id: "asc" }, take: 6 }),
    db.product.findFirst({ where: { featured: true, active: true }, orderBy: { id: "asc" } }),
  ]);
  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 py-6 md:grid-cols-2">
        <div>
          <h1 className="font-serif text-5xl leading-[0.95] sm:text-7xl">Small batches, shaped by hand.</h1>
          <p className="mt-4 max-w-md text-stone-700">
            Ceramics and candles made in a one-room studio. Each piece is a little different.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Link href="/shop" className="bg-stone-900 px-6 py-3 text-white hover:bg-stone-700">shop everything</Link>
            <span className="stamp">Ships in 3 days</span>
          </div>
        </div>
        <div className="polaroid mx-auto w-full max-w-sm rotate-[2.5deg] !pb-10">
          <ProductImage tone={hero?.tone ?? "linear-gradient(135deg,#b4653a,#e4b184)"} imageUrl={hero?.imageUrl ?? null} alt={hero?.name ?? "Handmade ceramics"} />
          <p className="mt-3 text-center text-xs">made by hand</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-3xl italic">Fresh from the kiln</h2>
        <div className="polaroid-grid grid grid-cols-2 gap-5 md:grid-cols-3">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <Link href="/shop" className="mt-6 inline-block underline">see all pieces</Link>
      </section>
    </div>
  );
}
