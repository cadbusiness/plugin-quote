"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ConfiguratorApp, type ConfiguratorThemeOverride } from "@/components/configurator/configurator-app";
import { useShopQuoteDraft } from "@/components/storefront/shop-quote-draft";
import { formatPrice } from "@/lib/format";
import { isShopQuoteFormPhase } from "@/lib/shops/quote-draft";
import { cx, SHOP_BODY, SHOP_CONTAINER, SHOP_CTA, SHOP_HEADING } from "@/lib/shops/storefront-style";
import type { ShopProduct } from "@/lib/shops/types";
import { productPath, shopQuoteFormPath, shopQuotePath } from "@/lib/shops/urls";

export function ShopQuotePage({
  orgSlug,
  shopSlug,
  shopConfiguratorId,
  configuratorSlug,
  products,
  catalogueHref,
  shopName,
  productPrefill,
  envoyer,
  themeOverride,
}: {
  orgSlug: string;
  shopSlug: string;
  shopConfiguratorId: string | null;
  configuratorSlug: string | null;
  products: ShopProduct[];
  catalogueHref: string;
  shopName: string;
  productPrefill?: string;
  envoyer?: string;
  themeOverride: ConfiguratorThemeOverride;
}) {
  const draft = useShopQuoteDraft();
  const router = useRouter();
  const listPath = shopQuotePath(orgSlug, shopSlug);
  const showForm = Boolean(configuratorSlug) && isShopQuoteFormPhase(envoyer);
  const seededPrefill = useRef(false);

  useEffect(() => {
    if (!draft.ready || !productPrefill || seededPrefill.current) return;
    seededPrefill.current = true;
    const match =
      products.find((product) => product.id === productPrefill || product.sku === productPrefill) ?? null;
    if (match && !draft.has(match.id)) {
      draft.add({ id: match.id, qty: 1, name: match.name, sku: match.sku });
    } else if (!match && !draft.has(productPrefill)) {
      draft.add({ id: productPrefill, qty: 1 });
    }
    router.replace(showForm ? shopQuoteFormPath(orgSlug, shopSlug) : listPath);
  }, [draft, listPath, orgSlug, productPrefill, products, router, shopSlug, showForm]);

  if (showForm && configuratorSlug) {
    if (!draft.ready) {
      return <div className="flex min-h-[28rem] items-center justify-center text-sm opacity-60">Chargement…</div>;
    }
    return (
      <div className="min-h-[60vh]">
        <div className={cx(SHOP_CONTAINER, "pt-6")}>
          <Link href={listPath} className="text-sm underline-offset-2 hover:underline">
            Retour à la liste
          </Link>
        </div>
        <ConfiguratorApp
          orgSlug={orgSlug}
          shopSlug={shopSlug}
          shopConfiguratorId={shopConfiguratorId ?? undefined}
          configuratorSlug={configuratorSlug}
          productPrefill={productPrefill}
          initialCart={draft.lines}
          embedded
          themeOverride={themeOverride}
        />
      </div>
    );
  }

  if (!draft.ready) {
    return <div className="flex min-h-[20rem] items-center justify-center text-sm opacity-60">Chargement…</div>;
  }

  const rows = draft.lines.map((line) => {
    const product = products.find((item) => item.id === line.id || item.sku === line.id);
    return { line, product };
  });

  return (
    <section className={cx(SHOP_CONTAINER, "py-12 md:py-16")}>
      <h1 className={SHOP_HEADING.h1}>Votre devis</h1>
      <p className={cx(SHOP_BODY, "mt-3")}>
        {draft.count
          ? `${draft.count} référence${draft.count > 1 ? "s" : ""} dans la liste. Envoyez la demande quand le brief est prêt.`
          : "Constituez votre liste depuis le catalogue, puis envoyez la demande."}
      </p>

      {rows.length ? (
        <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {rows.map(({ line, product }) => (
            <li key={line.id} className="flex flex-wrap items-center gap-4 py-5">
              {product?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image_url} alt="" className="h-16 w-20 rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-20 rounded-lg bg-[color-mix(in_srgb,var(--shop-accent)_12%,transparent)]" />
              )}
              <div className="min-w-0 flex-1">
                {product ? (
                  <Link href={`/b/${orgSlug}/${shopSlug}${productPath(product)}`} className="font-medium hover:underline">
                    {product.name}
                  </Link>
                ) : (
                  <p className="font-medium">{line.name || "Produit"}</p>
                )}
                {product ? (
                  <p className="mt-1 text-sm" style={{ color: "var(--shop-accent)" }}>
                    {formatPrice(product.price_min, product.price_max, product.currency)}
                  </p>
                ) : null}
              </div>
              <label className="text-sm">
                Qté
                <input
                  type="number"
                  min={1}
                  value={line.qty}
                  onChange={(event) => draft.setQty(line.id, Number(event.target.value) || 1)}
                  className="ml-2 w-16 rounded-lg border border-black/10 bg-transparent px-2 py-1.5"
                />
              </label>
              <button type="button" onClick={() => draft.remove(line.id)} className="text-sm underline-offset-2 hover:underline">
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-black/15 px-6 py-10 text-sm text-[color-mix(in_srgb,var(--shop-text)_70%,var(--shop-bg))]">
          Votre liste est vide.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href={catalogueHref} className="text-sm underline-offset-2 hover:underline">
          Continuer le catalogue
        </Link>
        {configuratorSlug ? (
          <Link href={shopQuoteFormPath(orgSlug, shopSlug)} className={SHOP_CTA} style={{ background: "var(--shop-accent)" }}>
            {draft.count ? "Demander un devis" : "Demander un devis sans référence"}
          </Link>
        ) : (
          <p className="text-sm text-[color-mix(in_srgb,var(--shop-text)_65%,var(--shop-bg))]">
            {shopName} n’a pas encore relié de configurateur — la liste reste ici, sans formulaire.
          </p>
        )}
      </div>
    </section>
  );
}
