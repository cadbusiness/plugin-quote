"use client";

import { useRef, useState, useTransition } from "react";
import { addProductImages, removeProductImage, setProductCover } from "@/app/(app)/produits/actions";
import { GaugeBar } from "@/components/ui/gauge";
import type { ProductImage } from "@/lib/integrations/types";

export function ProductGallery({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [items, setItems] = useState(images);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cover = items[0] ?? null;

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const body = new FormData();
    body.set("id", productId);
    Array.from(files).forEach((file) => body.append("images", file));
    setError(null);
    start(async () => {
      const result = await addProductImages(body);
      if (result.error) setError(result.error);
      if (result.images) setItems(result.images);
    });
  }

  return (
    <div className="w-full max-w-[16rem]">
      <div className="overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-200">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.src} alt={cover.alt ?? ""} className="aspect-square w-full object-cover" />
        ) : (
          <div className="flex aspect-square items-center justify-center text-xs text-slate-400">Aucune photo</div>
        )}
      </div>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Miniature</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((image, index) => (
          <div key={image.src} className="relative">
            <button
              type="button"
              onClick={() =>
                start(async () => {
                  const result = await setProductCover(productId, image.src);
                  if (result.images) setItems(result.images);
                })
              }
              className={`block overflow-hidden rounded-md ring-1 ${
                index === 0 ? "ring-[#E85D04]" : "ring-slate-200 hover:ring-slate-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt="" className="h-12 w-12 object-cover" />
            </button>
            <button
              type="button"
              aria-label="Retirer"
              onClick={() =>
                start(async () => {
                  const result = await removeProductImage(productId, image.src);
                  if (result.images) setItems(result.images);
                })
              }
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-slate-500 ring-1 ring-slate-200 hover:bg-rose-50 hover:text-rose-700"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-slate-300 text-lg text-[#E85D04] hover:border-[#E85D04] hover:bg-orange-50 disabled:opacity-50"
        >
          +
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {pending ? <div className="mt-2"><GaugeBar pct={0.55} /></div> : null}
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Cliquez une vignette pour en faire la miniature. JPG, PNG ou WebP, 8 Mo max.
      </p>
    </div>
  );
}
