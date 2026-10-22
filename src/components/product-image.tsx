/* eslint-disable @next/next/no-img-element -- admin-supplied remote URLs, so next/image domain config does not apply */
export function ProductImage({ tone, imageUrl, alt, className = "" }: { tone: string; imageUrl: string | null; alt: string; className?: string }) {
  return (
    <div className={`relative aspect-square overflow-hidden ${className}`} style={{ background: tone }}>
      {imageUrl && <img src={imageUrl} alt={alt} className="h-full w-full object-cover" loading="lazy" />}
    </div>
  );
}
