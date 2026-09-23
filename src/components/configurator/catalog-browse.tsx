"use client";

import { useMemo, useState } from "react";
import { ProductHtml } from "@/components/catalog/product-html";
import { quoteCoverSrc, QuoteProductMedia } from "@/components/catalog/quote-media";
import { ProductSheetLinks } from "@/components/catalog/product-sheet";
import { SpecTable } from "@/components/catalog/spec-table";
import { ProductMedia, ProductTile } from "@/components/catalog/product-tile";
import { catalogAxes, quoteSelectionForProduct, resolveCatalogVariant } from "@/lib/catalog/variant-matrix";
import { formatPrice } from "@/lib/format";
import { groupProductsByCategory } from "@/lib/catalog/group";
import { quoteLineCount } from "@/lib/funnels/kind";
import type { Customization, Product } from "@/lib/wizard/types";

type View =
  | { name: "categories" }
  | { name: "products"; category: string }
  | { name: "product"; category: string; productId: string };

export function CatalogBrowse({
  products,
  customization,
  accent,
  themed,
  error,
  onChange,
  onContinue,
  hideContinue,
}: {
  products: Product[];
  customization: Customization;
  accent: string;
  themed?: boolean;
  error?: string;
  onChange: (customization: Customization) => void;
  onContinue?: () => void;
  hideContinue?: boolean;
}) {
  const groups = useMemo(() => groupProductsByCategory(products), [products]);
  const [view, setView] = useState<View>(() =>
    groups.length <= 1 ? { name: "products", category: groups[0]?.key ?? "Autres" } : { name: "categories" },
  );
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [comboError, setComboError] = useState("");

  const count = quoteLineCount(customization);
  const activeGroup = groups.find((group) => group.key === (view.name === "categories" ? "" : view.category));
  const listed = view.name === "categories" ? [] : (activeGroup?.products ?? products);
  const product =
    view.name === "product" ? (listed.find((item) => item.id === view.productId) ?? products.find((item) => item.id === view.productId)) : null;
  const axes = product ? catalogAxes({ options: product.options, variants: product.variants }) : [];
  const resolved = product && axes.length ? resolveCatalogVariant(product.variants ?? [], axes, options) : null;

  function openProduct(next: Product, category: string) {
    setQty(customization.quantities[next.id] || 1);
    setOptions(customization.options[next.id] ?? {});
    setAdded((customization.quantities[next.id] ?? 0) > 0);
    setComboError("");
    setView({ name: "product", category, productId: next.id });
  }

  function addProduct(item: Product) {
    const quantity = Math.max(1, qty);
    const axes = catalogAxes({ options: item.options, variants: item.variants });
    const line = quoteSelectionForProduct(item, options);
    if (axes.length && !line.options.woo_variation_id) {
      setComboError("Cette combinaison n'existe pas.");
      setAdded(false);
      return;
    }
    onChange({
      ...customization,
      quantities: { ...customization.quantities, [item.id]: quantity },
      options: {
        ...customization.options,
        [item.id]: line.options,
      },
    });
    setComboError("");
    setAdded(true);
  }

  return (
    <div className="mt-8">
      {view.name === "product" || (view.name === "products" && groups.length > 1) ? (
        <button
          type="button"
          onClick={() =>
            view.name === "product"
              ? setView({ name: "products", category: view.category })
              : setView({ name: "categories" })
          }
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-mk-faint transition hover:text-mk-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {view.name === "product" ? "Retour aux produits" : "Toutes les catégories"}
        </button>
      ) : null}

      {view.name === "categories" ? (
        groups.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const cover = group.products.map((item) => quoteCoverSrc(item)).find(Boolean) ?? null;
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setView({ name: "products", category: group.key })}
                  className="rounded-2xl border border-mk-border bg-white p-4 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-mk-ink/15 hover:shadow-md"
                >
                  {cover ? (
                    <ProductMedia src={cover} className="mb-3 aspect-[4/3] rounded-xl p-2" />
                  ) : (
                    <div className="mb-3 aspect-[4/3] rounded-xl bg-mk-bg" />
                  )}
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-mk-ink">{group.label}</p>
                  <p className="mt-1 text-sm text-mk-faint">
                    {group.products.length} produit{group.products.length > 1 ? "s" : ""}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-mk-faint">Aucun produit publié sur ce catalogue pour l’instant.</p>
        )
      ) : null}

      {view.name === "products" ? (
        listed.length ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {listed.map((item) => {
              const inQuote = (customization.quantities[item.id] ?? 0) > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openProduct(item, view.category)}
                  className="rounded-2xl text-left transition-all duration-150 hover:-translate-y-0.5"
                >
                  <ProductTile
                    name={item.name}
                    imageUrl={quoteCoverSrc(item)}
                    priceMin={item.priceMin}
                    priceMax={item.priceMax}
                    currency={item.currency}
                    specs={item.specs}
                    badge={inQuote ? "Dans le devis" : undefined}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-mk-faint">Aucun produit dans cette catégorie.</p>
        )
      ) : null}

      {view.name === "product" && product ? (
        <article className="rounded-2xl border border-mk-border bg-white p-5 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
            <QuoteProductMedia name={product.name} images={product.images} imageUrl={product.imageUrl} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mk-faint">{view.category}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-mk-ink">{product.name}</h2>
              <p className="mt-2 text-sm font-semibold text-mk-ink">
                {formatPrice(resolved?.price ?? product.priceMin, resolved?.price ?? product.priceMax, product.currency)}
              </p>
              {resolved?.sku ? <p className="mt-1 text-sm text-mk-faint">SKU {resolved.sku}</p> : null}
              <SpecTable specs={product.specs} />
              <ProductSheetLinks sheet={product.sheet} />
              {product.description ? (
                <ProductHtml html={product.description} className="mt-3" />
              ) : null}
              {(axes.length ? axes : product.options).length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(axes.length
                    ? [
                        ...axes.map((axis) => ({ key: axis.key, label: axis.name, values: axis.options })),
                        ...product.options.filter((option) => !axes.some((axis) => axis.key === option.key)),
                      ]
                    : product.options
                  ).map((opt) => (
                    <label key={opt.key} className="text-sm">
                      <span className="mb-1 block text-mk-faint">{opt.label}</span>
                      <select
                        className="w-full rounded-xl border border-mk-border px-2.5 py-2 text-mk-ink outline-none focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
                        value={options[opt.key] ?? ""}
                        onChange={(event) => {
                          setComboError("");
                          setAdded(false);
                          setOptions((current) => ({ ...current, [opt.key]: event.target.value }));
                        }}
                      >
                        <option value="">{axes.some((axis) => axis.key === opt.key) ? "Choisir" : "Standard"}</option>
                        {opt.values.map((value) => (
                          <option key={value.value} value={value.value}>
                            {value.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <label className="text-sm text-mk-faint">
                  Qté
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(event) => setQty(Number(event.target.value) || 1)}
                    className="ml-2 w-20 rounded-xl border border-mk-border px-2.5 py-2 text-mk-ink outline-none focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => addProduct(product)}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  style={{ background: accent }}
                >
                  {added ? "Mettre à jour le devis" : "Ajouter au devis"}
                </button>
              </div>
              {comboError ? <p className="mt-3 text-sm text-red-600">{comboError}</p> : null}
              {added ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Ajouté au devis.
                </p>
              ) : null}
            </div>
          </div>
        </article>
      ) : null}

      {hideContinue ? (
        <p className="mt-6 text-sm text-mk-faint">
          {count ? (
            <>
              <span className="font-semibold text-mk-ink">{count}</span> article{count > 1 ? "s" : ""} dans la demande
              (facultatif).
            </>
          ) : (
            "Ajoutez des produits si besoin — ce n’est pas obligatoire."
          )}
        </p>
      ) : (
        <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-between gap-3 rounded-2xl border border-mk-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm text-mk-faint">
            {count ? (
              <>
                <span className="font-semibold text-mk-ink">{count}</span> article{count > 1 ? "s" : ""} au devis
              </>
            ) : (
              "Ajoutez des produits, puis envoyez une demande globale."
            )}
          </p>
          <button
            type="button"
            onClick={onContinue}
            className={
              themed
                ? "rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                : "rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-accent-hover"
            }
            style={themed ? { background: accent } : undefined}
          >
            Voir le devis
          </button>
        </div>
      )}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function CatalogBrowsePreview({
  products,
}: {
  products: { id: string; name: string; imageUrl: string | null; priceMin: number | null; priceMax: number | null; category?: string | null }[];
}) {
  const groups = groupProductsByCategory(products);
  if (!products.length) {
    return <p className="text-sm text-mk-faint">Les rayons s’affichent une fois le catalogue renseigné.</p>;
  }
  if (groups.length > 1) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.slice(0, 4).map((group) => (
          <div key={group.key} className="rounded-2xl border border-mk-border bg-white p-3">
            <p className="text-sm font-medium text-mk-ink">{group.label}</p>
            <p className="mt-1 text-xs text-mk-faint">{group.products.length} produit{group.products.length > 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {products.slice(0, 6).map((product) => (
        <ProductTile
          key={product.id}
          name={product.name}
          imageUrl={product.imageUrl}
          priceMin={product.priceMin}
          priceMax={product.priceMax}
        />
      ))}
    </div>
  );
}

