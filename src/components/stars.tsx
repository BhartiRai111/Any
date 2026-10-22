import { FaRegStar, FaStar } from "react-icons/fa";

export function Stars({ value, count }: { value: number; count?: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1 text-xs" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span aria-hidden="true" className="flex text-amber-500">
        {[1, 2, 3, 4, 5].map((n) => (n <= full ? <FaStar key={n} size={12} /> : <FaRegStar key={n} size={12} />))}
      </span>
      {count !== undefined && <span className="text-stone-600">({count})</span>}
    </span>
  );
}
