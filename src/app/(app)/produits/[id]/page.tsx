import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteProduct, toggleProduct, updateProduct } from "@/app/(app)/produits/actions";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { priceModeOf } from "@/lib/catalog/product-form";
import { formatDate } from "@/lib/format";
import type { Json } from "@/lib/db/database.types";
import { createClient } from "@/lib/supabase/server";
import { ProductEditorFields } from "@/components/catalog/product-editor-fields";
import { normalizeAttributes } from "@/lib/catalog/attributes";

const SOURCES: Record<string, { label: string; tone: ChipTone }> = {
  manual: { label: "Ajouté à la main", tone: "slate" },
  csv: { label: "Import CSV", tone: "slate" },
  woocommerce: { label: "WooCommerce", tone: "violet" },
  shopify: { label: "Shopify", tone: "emerald" },
};

type StoredVariant = {
  externalId?: string;
  title?: string;
  sku?: string | null;
  price?: number | null;
  available?: boolean;
};

function asArray<T>(value: Json): T[] {
  return Array.isArray(value) ? (value as unknown as T[]) : [];
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!product) notFound();

  const connection = product.connection_id
    ? (
        await supabase
          .from("catalog_connections")
          .select("id, label, provider")
          .eq("id", product.connection_id)
          .maybeSingle()
      ).data
    : null;

  const source = SOURCES[product.source ?? "manual"] ?? SOURCES.manual;
  const synced = product.source === "woocommerce" || product.source === "shopify";
  const variants = asArray<StoredVariant>(product.variants);
  const attributes = normalizeAttributes(product.options);
  const priceMode = priceModeOf(product.price_min, product.price_max);

  const toggle = toggleProduct.bind(null, product.id, !product.is_active);
  const remove = deleteProduct.bind(null, product.id);

  return (
    <ListPanel>
      <ListToolbar>
        <div className="mr-auto flex flex-wrap items-center gap-2">
          <Link href="/produits" className="text-sm text-slate-500 hover:text-slate-900">
            Catalogue
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-900">{product.name}</span>
          <Chip tone={source.tone}>{source.label}</Chip>
          {product.is_active ? (
            <Chip tone="emerald">Actif</Chip>
          ) : (
            <Chip tone={product.archived_by_sync ? "amber" : "slate"}>
              {product.archived_by_sync ? "Retiré de la boutique" : "Inactif"}
            </Chip>
          )}
        </div>
        <form action={toggle}>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
            {product.is_active ? "Désactiver" : "Activer"}
          </button>
        </form>
      </ListToolbar>

      {synced ? (
        <p className="border-b border-violet-100 bg-violet-50/60 px-4 py-2 text-sm text-violet-900 lg:px-6">
          Produit synchronisé depuis {connection?.label ?? source.label}. Vos modifications ici seront
          écrasées à la prochaine synchronisation.{" "}
          {product.external_url ? (
            <a href={product.external_url} target="_blank" rel="noreferrer" className="underline">
              Ouvrir la fiche boutique
            </a>
          ) : null}
          {connection ? (
            <>
              {" · "}
              <Link href={`/integrations/${connection.id}`} className="underline">
                Réglages de la boutique
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      <form action={updateProduct} className="grid gap-4 border-b border-slate-100 px-4 py-6 lg:px-6">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="price_mode" value={priceMode === "quote" ? "range" : priceMode} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-slate-900">Nom</span>
            <input
              name="name"
              defaultValue={product.name}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Référence / SKU</span>
            <input
              name="sku"
              defaultValue={product.sku ?? ""}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Catégorie</span>
            <input
              name="category"
              defaultValue={product.category ?? ""}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Tags</span>
            <input
              name="tags"
              defaultValue={product.tags.join(", ")}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="text-sm">
          <span className="font-medium text-slate-900">Description</span>
          <textarea
            name="description"
            rows={6}
            defaultValue={product.description ?? ""}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-4">
          <label className="text-sm">
            <span className="font-medium text-slate-900">Prix min</span>
            <input
              name="price_min"
              type="number"
              step="0.01"
              defaultValue={product.price_min ?? ""}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Prix max</span>
            <input
              name="price_max"
              type="number"
              step="0.01"
              defaultValue={product.price_max ?? ""}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Devise</span>
            <input
              name="currency"
              defaultValue={product.currency}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-end gap-2 text-sm">
            <span className="flex w-full items-center gap-2 rounded-md px-3 py-2 ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
              <input type="checkbox" name="is_active" defaultChecked={product.is_active} />
              Proposé aux prospects
            </span>
          </label>
        </div>

        <ProductEditorFields imageUrl={product.image_url} attributes={attributes} />

        <div className="text-right">
          <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">
            Enregistrer le produit
          </button>
        </div>
      </form>

      {variants.length ? (
        <section>
          <p className="border-b border-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 lg:px-6">
            Déclinaisons importées
          </p>
          <DataTable headers={["Déclinaison", "SKU", "Prix", "Disponibilité"]}>
            {variants.map((variant, index) => (
              <tr key={variant.externalId ?? index} className="border-b border-slate-100">
                <td className="px-4 py-2 lg:px-6">{variant.title ?? "—"}</td>
                <td className="px-4 py-2 text-slate-500 lg:px-6">{variant.sku ?? "—"}</td>
                <td className="px-4 py-2 tabular-nums lg:px-6">
                  {variant.price != null ? `${variant.price} ${product.currency}` : "—"}
                </td>
                <td className="px-4 py-2 lg:px-6">
                  {variant.available === false ? (
                    <Chip tone="rose">Rupture</Chip>
                  ) : (
                    <Chip tone="emerald">Disponible</Chip>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      ) : null}

      <section className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-4 lg:px-6">
        <form action={remove}>
          <button className="rounded-md bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 ring-1 ring-rose-100">
            Supprimer du catalogue
          </button>
        </form>
        <span className="text-xs text-slate-400">
          {synced
            ? "Un produit supprimé revient à la prochaine synchronisation : préférez le désactiver."
            : "Suppression définitive."}
          {product.synced_at ? ` Dernière synchro : ${formatDate(product.synced_at)}.` : ""}
        </span>
      </section>
    </ListPanel>
  );
}
