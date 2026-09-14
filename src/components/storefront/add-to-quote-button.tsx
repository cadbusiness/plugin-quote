"use client";

import Link from "next/link";
import { useState } from "react";
import { useShopQuoteDraft } from "@/components/storefront/shop-quote-draft";
import { cx, SHOP_CTA } from "@/lib/shops/storefront-style";
import type { ShopProduct } from "@/lib/shops/types";
import { shopQuotePath } from "@/lib/shops/urls";

export function AddToQuoteButton({
  orgSlug,
  shopSlug,
  product,
  accent,
}: {
  orgSlug: string;
  shopSlug: string;
  product: ShopProduct;
  accent: string;
}) {
  const draft = useShopQuoteDraft();
  const existing = draft.line(product.id);
  const [qty, setQty] = useState(existing?.qty ?? 1);
  const [justAdded, setJustAdded] = useState(false);
  const listHref = shopQuotePath(orgSlug, shopSlug);

  function add() {
    draft.add({
      id: product.id,
      qty: Math.max(1, qty),
      name: product.name,
      sku: product.sku,
    });
    setJustAdded(true);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-[color-mix(in_srgb,var(--shop-text)_70%,var(--shop-bg))]">
          Qté
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(event) => {
              setQty(Math.max(1, Number(event.target.value) || 1));
              setJustAdded(false);
            }}
            className="ml-2 w-20 rounded-lg border border-black/10 bg-transparent px-2 py-1.5"
          />
        </label>
        <button type="button" onClick={add} className={SHOP_CTA} style={{ background: accent }}>
          {existing ? "Mettre à jour le devis" : "Ajouter au devis"}
        </button>
      </div>
      {existing || justAdded ? (
        <p className="mt-3 text-sm text-[color-mix(in_srgb,var(--shop-text)_72%,var(--shop-bg))]">
          {justAdded ? "Ajouté à votre liste." : "Déjà dans votre liste."}{" "}
          <Link href={listHref} className={cx("font-medium underline-offset-2 hover:underline")} style={{ color: accent }}>
            Voir le devis
          </Link>
        </p>
      ) : null}
    </div>
  );
}
