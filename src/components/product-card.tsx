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
    <Link href={`/product/${p.slug}`} className="block">
      <div className="polaroid">
        <div className="relative aspect-square" style={{ background: p.tone }}>
          {p.isNew && <span className="stamp absolute left-2 top-2 bg-[#fffaf0]/90 !px-2 !py-0.5 !text-[10px]">new</span>}
          {p.comparePriceCents && (
            <span className="stamp absolute right-2 top-2 bg-[#fffaf0]/90 !px-2 !py-0.5 !text-[10px]">sale</span>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-2 text-[13px]">
          <div>
            <p className="font-medium">{p.name}</p>
            <div className="mt-1 flex gap-1">
              {p.colors.map((c) => (
                <span key={c} className="h-3 w-3 rounded-full border border-stone-400" style={{ background: c }} />
              ))}
            </div>
          </div>
          <p className="text-right">
            {p.comparePriceCents && <span className="mr-1 text-stone-400 line-through">{money(p.comparePriceCents)}</span>}
            {money(p.priceCents)}
          </p>
        </div>
      </div>
    </Link>
  );
}
