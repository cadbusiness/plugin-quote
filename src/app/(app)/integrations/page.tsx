import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { ConnectStoreDialog } from "@/components/integrations/connect-store-dialog";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { SyncButton } from "@/components/integrations/sync-button";
import { PairingCard } from "@/components/integrations/pairing-card";
import { formatDate } from "@/lib/format";
import { PROVIDER_LABELS, type CatalogProvider } from "@/lib/integrations/types";
import { createClient } from "@/lib/supabase/server";

// Le premier import d'un gros catalogue est lancé depuis cette page.
export const maxDuration = 300;

const PROVIDER_TONE: Record<CatalogProvider, ChipTone> = {
  woocommerce: "violet",
  shopify: "emerald",
};

const STATUS: Record<string, { tone: ChipTone; label: string }> = {
  active: { tone: "emerald", label: "Connectée" },
  error: { tone: "rose", label: "En erreur" },
  disabled: { tone: "slate", label: "En pause" },
};

export default async function IntegrationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const [{ data: connections }, { data: funnels }] = await Promise.all([
    supabase
      .from("catalog_connections")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("configurators")
      .select("id, name")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: true }),
  ]);

  const rows = connections ?? [];

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          Le catalogue de votre boutique alimente les devis : descriptions, photos, prix, déclinaisons.
        </p>
        <ConnectStoreDialog funnels={funnels ?? []} />
      </ListToolbar>

      <PairingCard configuratorId={funnels?.[0]?.id ?? null} />

      {rows.length ? (
        <DataTable headers={["Boutique", "Canal", "Produits", "Dernière sync", "Statut", ""]}>
          {rows.map((connection) => {
            const status = STATUS[connection.status] ?? STATUS.active;
            const provider = connection.provider as CatalogProvider;
            return (
              <ClickableRow key={connection.id} href={`/integrations/${connection.id}`}>
                <td className="px-4 py-3 lg:px-6">
                  <span className="block font-medium text-slate-900">{connection.label}</span>
                  <span className="block text-xs text-slate-500">{connection.store_domain}</span>
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={PROVIDER_TONE[provider] ?? "slate"}>
                    {PROVIDER_LABELS[provider] ?? connection.provider}
                  </Chip>
                </td>
                <td className="px-4 py-3 tabular-nums lg:px-6">{connection.product_count}</td>
                <td className="px-4 py-3 text-slate-500 lg:px-6">
                  {connection.last_sync_at ? formatDate(connection.last_sync_at) : "Jamais"}
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={status.tone}>{status.label}</Chip>
                  {connection.last_error ? (
                    <span className="mt-1 block max-w-xs truncate text-xs text-rose-600">
                      {connection.last_error}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right lg:px-6">
                  <SyncButton connectionId={connection.id} />
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucune boutique connectée</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Branchez WooCommerce ou Shopify : QuoteBuilder récupère les produits, leurs descriptions,
            leurs photos et leurs prix pour les proposer automatiquement dans les devis.
          </p>
          <p className="mt-4">
            <a href="#nouveau" className="text-sm font-medium text-[#C2410C] underline">
              Connecter une boutique
            </a>
          </p>
        </div>
      )}
    </ListPanel>
  );
}
