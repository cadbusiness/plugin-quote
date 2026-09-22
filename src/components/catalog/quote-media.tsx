"use client";

import { useState } from "react";
import { productCover } from "@/lib/catalog/media";
import type { ProductMediaRole } from "@/lib/catalog/media-roles";
import type { ProductImage } from "@/lib/wizard/types";
import { ProductMedia } from "@/components/catalog/product-tile";

const ROLE_LABEL: Record<ProductMediaRole, string> = {
  product: "Produit",
  plan: "Plan",
  usage: "Usage",
};

function groupMedia(images: ProductImage[]) {
  const groups: Record<ProductMediaRole, ProductImage[]> = { product: [], plan: [], usage: [] };
  for (const image of images) {
    const role = image.role ?? "product";
    groups[role].push(image);
  }
  return groups;
}

export function quoteCoverSrc(product: { imageUrl: string | null; images: ProductImage[] }) {
  return productCover(product.images, product.imageUrl);
}

export function QuoteProductMedia({
  name,
  images,
  imageUrl,
  compact = false,
}: {
  name: string;
  images: ProductImage[];
  imageUrl: string | null;
  compact?: boolean;
}) {
  const gallery = images.length ? images : imageUrl ? [{ src: imageUrl, alt: null }] : [];
  const groups = groupMedia(gallery);
  const main = groups.product.length ? groups.product : groups.plan.length ? groups.plan : groups.usage;
  const [current, setCurrent] = useState(main[0]?.src ?? null);
  const extras = (["plan", "usage"] as const).filter((role) => groups[role].length && groups[role] !== main);

  if (!current) return <div className={compact ? "h-20 w-20 rounded-lg bg-slate-100" : "aspect-[4/3] rounded-lg bg-slate-100"} />;

  return (
    <div>
      <ProductMedia
        src={current}
        alt={name}
        className={compact ? "h-20 w-20 rounded-lg p-1 ring-1 ring-slate-200" : "aspect-[4/3] rounded-lg p-3 ring-1 ring-slate-200"}
      />
      {main.length > 1 ? (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {main.slice(0, compact ? 4 : 8).map((image) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setCurrent(image.src)}
              className={`shrink-0 overflow-hidden rounded-md ring-1 ${current === image.src ? "ring-[#E85D04]" : "ring-slate-200"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt ?? ""} className="h-12 w-12 bg-slate-50 object-contain" />
            </button>
          ))}
        </div>
      ) : null}
      {extras.map((role) => (
        <div key={role} className="mt-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{ROLE_LABEL[role]}</p>
          <div className="mt-1 flex gap-2 overflow-x-auto">
            {groups[role].slice(0, 4).map((image) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setCurrent(image.src)}
                className={`shrink-0 overflow-hidden rounded-md ring-1 ${current === image.src ? "ring-[#E85D04]" : "ring-slate-200"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt ?? ROLE_LABEL[role]} className="h-12 w-12 bg-slate-50 object-contain" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
