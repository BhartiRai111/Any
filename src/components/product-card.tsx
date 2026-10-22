import Link from "next/link";
import { money } from "@/lib/format";

type P = {
  slug: string;
  name: string;
  priceCents: number;
  comparePriceCents: number | null;
  tone: string;
  isNew: boolean;
  colors: string[];
};

export function ProductCard({ p }: { p: P }) {
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg" style={{ background: p.tone }}>
        <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-30 transition group-hover:scale-110">
          ✦
        </span>
        {p.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-0.5 text-xs font-medium">New</span>
        )}
        {p.comparePriceCents && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-medium text-white">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2 text-sm">
        <div>
          <p className="font-medium">{p.name}</p>
          <div className="mt-1 flex gap-1">
            {p.colors.map((c) => (
              <span key={c} className="h-3 w-3 rounded-full border border-stone-300" style={{ background: c }} />
            ))}
          </div>
        </div>
        <p className="text-right">
          {p.comparePriceCents && (
            <span className="mr-1 text-stone-400 line-through">{money(p.comparePriceCents)}</span>
          )}
          {money(p.priceCents)}
        </p>
      </div>
    </Link>
  );
}
