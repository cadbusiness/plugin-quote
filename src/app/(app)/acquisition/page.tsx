import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel } from "@/components/ui/list-panel";
import { AcquisitionView } from "@/components/ads/acquisition-view";
import { loadStatsDashboard } from "@/lib/stats/dashboard";
import { googleAdsConfigured } from "@/lib/ads/google";
import { buildAdsLandings } from "@/lib/ads/landings";
import { loadAdsConnection, mapAdsConnection } from "@/lib/ads/sync";
import { allKeywordPacks } from "@/lib/ads/keywords";
import { parseSettings } from "@/lib/integrations/types";
import { getAppUrl } from "@/lib/supabase/env";

function pendingFromSettings(settings: unknown): { id: string; name: string }[] {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return [];
  const pending = (settings as { pendingCustomers?: unknown }).pendingCustomers;
  if (!Array.isArray(pending)) return [];
  return pending.filter(
    (item): item is { id: string; name: string } =>
      Boolean(item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string"),
  );
}

export default async function AcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pick?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const query = await searchParams;
  const supabase = await createClient();
  const admin = isAdminRole(ctx.role);
  const [stats, row, { data: funnels }, { data: shops }, { data: connections }] = await Promise.all([
    loadStatsDashboard(supabase, ctx.organization.id, "month"),
    loadAdsConnection(supabase, ctx.organization.id),
    supabase
      .from("configurators")
      .select("id, name, slug, sector")
      .eq("organization_id", ctx.organization.id)
      .order("name"),
    supabase
      .from("shops")
      .select("id, name, slug, sector, status")
      .eq("organization_id", ctx.organization.id)
      .order("name"),
    supabase
      .from("catalog_connections")
      .select("id, label, store_domain, provider, status, settings, configurator_id")
      .eq("organization_id", ctx.organization.id)
      .eq("provider", "woocommerce"),
  ]);
  const origin = getAppUrl();
  const funnelById = new Map((funnels ?? []).map((funnel) => [funnel.id, funnel]));
  const landingUrls = buildAdsLandings({
    origin,
    orgSlug: ctx.organization.slug,
    funnels: funnels ?? [],
    shops: shops ?? [],
    wordpress: (connections ?? [])
      .filter((connection) => connection.status === "active")
      .map((connection) => {
        const settings = parseSettings(connection.settings);
        const funnel = connection.configurator_id ? funnelById.get(connection.configurator_id) : undefined;
        return {
          id: connection.id,
          label: connection.label,
          storeDomain: connection.store_domain,
          quotePageUrl: settings.storefront.quotePageUrl,
          sector: funnel?.sector ?? null,
        };
      }),
  });
  const pendingCustomers = pendingFromSettings(row?.settings);
  const configured = googleAdsConfigured();
  const connectHref = configured
    ? "/api/ads/google/start"
    : "mailto:hello@quotebuilder.app?subject=Activer%20Google%20Ads";

  return (
    <ListPanel>
      <AcquisitionView
        stats={stats}
        connection={row ? mapAdsConnection(row) : null}
        configured={configured}
        packs={allKeywordPacks()}
        landingUrls={landingUrls}
        pendingCustomers={pendingCustomers}
        pick={query.pick === "1" || (!!row && row.status === "pending" && pendingCustomers.length > 0)}
        error={query.error}
        admin={admin}
        connectHref={connectHref}
      />
    </ListPanel>
  );
}
