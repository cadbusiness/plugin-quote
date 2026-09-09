"use client";

import { useMemo, useState } from "react";
import { ProductHtml } from "@/components/catalog/product-html";
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
  error,
  onChange,
  onContinue,
}: {
  products: Product[];
  customization: Customization;
  accent: string;
  error?: string;
  onChange: (customization: Customization) => void;
  onContinue: () => void;
}) {
  const groups = useMemo(() => groupProductsByCategory(products), [products]);
  const [view, setView] = useState<View>(() =>
    groups.length <= 1 ? { name: "products", category: groups[0]?.key ?? "Autres" } : { name: "categories" },
  );
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const count = quoteLineCount(customization);
  const activeGroup = groups.find((group) => group.key === (view.name === "categories" ? "" : view.category));
  const listed = view.name === "categories" ? [] : (activeGroup?.products ?? products);
  const product =
    view.name === "product" ? (listed.find((item) => item.id === view.productId) ?? products.find((item) => item.id === view.productId)) : null;

  function openProduct(next: Product, category: string) {
    setQty(customization.quantities[next.id] || 1);
    setOptions(customization.options[next.id] ?? {});
    setAdded((customization.quantities[next.id] ?? 0) > 0);
    setView({ name: "product", category, productId: next.id });
  }

  function addProduct(item: Product) {
    const quantity = Math.max(1, qty);
    onChange({
      ...customization,
      quantities: { ...customization.quantities, [item.id]: quantity },
      options: {
        ...customization.options,
        [item.id]: options,
      },
    });
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
          className="mb-5 text-sm text-slate-500 hover:text-slate-900"
        >
          {view.name === "product" ? "Retour aux produits" : "Toutes les catégories"}
        </button>
      ) : null}

      {view.name === "categories" ? (
        groups.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const cover = group.products.find((item) => item.imageUrl)?.imageUrl;
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setView({ name: "products", category: group.key })}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="mb-3 h-28 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="mb-3 h-28 rounded-lg bg-slate-100" />
                  )}
                  <p className="font-medium text-slate-900">{group.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {group.products.length} produit{group.products.length > 1 ? "s" : ""}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucun produit publié sur ce catalogue pour l’instant.</p>
        )
      ) : null}

      {view.name === "products" ? (
        listed.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listed.map((item) => {
              const inQuote = (customization.quantities[item.id] ?? 0) > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openProduct(item, view.category)}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="mb-3 h-36 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="mb-3 h-36 rounded-lg bg-slate-100" />
                  )}
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{formatPrice(item.priceMin, item.priceMax, item.currency)}</p>
                  {inQuote ? <p className="mt-2 text-xs font-medium text-amber-700">Dans le devis</p> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucun produit dans cette catégorie.</p>
        )
      ) : null}

      {view.name === "product" && product ? (
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
            <ProductShot product={product} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{view.category}</p>
              <h2 className="mt-1 text-2xl font-semibold">{product.name}</h2>
              <p className="mt-2 text-sm font-medium">{formatPrice(product.priceMin, product.priceMax, product.currency)}</p>
              {product.description ? (
                <ProductHtml html={product.description} className="mt-3" />
              ) : null}
              {product.options.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {product.options.map((opt) => (
                    <label key={opt.key} className="text-sm">
                      <span className="mb-1 block text-slate-600">{opt.label}</span>
                      <select
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                        value={options[opt.key] ?? ""}
                        onChange={(event) => setOptions((current) => ({ ...current, [opt.key]: event.target.value }))}
                      >
                        <option value="">Standard</option>
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
                <label className="text-sm">
                  Qté
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(event) => setQty(Number(event.target.value) || 1)}
                    className="ml-2 w-20 rounded-lg border border-slate-200 px-2 py-1.5"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => addProduct(product)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-white"
                  style={{ background: accent }}
                >
                  {added ? "Mettre à jour le devis" : "Ajouter au devis"}
                </button>
              </div>
              {added ? <p className="mt-3 text-sm text-emerald-700">Ajouté au devis.</p> : null}
            </div>
          </div>
        </article>
      ) : null}

      <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-600">
          {count ? (
            <>
              <span className="font-medium text-slate-900">{count}</span> article{count > 1 ? "s" : ""} au devis
            </>
          ) : (
            "Ajoutez des produits, puis envoyez une demande globale."
          )}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Voir le devis
        </button>
      </div>
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
    return <p className="text-sm text-slate-500">Les rayons s’affichent une fois le catalogue renseigné.</p>;
  }
  if (groups.length > 1) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.slice(0, 4).map((group) => (
          <div key={group.key} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-900">{group.label}</p>
            <p className="mt-1 text-xs text-slate-500">{group.products.length} produit{group.products.length > 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.slice(0, 6).map((product) => (
        <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-3">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="mb-2 h-20 w-full rounded-md object-cover" />
          ) : (
            <div className="mb-2 h-20 rounded-md bg-slate-100" />
          )}
          <p className="text-sm font-medium text-slate-900">{product.name}</p>
          <p className="mt-1 text-xs text-slate-500">{formatPrice(product.priceMin, product.priceMax)}</p>
        </div>
      ))}
    </div>
  );
}

function ProductShot({ product }: { product: Product }) {
  const gallery = product.images.length ? product.images : product.imageUrl ? [{ src: product.imageUrl, alt: null }] : [];
  const [current, setCurrent] = useState(gallery[0]?.src ?? null);
  return (
    <div>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt={product.name} className="h-56 w-full rounded-lg object-cover ring-1 ring-slate-200" />
      ) : (
        <div className="h-56 rounded-lg bg-slate-100" />
      )}
      {gallery.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.slice(0, 8).map((image) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setCurrent(image.src)}
              className={`shrink-0 overflow-hidden rounded-md ring-1 ${
                current === image.src ? "ring-[#E85D04]" : "ring-slate-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt ?? ""} className="h-14 w-14 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
