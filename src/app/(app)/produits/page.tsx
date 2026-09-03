import Link from "next/link";
import { redirect } from "next/navigation";
import { importProductsCsv } from "@/app/(app)/produits/actions";
import { CreateProductDialog } from "@/components/catalog/create-product-dialog";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListPanelFooter, ListToolbar } from "@/components/ui/list-panel";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { formatPrice } from "@/lib/format";
import type { Json } from "@/lib/db/database.types";
import { createClient } from "@/lib/supabase/server";

const SOURCES: Record<string, { label: string; tone: ChipTone }> = {
  manual: { label: "Manuel", tone: "slate" },
  csv: { label: "CSV", tone: "slate" },
  woocommerce: { label: "WooCommerce", tone: "violet" },
  shopify: { label: "Shopify", tone: "emerald" },
};

const FILTERS = [
  { value: "", label: "Tout le catalogue" },
  { value: "manual", label: "Ajoutés à la main" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "shopify", label: "Shopify" },
];

function countOf(value: Json) {
  return Array.isArray(value) ? value.length : 0;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; statut?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const filters = await searchParams;
  const search = (filters.q ?? "").trim();
  const source = filters.source ?? "";
  const statut = filters.statut ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("name");
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`);
  if (source === "manual") query = query.in("source", ["manual", "csv"]);
  else if (source) query = query.eq("source", source);
  if (statut === "actifs") query = query.eq("is_active", true);
  else if (statut === "inactifs") query = query.eq("is_active", false);

  const [{ data: products }, { data: funnels }, { count: totalCount }, { data: connections }] =
    await Promise.all([
      query,
      supabase
        .from("configurators")
        .select("id, name")
        .eq("organization_id", ctx.organization.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", ctx.organization.id),
      supabase
        .from("catalog_connections")
        .select("id, label, provider")
        .eq("organization_id", ctx.organization.id),
    ]);

  const rows = products ?? [];
  const synced = rows.filter((product) => product.source !== "manual" && product.source !== "csv").length;

  return (
    <ListPanel>
      <ListToolbar>
        <form className="mr-auto flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={search}
            placeholder="Nom, SKU, catégorie…"
            className="w-56 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          />
          <select
            name="source"
            defaultValue={source}
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            {FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <select
            name="statut"
            defaultValue={statut}
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="">Actifs et inactifs</option>
            <option value="actifs">Actifs</option>
            <option value="inactifs">Inactifs</option>
          </select>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Filtrer</button>
        </form>

        <form action={importProductsCsv} className="flex items-center gap-2">
          <input type="hidden" name="configurator_id" value={funnels?.[0]?.id ?? ""} />
          <input type="file" name="file" accept=".csv,text/csv" className="w-44 text-xs" />
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">CSV</button>
        </form>

        <Link href="/produits/regles" className="text-sm text-slate-600 underline">
          Règles Si/Alors
        </Link>
        <CreateProductDialog funnels={funnels ?? []} />
      </ListToolbar>

      {rows.length ? (
        <DataTable headers={["", "Produit", "Origine", "Catégorie", "Prix", "Statut"]}>
          {rows.map((product) => {
            const origin = SOURCES[product.source ?? "manual"] ?? SOURCES.manual;
            const variants = countOf(product.variants);
            return (
              <ClickableRow key={product.id} href={`/produits/${product.id}`}>
                <td className="py-2 pl-4 pr-0 lg:pl-6">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-[9px] text-slate-400">
                      —
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 lg:px-6">
                  <span className="block font-medium text-slate-900">{product.name}</span>
                  <span className="block text-xs text-slate-500">
                    {product.sku ? `SKU ${product.sku}` : "Sans SKU"}
                    {variants ? ` · ${variants} déclinaisons` : ""}
                  </span>
                </td>
                <td className="px-4 py-2 lg:px-6">
                  <Chip tone={origin.tone}>{origin.label}</Chip>
                </td>
                <td className="px-4 py-2 text-slate-600 lg:px-6">{product.category ?? "—"}</td>
                <td className="px-4 py-2 tabular-nums text-slate-900 lg:px-6">
                  {formatPrice(product.price_min, product.price_max)}
                </td>
                <td className="px-4 py-2 lg:px-6">
                  {product.is_active ? (
                    <Chip tone="emerald">Actif</Chip>
                  ) : product.archived_by_sync ? (
                    <Chip tone="amber">Retiré de la boutique</Chip>
                  ) : (
                    <Chip tone="slate">Inactif</Chip>
                  )}
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">
            {totalCount ? "Aucun produit avec ces filtres" : "Votre catalogue est vide"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {totalCount
              ? "Changez la recherche ou l’origine pour retrouver vos produits."
              : "Ajoutez vos produits à la main, importez un CSV, ou branchez WooCommerce / Shopify pour récupérer descriptions, photos et prix automatiquement."}
          </p>
          {!totalCount ? (
            <p className="mt-4 flex items-center justify-center gap-4">
              <a href="#nouveau" className="text-sm font-medium text-[#C2410C] underline">
                Ajouter un produit
              </a>
              <Link href="/integrations" className="text-sm text-slate-600 underline">
                Connecter une boutique
              </Link>
            </p>
          ) : null}
        </div>
      )}

      <ListPanelFooter>
        {rows.length} produit{rows.length > 1 ? "s" : ""} affiché{rows.length > 1 ? "s" : ""} sur{" "}
        {totalCount ?? 0} · {synced} synchronisé{synced > 1 ? "s" : ""} depuis{" "}
        {connections?.length ?? 0} boutique{(connections?.length ?? 0) > 1 ? "s" : ""}
      </ListPanelFooter>
    </ListPanel>
  );
}
