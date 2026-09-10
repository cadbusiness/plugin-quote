import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { ConnectStoreButton, ConnectStoreDialog } from "@/components/integrations/connect-store-dialog";
import { CreateShopDialog } from "@/components/shops/create-shop-dialog";
import { CreateShopButton } from "@/components/shops/create-shop-button";
import { PublishShopButton } from "@/components/shops/publish-shop-button";
import { DataTable, ListPanel } from "@/components/ui/list-panel";
import { SyncButton } from "@/components/integrations/sync-button";
import { PairingActions } from "@/components/integrations/pairing-card";
import { SourceMenu } from "@/components/integrations/source-menu";
import { formatRelative } from "@/lib/format";
import { parseOrgFamily } from "@/lib/funnels/families";
import { wordpressPluginRelease } from "@/lib/integrations/plugin-release";
import { PROVIDER_LABELS, type CatalogProvider } from "@/lib/integrations/types";
import { shopBasePath } from "@/lib/shops/urls";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const STATUS_COPY: Record<string, { label: string; live: boolean; hint: string }> = {
  active: { label: "Connectée", live: true, hint: "" },
  error: { label: "En erreur", live: false, hint: "" },
  disabled: { label: "En pause", live: false, hint: "Synchronisation arrêtée" },
};

const SHOP_STATUS_COPY: Record<string, { label: string; live: boolean; hint: string }> = {
  draft: { label: "Brouillon", live: false, hint: "Invisible pour vos clients" },
  published: { label: "En ligne", live: true, hint: "Indexable, ouverte aux visiteurs" },
  archived: { label: "Archivée", live: false, hint: "Retirée des sources actives" },
};

