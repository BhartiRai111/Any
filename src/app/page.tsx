import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { getRatings } from "@/lib/ratings";
import { FREE_SHIPPING_OVER } from "@/lib/shipping";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";

export const dynamic = "force-dynamic";

const perks = [
  { title: "Friendly support", text: "Write to us any day, we reply within 2 working days", icon: "M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 13v4a2 2 0 0 0 2 2h1v-6H4" },
  { title: "Secure payments", text: "UPI, cards and net banking through Razorpay", icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4" },
  { title: "Careful shipping", text: "Packed by hand and shipped within 3 working days", icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01" },
  { title: "Broken? We remake it", text: "If a piece arrives damaged, we make you a new one", icon: "M4 12a8 8 0 1 0 3-6.2M4 4v4h4" },
];

const faqs = [
  { q: "What payment methods do you accept?", a: "UPI, debit and credit cards, net banking and wallets through Razorpay, plus pay on delivery. Bank transfer is available when the studio has switched it on. See the payment options page for details." },
  { q: "How long does shipping take?", a: "We ship within 3 working days. After that delivery usually takes 2 to 8 working days depending on your PIN code. You can check your PIN on any product page." },
  { q: "Do you ship outside India?", a: "Not yet. We currently deliver within India only." },
  { q: "Can I track my order?", a: "Yes. When your order ships we email you the courier and tracking number, and you can also see them under My orders when you are signed in." },
];

const tips = [
  { tag: "Care", title: "How to look after stoneware", text: "Hand wash gently and let pieces dry fully. Avoid sudden temperature changes, like pouring boiling water into a cold mug." },
  { tag: "Candles", title: "Getting the best from a beeswax candle", text: "Trim the wick to 5 mm and let the first burn melt the whole top layer. This stops tunnelling and keeps the burn even." },
  { tag: "Plants", title: "Choosing a planter", text: "Pick a pot 2 to 4 cm wider than the root ball and make sure it has a drainage hole and saucer." },
];

export default async function Home() {
  const [featured, newest, onSale, heroes] = await Promise.all([
    db.product.findMany({ where: { featured: true, active: true }, include: { category: true }, orderBy: { id: "asc" }, take: 5 }),
    db.product.findMany({ where: { active: true }, include: { category: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.product.findFirst({ where: { active: true, comparePriceCents: { not: null } }, orderBy: { id: "asc" } }),
    db.product.findMany({ where: { featured: true, active: true }, orderBy: { id: "asc" }, take: 3 }),
  ]);
  const ratings = await getRatings([...featured, ...newest].map((p) => p.id));
  const first = heroes[0];

  return (
    <div className="space-y-14">
      {/* hero */}
      <section className="grid items-center gap-8 overflow-hidden rounded-2xl bg-stone-100 px-6 py-10 md:grid-cols-2 md:px-12">
        <div>
          <h1 className="text-4xl leading-tight sm:text-5xl">Handmade pieces for everyday life</h1>
          <p className="mt-4 max-w-md text-stone-600">Ceramics and candles made in a one-room studio, in small batches. Every piece is a little different.</p>
          <Link href="/shop" className="mt-6 inline-block rounded bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-dark">Shop now</Link>
        </div>
        <div className="grid grid-cols-3 items-end gap-3" aria-hidden={first ? undefined : true}>
          {heroes.map((h, i) => (
            <Link key={h.id} href={`/product/${h.slug}`} className={i === 1 ? "-translate-y-4" : ""} aria-label={h.name}>
              <ProductImage tone={h.tone} imageUrl={h.imageUrl} alt={h.name} className="rounded-xl shadow-md" />
            </Link>
          ))}
        </div>
      </section>

      {/* perks */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map((p) => (
          <div key={p.title} className="flex items-start gap-3">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone-800" aria-hidden="true"><path d={p.icon} /></svg>
            <div><p className="text-xs font-bold">{p.title}</p><p className="mt-0.5 text-xs text-stone-500">{p.text}</p></div>
          </div>
        ))}
      </section>

      {/* featured */}
      <section>
        <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl">Featured products</h2><Link href="/shop" className="text-xs font-semibold text-brand">View all →</Link></div>
        <div className="polaroid-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {featured.map((p) => <ProductCard key={p.id} p={p} rating={ratings.get(p.id)} />)}
        </div>
      </section>

      {/* promo banners */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex min-h-56 flex-col justify-center rounded-2xl bg-stone-100 p-8 md:col-span-2">
          <h2 className="text-3xl">Free shipping on orders over {money(FREE_SHIPPING_OVER)}</h2>
          <p className="mt-2 max-w-sm text-stone-600">Every order is packed by hand. Add a few pieces and the shipping is on us.</p>
          <Link href="/shop" className="mt-5 w-fit rounded bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Shop now</Link>
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-brand-soft p-8">
          <h2 className="text-2xl">Limited sale</h2>
          <p className="mt-2 text-stone-600">{onSale ? `Save on pieces like ${onSale.name}.` : "Special prices on selected pieces."}</p>
          <Link href="/shop?filter=sale" className="mt-5 w-fit rounded bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">See the sale</Link>
        </div>
      </section>

      {/* new */}
      <section>
        <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl">New products</h2><Link href="/shop?sort=new" className="text-xs font-semibold text-brand">View all →</Link></div>
        <div className="polaroid-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {newest.map((p) => <ProductCard key={p.id} p={p} rating={ratings.get(p.id)} />)}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl">
        <h2 className="mb-5 text-center text-2xl">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-lg bg-stone-100 px-5 py-4 open:bg-brand-soft">
              <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-semibold">
                <span className="h-3 w-3 shrink-0 rounded-full bg-brand group-open:bg-white group-open:ring-2 group-open:ring-brand" aria-hidden="true" />
                {f.q}
              </summary>
              <p className="mt-3 pl-6 text-sm text-stone-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* studio notes */}
      <section>
        <h2 className="text-2xl">From the studio</h2>
        <p className="mt-1 text-sm text-stone-500">Short notes on getting the most from what we make.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {tips.map((t) => (
            <article key={t.title} className="rounded-xl border border-stone-200 p-5">
              <span className="rounded bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">{t.tag}</span>
              <h3 className="mt-3 text-base">{t.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{t.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
