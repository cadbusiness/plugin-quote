import Link from "next/link";
import { redirect } from "next/navigation";
import { updateSyncPolicy } from "@/app/(app)/produits/actions";
import { CatalogTabs } from "@/components/catalog/catalog-tabs";
import { ImportProductsDialog } from "@/components/catalog/import-products-dialog";
import { Chip } from "@/components/ui/chip";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { SyncButton } from "@/components/integrations/sync-button";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { loadCatalogChrome } from "@/lib/catalog/chrome";
import { formatDate } from "@/lib/format";
import { parseSettings, PROVIDER_LABELS, type CatalogProvider } from "@/lib/integrations/types";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogImportPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const [{ data: connections }, { data: funnels }, chrome] = await Promise.all([
    supabase
      .from("catalog_connections")
      .select("id, label, provider, status, last_sync_at, last_error, product_count, settings, store_domain")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("configurators")
      .select("id, name")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: true }),
    loadCatalogChrome(supabase, ctx.organization.id),
  ]);

  return (
    <ListPanel>
      <CatalogTabs active="import" counts={{ regles: chrome.rules }} summary={chrome.summary} />
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          CSV, WooCommerce ou Shopify : vous choisissez ce qui entre, ce qui sort, et ce qui ne s’écrase pas.
        </p>
        <ImportProductsDialog funnels={funnels ?? []} />
        <Link
          href="/integrations"
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Boutiques
        </Link>
      </ListToolbar>

      <section className="border-b border-slate-100 px-4 py-5 lg:px-6">
        <p className="text-sm font-medium text-slate-900">Fichier CSV</p>
        <p className="mt-1 max-w-xl text-sm text-slate-500">
          Un bouton Importer ouvre le contrôle du fichier : modèle, colonnes reconnues, puis jauge d’écriture.
          Un SKU déjà présent met à jour la fiche.
        </p>
      </section>

      {(connections ?? []).length ? (
        <div className="divide-y divide-slate-100">
          {(connections ?? []).map((connection) => {
            const settings = parseSettings(connection.settings);
            const provider = connection.provider as CatalogProvider;
            const woo = provider === "woocommerce";
            return (
              <form key={connection.id} action={updateSyncPolicy} className="grid gap-4 px-4 py-5 lg:px-6">
                <input type="hidden" name="id" value={connection.id} />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{connection.label}</p>
                  <Chip tone="violet">{PROVIDER_LABELS[provider] ?? connection.provider}</Chip>
                  <Chip tone={connection.status === "error" ? "rose" : connection.status === "disabled" ? "slate" : "emerald"}>
                    {connection.status === "error" ? "Erreur" : connection.status === "disabled" ? "Pause" : "Connectée"}
                  </Chip>
                  <span className="text-xs text-slate-400">
                    {connection.product_count} produits
                    {connection.last_sync_at ? ` · ${formatDate(connection.last_sync_at)}` : ""}
                  </span>
                  <span className="ml-auto">
                    <SyncButton connectionId={connection.id} label="Synchroniser" />
                  </span>
                </div>
                {connection.last_error ? (
                  <p className="text-sm text-rose-700">{connection.last_error}</p>
                ) : null}
                <p className="text-xs text-slate-500">{connection.store_domain}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
                    <input type="checkbox" name="pullFromStore" defaultChecked={settings.pullFromStore} />
                    Importer depuis la boutique
                  </label>
                  <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
                    <input type="checkbox" name="protectLocalEdits" defaultChecked={settings.protectLocalEdits} />
                    Garder nos modifications
                  </label>
                  <label
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200 ${
                      woo ? "" : "opacity-60"
                    }`}
                  >
                    <input type="checkbox" name="pushToStore" defaultChecked={settings.pushToStore} disabled={!woo} />
                    {woo ? "Renvoyer vers WordPress" : "Push Shopify bientôt"}
                  </label>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="max-w-xl text-xs text-slate-500">
                    {settings.protectLocalEdits
                      ? "Une fiche retouchée ici n’est plus écrasée. Cochez aussi le verrou sur le produit pour la figer même sans édition."
                      : "La boutique reste prioritaire : la prochaine synchro réécrit les fiches liées."}
                    {woo && settings.pushToStore
                      ? " Les fiches modifiées ici partent vers WooCommerce."
                      : ""}
                  </p>
                  <button className="shrink-0 rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
                    Enregistrer
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucune boutique branchée</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Connectez WooCommerce pour importer le catalogue, puis décidez si QuoteBuilder ou WordPress a le dernier mot.
          </p>
          <Link href="/integrations" className="mt-4 inline-block text-sm font-medium text-[#C2410C] underline">
            Connecter une boutique
          </Link>
        </div>
      )}
    </ListPanel>
  );
}
