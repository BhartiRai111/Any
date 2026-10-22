import Link from "next/link";
import { money } from "@/lib/format";
import { ProductImage } from "./product-image";
import { Stars } from "./stars";

type P = {
  slug: string;
  name: string;
  priceCents: number;
  comparePriceCents: number | null;
  tone: string;
  imageUrl: string | null;
  stock: number;
  isNew: boolean;
  colors: string[];
  category?: { name: string };
};

export function ProductCard({ p, rating }: { p: P; rating?: { avg: number; count: number } }) {
  const off = p.comparePriceCents ? Math.round((1 - p.priceCents / p.comparePriceCents) * 100) : 0;
  return (
    <Link href={`/product/${p.slug}`} className="block h-full">
      <div className="polaroid h-full">
        <div className="relative">
          <ProductImage tone={p.tone} imageUrl={p.imageUrl} alt={p.name} />
          {p.stock === 0 ? (
            <span className="absolute left-2 top-2 rounded bg-stone-900 px-2 py-0.5 text-[11px] font-semibold text-white">Sold out</span>
          ) : (
            p.isNew && <span className="absolute left-2 top-2 rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-900 shadow-sm">New</span>
          )}
          {off > 0 && <span className="absolute right-2 top-2 rounded bg-brand px-2 py-0.5 text-[11px] font-bold text-white">-{off}%</span>}
        </div>
        {p.category && <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-stone-500">{p.category.name}</p>}
        <p className="mt-1 line-clamp-2 min-h-10 text-[13px] font-semibold leading-5">{p.name}</p>
        <div className="mt-1 h-4">{rating && rating.count > 0 && <Stars value={rating.avg} count={rating.count} />}</div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className={`text-base font-bold ${off > 0 ? "text-brand" : ""}`}>
            {money(p.priceCents)}
            {p.comparePriceCents && <span className="ml-2 text-xs font-normal text-stone-400 line-through">{money(p.comparePriceCents)}</span>}
          </p>
          <span className="flex gap-1">
            {p.colors.slice(0, 3).map((c) => <span key={c} className="h-3 w-3 rounded-full border border-stone-300" style={{ background: c }} />)}
          </span>
        </div>
      </div>
    </Link>
  );
}
