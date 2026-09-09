import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel } from "@/components/ui/list-panel";
import { AcquisitionView } from "@/components/ads/acquisition-view";
import { loadStatsDashboard } from "@/lib/stats/dashboard";
import { googleAdsConfigured } from "@/lib/ads/google";
import { loadAdsConnection, mapAdsConnection } from "@/lib/ads/sync";
import { allKeywordPacks, keywordPackForSector } from "@/lib/ads/keywords";
import { adsLandingUrl } from "@/lib/ads/utm";
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
  const [stats, row, { data: funnels }] = await Promise.all([
    loadStatsDashboard(supabase, ctx.organization.id, "month"),
    loadAdsConnection(supabase, ctx.organization.id),
    supabase
      .from("configurators")
      .select("id, name, slug, sector")
      .eq("organization_id", ctx.organization.id)
      .order("name"),
  ]);
  const origin = getAppUrl();
  const landingUrls = (funnels ?? []).map((funnel) => {
    const pack = keywordPackForSector(funnel.sector);
    const publicUrl = `${origin}/c/${ctx.organization.slug}/${funnel.slug}`;
    return {
      funnelId: funnel.id,
      name: funnel.name,
      sector: funnel.sector,
      campaign: pack.campaignName,
      url: adsLandingUrl(publicUrl, pack.campaignName, funnel.slug),
    };
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
