import { formatPrice } from "@/lib/format";

export function ProductMedia({
  src,
  alt = "",
  className = "",
}: {
  src: string | null;
  alt?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center bg-slate-50 ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
      ) : (
        <div className="h-full w-full bg-slate-100" />
      )}
    </div>
  );
}

export function ProductTile({
  name,
  description,
  imageUrl,
  priceMin,
  priceMax,
  currency,
  badge,
}: {
  name: string;
  description?: string | null;
  imageUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency?: string | null;
  badge?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left">
      <ProductMedia src={imageUrl} alt="" className="aspect-[4/3] p-2" />
      <div className="min-w-0 space-y-1 px-2.5 py-2">
        {badge ? (
          <span className="inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-800">
            {badge}
          </span>
        ) : null}
        <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-900">{name}</p>
        {description ? <p className="line-clamp-2 text-[11px] leading-snug text-slate-500">{description}</p> : null}
        <p className="text-xs font-medium text-slate-600">{formatPrice(priceMin, priceMax, currency)}</p>
      </div>
    </div>
  );
}
