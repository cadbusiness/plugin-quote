import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { ConnectStoreDialog } from "@/components/integrations/connect-store-dialog";
import { CreateShopDialog } from "@/components/shops/create-shop-dialog";
import { CreateShopButton } from "@/components/shops/create-shop-button";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { SyncButton } from "@/components/integrations/sync-button";
import { PairingCard } from "@/components/integrations/pairing-card";
import { formatDate } from "@/lib/format";
import { parseOrgFamily } from "@/lib/funnels/families";
import { wordpressPluginRelease } from "@/lib/integrations/plugin-release";
import { PROVIDER_LABELS, type CatalogProvider } from "@/lib/integrations/types";
import { shopBasePath } from "@/lib/shops/urls";
import { createClient } from "@/lib/supabase/server";

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

const SHOP_STATUS: Record<string, { tone: ChipTone; label: string }> = {
  draft: { tone: "amber", label: "Brouillon" },
  published: { tone: "emerald", label: "En ligne" },
  archived: { tone: "slate", label: "Archivée" },
};

export default async function IntegrationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const [{ data: shops }, { data: connections }, { data: funnels }] = await Promise.all([
    supabase.from("shops").select("*").eq("organization_id", ctx.organization.id).order("created_at", { ascending: false }),
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

  const native = shops ?? [];
  const rows = connections ?? [];
  const pluginVersion = wordpressPluginRelease().version;
  const family = parseOrgFamily(ctx.organization.branding);
  const funnelIds = native.map((shop) => shop.configurator_id).filter(Boolean) as string[];
  const { data: productRows } =
    funnelIds.length > 0
      ? await supabase
          .from("products")
          .select("configurator_id")
          .eq("organization_id", ctx.organization.id)
          .eq("is_active", true)
          .in("configurator_id", funnelIds)
      : { data: [] as { configurator_id: string }[] };
  const productCount = new Map<string, number>();
  for (const row of productRows ?? []) {
    productCount.set(row.configurator_id, (productCount.get(row.configurator_id) ?? 0) + 1);
  }

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          Boutique QuoteBuilder : mini-site devis indexable. Woo et Shopify restent un catalogue branché.
        </p>
        <CreateShopButton />
        <ConnectStoreDialog funnels={funnels ?? []} />
      </ListToolbar>

      <PairingCard configuratorId={funnels?.[0]?.id ?? null} pluginVersion={pluginVersion} />

      {native.length ? (
        <DataTable headers={["Boutique QuoteBuilder", "Lien", "Produits", "Statut"]}>
          {native.map((shop) => {
            const status = SHOP_STATUS[shop.status] ?? SHOP_STATUS.draft;
            const path = shopBasePath(ctx.organization.slug, shop.slug);
            return (
              <ClickableRow key={shop.id} href={`/integrations/shop/${shop.id}`}>
                <td className="px-4 py-3 lg:px-6">
                  <span className="block font-medium text-slate-900">{shop.name}</span>
                  <span className="mt-1 inline-flex">
                    <Chip tone="orange">Intégrée</Chip>
                  </span>
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Link href={path} className="text-sm text-[#C2410C] underline" target="_blank">
                    {path}
                  </Link>
                </td>
                <td className="px-4 py-3 tabular-nums lg:px-6">
                  {shop.configurator_id ? (productCount.get(shop.configurator_id) ?? 0) : "—"}
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={status.tone}>{status.label}</Chip>
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : null}

      {rows.length ? (
        <DataTable headers={["Boutique connectée", "Canal", "Produits", "Dernière sync", "Statut", ""]}>
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
                    <span className="mt-1 block max-w-xs truncate text-xs text-rose-600">{connection.last_error}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right lg:px-6">
                  <SyncButton connectionId={connection.id} />
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : null}

      {!native.length && !rows.length ? (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucune boutique</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Créez une boutique QuoteBuilder (pages, catalogue, devis, SEO) ou branchez WooCommerce / Shopify pour
            importer un catalogue existant.
          </p>
          <p className="mt-4">
            <a href="#nouveau" className="text-sm font-medium text-[#C2410C] underline">
              Créer une boutique
            </a>
          </p>
        </div>
      ) : null}

      <CreateShopDialog funnels={funnels ?? []} defaultFamily={family} orgName={ctx.organization.name} />
    </ListPanel>
  );
}
