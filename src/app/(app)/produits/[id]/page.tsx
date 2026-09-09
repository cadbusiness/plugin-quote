import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteProduct, toggleProduct, updateProduct } from "@/app/(app)/produits/actions";
import { CurrencyFields } from "@/components/catalog/currency-fields";
import { ProductEditorFields } from "@/components/catalog/product-editor-fields";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { RichTextEditor } from "@/components/catalog/rich-text-editor";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { normalizeAttributes } from "@/lib/catalog/attributes";
import { parseGallery } from "@/lib/catalog/media";
import { priceModeOf } from "@/lib/catalog/product-form";
import type { Json } from "@/lib/db/database.types";
import { formatDate } from "@/lib/format";
import { parseSettings } from "@/lib/integrations/types";
import { createClient } from "@/lib/supabase/server";

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
    .select(
      "id, name, sku, category, tags, description, price_min, price_max, currency, is_active, source, connection_id, external_url, archived_by_sync, synced_at, sync_lock, image_url, images, options, variants",
    )
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!product) notFound();

  const connection = product.connection_id
    ? (
        await supabase
          .from("catalog_connections")
          .select("id, label, provider, settings")
          .eq("id", product.connection_id)
          .maybeSingle()
      ).data
    : null;

  const source = SOURCES[product.source ?? "manual"] ?? SOURCES.manual;
  const synced = product.source === "woocommerce" || product.source === "shopify";
  const variants = asArray<StoredVariant>(product.variants);
  const attributes = normalizeAttributes(product.options);
  const priceMode = priceModeOf(product.price_min, product.price_max);
  const gallery = parseGallery(product.images, product.image_url);
  const policy = connection ? parseSettings(connection.settings) : null;

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
          {policy?.protectLocalEdits || product.sync_lock
            ? `Fiche reliée à ${connection?.label ?? source.label}. Vos modifications ici sont conservées à la prochaine synchro.`
            : `Produit synchronisé depuis ${connection?.label ?? source.label}. Sans verrou, la boutique peut écraser cette fiche.`}
          {policy?.pushToStore ? " Enregistrer peut aussi mettre à jour WordPress." : ""}{" "}
          {product.external_url ? (
            <a href={product.external_url} target="_blank" rel="noreferrer" className="underline">
              Fiche boutique
            </a>
          ) : null}
          {connection ? (
            <>
              {" · "}
              <Link href="/produits/import" className="underline">
                Réglages d’importation
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      <form action={updateProduct} className="border-b border-slate-100">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="price_mode" value={priceMode === "quote" ? "range" : priceMode} />

        <div className="grid gap-6 px-4 py-5 lg:grid-cols-[16rem_minmax(0,32rem)] lg:px-6">
          <ProductGallery productId={product.id} images={gallery} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
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
            <label className="text-sm sm:col-span-2">
              <span className="font-medium text-slate-900">Tags</span>
              <input
                name="tags"
                defaultValue={product.tags.join(", ")}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="sm:col-span-2">
              <CurrencyFields
                currency={product.currency}
                priceMin={product.price_min}
                priceMax={product.price_max}
              />
            </div>

            <label className="flex items-center gap-2 rounded-md px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
              <input type="checkbox" name="is_active" defaultChecked={product.is_active} />
              Proposé aux prospects
            </label>
            {synced ? (
              <label className="flex items-center gap-2 rounded-md px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
                <input type="checkbox" name="sync_lock" defaultChecked={product.sync_lock} />
                Ne pas écraser à la synchro
              </label>
            ) : (
              <input type="hidden" name="sync_lock" value={product.sync_lock ? "on" : ""} />
            )}
          </div>
        </div>

        <div className="max-w-3xl px-4 py-4 lg:px-6">
          <span className="text-sm font-medium text-slate-900">Description</span>
          <div className="mt-1">
            <RichTextEditor name="description" defaultValue={product.description} productId={product.id} />
          </div>
        </div>

        <div className="px-4 py-4 lg:px-6">
          <ProductEditorFields attributes={attributes} />
        </div>

        <div className="px-4 py-4 text-right lg:px-6">
          <button className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
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
                <td className="px-4 py-2 lg:px-6">{variant.title ?? "-"}</td>
                <td className="px-4 py-2 text-slate-500 lg:px-6">{variant.sku ?? "-"}</td>
                <td className="px-4 py-2 tabular-nums lg:px-6">
                  {variant.price != null ? `${variant.price} ${product.currency}` : "-"}
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
            ? "Un produit verrouillé reste même s’il disparaît de la boutique."
            : "Suppression définitive."}
          {product.synced_at ? ` Dernière synchro : ${formatDate(product.synced_at)}.` : ""}
        </span>
      </section>
    </ListPanel>
  );
}
