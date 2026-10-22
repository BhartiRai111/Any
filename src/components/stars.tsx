export function Stars({ value, count }: { value: number; count?: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1 text-xs" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span aria-hidden="true" className="text-[#b4653a]">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>
      {count !== undefined && <span className="text-stone-600">({count})</span>}
    </span>
  );
}