export default async function IntegrationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const [{ data: shops }, { data: connections }, { data: funnels }, { count: productTotal }] = await Promise.all([
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
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", ctx.organization.id)
      .eq("is_active", true),
  ]);

  const native = shops ?? [];
  const rows = connections ?? [];
  const pluginVersion = wordpressPluginRelease().version;
  const family = parseOrgFamily(ctx.organization.branding);
  const funnelById = new Map((funnels ?? []).map((funnel) => [funnel.id, funnel.name]));
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

  const sourceCount = native.length + rows.length;
  const onlineCount =
    native.filter((shop) => shop.status === "published").length + rows.filter((row) => row.status === "active").length;
  const lastSync = rows
    .map((row) => row.last_sync_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  const showConnectCard = rows.length === 0;
  const showCreateCard = native.length === 0;

  return (
    <ListPanel className="overflow-auto">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-4 py-5 lg:px-6">
        <div className="min-w-0 max-w-xl">
          <p className="text-2xl font-semibold tracking-tight text-slate-900">Boutiques</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            D’où viennent les produits que vos clients configurent. Branchez Woo ou Shopify, ou ouvrez une boutique
            QuoteBuilder.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ConnectStoreButton />
          <CreateShopButton />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 divide-y divide-slate-200 border-b border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Kpi label="Produits configurables" value={String(productTotal ?? 0)} />
        <Kpi
          label="Sources"
          value={String(sourceCount)}
          suffix={sourceCount ? `${onlineCount} en ligne` : undefined}
        />
        <Kpi label="Dernière synchronisation" value={lastSync ? formatSyncStamp(lastSync) : "—"} />
      </div>

      {sourceCount ? (
        <div className="shrink-0">
          <p className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 lg:px-6">
            Vos sources de catalogue
          </p>
          <DataTable headers={["Source", "Type", "Funnel alimenté", "Produits", "État", ""]} headClassName="bg-[#FBF6F1]">
            {rows.map((connection) => {
              const provider = connection.provider as CatalogProvider;
              const status = STATUS_COPY[connection.status] ?? STATUS_COPY.active;
              const hint =
                connection.last_error ||
                (connection.last_sync_at ? `Sync ${formatRelative(connection.last_sync_at).toLowerCase()}` : "Jamais synchronisée");
              return (
                <ClickableRow key={connection.id} href={`/integrations/${connection.id}`}>
                  <td className="px-4 py-3.5 lg:px-6">
                    <span className="block font-medium text-slate-900">{connection.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{connection.store_domain}</span>
                  </td>
                  <td className="px-4 py-3.5 lg:px-6">
                    <span className="block text-sm text-slate-900">{PROVIDER_LABELS[provider] ?? connection.provider}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {provider === "woocommerce" ? `Plugin v${pluginVersion} à jour` : "App personnalisée · read_products"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-700 lg:px-6">
                    {connection.configurator_id ? funnelById.get(connection.configurator_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-slate-900 lg:px-6">{connection.product_count}</td>
                  <td className="px-4 py-3.5 lg:px-6">
                    <StatusMark live={status.live} error={connection.status === "error"} label={status.label} hint={hint} />
                  </td>
                  <td className="px-4 py-3.5 text-right lg:px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <SyncButton connectionId={connection.id} variant="outline" />
                      <SourceMenu
                        items={[
                          { href: `/integrations/${connection.id}`, label: "Réglages" },
                          ...(provider === "woocommerce"
                            ? [
                                {
                                  href: `/api/public/plugin/wordpress/download?v=${encodeURIComponent(pluginVersion)}`,
                                  label: "Télécharger le plugin",
                                },
                              ]
                            : []),
                        ]}
                      />
                    </div>
                  </td>
                </ClickableRow>
              );
            })}
            {native.map((shop) => {
              const status = SHOP_STATUS_COPY[shop.status] ?? SHOP_STATUS_COPY.draft;
              const path = shopBasePath(ctx.organization.slug, shop.slug);
              return (
                <ClickableRow
                  key={shop.id}
                  href={`/integrations/shop/${shop.id}`}
                  className="bg-[#FFF4EC] hover:bg-[#FFEDD5]"
                >
                  <td className="px-4 py-3.5 lg:px-6">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{shop.name}</span>
                      <Chip tone="orange">Intégrée</Chip>
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">{path}</span>
                  </td>
                  <td className="px-4 py-3.5 lg:px-6">
                    <span className="block text-sm text-slate-900">Boutique hébergée</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Aucun site requis</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-700 lg:px-6">
                    {shop.configurator_id ? funnelById.get(shop.configurator_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-slate-900 lg:px-6">
                    {shop.configurator_id ? (productCount.get(shop.configurator_id) ?? 0) : "—"}
                  </td>
                  <td className="px-4 py-3.5 lg:px-6">
                    <StatusMark live={status.live} label={status.label} hint={status.hint} />
                  </td>
                  <td className="px-4 py-3.5 text-right lg:px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      {shop.status === "draft" ? <PublishShopButton id={shop.id} status={shop.status} /> : null}
                      <SourceMenu
                        items={[
                          { href: `/integrations/shop/${shop.id}`, label: "Éditer" },
                          { href: path, label: "Aperçu", external: true },
                        ]}
                      />
                    </div>
                  </td>
                </ClickableRow>
              );
            })}
          </DataTable>
        </div>
      ) : null}

      {showConnectCard || showCreateCard ? (
        <div
          className={`grid shrink-0 gap-4 border-t border-slate-100 px-4 py-6 lg:px-6 ${
            showConnectCard && showCreateCard ? "lg:grid-cols-2" : ""
          }`}
        >
          {showConnectCard ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Vous avez déjà un e-commerce</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Branchez-le, il reste la source de vérité</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Produits, variations, images et prix sont importés par l’API, puis resynchronisés. Vous choisissez le
                funnel qui reçoit le catalogue, une marge et des catégories.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <ConnectStoreButton provider="woocommerce" />
                <ConnectStoreButton provider="shopify" />
              </div>
              <div className="mt-4">
                <PairingActions configuratorId={funnels?.[0]?.id ?? null} pluginVersion={pluginVersion} />
              </div>
            </div>
          ) : null}
          {showCreateCard ? (
            <div className="rounded-xl bg-stone-950 px-5 py-6 text-white">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">Pas de site vitrine</p>
              <p className="mt-2 text-lg font-semibold tracking-tight">Ouvrez une boutique en quinze minutes</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/65">
                Un mini-site de devis hébergé et indexable : pages, catalogue, parcours et SEO. Pas de site à construire,
                pas de paiement à encaisser.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <CreateShopButton />
                <span className="text-sm text-white/50">Incluse dans votre plan</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <ConnectStoreDialog funnels={funnels ?? []} />
      <CreateShopDialog funnels={funnels ?? []} defaultFamily={family} orgName={ctx.organization.name} />
    </ListPanel>
  );
}

function Kpi({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="bg-white px-4 py-4 lg:px-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
        {suffix ? <span className="text-lg font-medium text-slate-400"> · {suffix}</span> : null}
      </p>
    </div>
  );
}

function StatusMark({
  live,
  error,
  label,
  hint,
}: {
  live: boolean;
  error?: boolean;
  label: string;
  hint: string;
}) {
  return (
    <span className="inline-flex items-start gap-2">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          error ? "bg-rose-500" : live ? "bg-[#E85D04]" : "ring-1 ring-slate-300"
        }`}
        aria-hidden
      />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
      </span>
    </span>
  );
}

function formatSyncStamp(iso: string) {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
}
