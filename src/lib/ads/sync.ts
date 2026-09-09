import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { decryptCredentials, encryptCredentials } from "@/lib/integrations/secrets";
import {
  adsDateTime,
  ensureConversionActions,
  fetchCampaignPerformance,
  parseAdsSettings,
  refreshAccessToken,
  uploadClickConversion,
  type AdsConnectionSettings,
} from "@/lib/ads/google";

export type AdsConnectionView = {
  id: string;
  status: string;
  customerId: string | null;
  customerName: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  quoteAction: boolean;
  wonAction: boolean;
};

export function mapAdsConnection(
  row: Database["public"]["Tables"]["ads_connections"]["Row"],
): AdsConnectionView {
  const settings = parseAdsSettings(row.settings);
  return {
    id: row.id,
    status: row.status,
    customerId: row.customer_id,
    customerName: row.customer_name,
    lastSyncAt: row.last_sync_at,
    lastError: row.last_error,
    quoteAction: Boolean(settings.quoteActionResource),
    wonAction: Boolean(settings.wonActionResource),
  };
}

export async function loadAdsConnection(
  supabase: SupabaseClient<Database>,
  orgId: string,
) {
  const { data } = await supabase
    .from("ads_connections")
    .select("*")
    .eq("organization_id", orgId)
    .eq("provider", "google_ads")
    .maybeSingle();
  return data;
}

export function storeRefreshToken(refreshToken: string) {
  return encryptCredentials({ refresh_token: refreshToken });
}

export function readRefreshToken(credentials: unknown) {
  const decrypted = decryptCredentials(credentials);
  const raw = decrypted.refresh_token;
  if (!raw) throw new Error("Aucun refresh token Google Ads.");
  return raw;
}

export async function accessTokenFor(row: Database["public"]["Tables"]["ads_connections"]["Row"]) {
  const refresh = readRefreshToken(row.credentials);
  const tokens = await refreshAccessToken(refresh);
  return tokens.access_token;
}

export async function syncAdsCampaigns(
  supabase: SupabaseClient<Database>,
  orgId: string,
  days = 30,
) {
  const row = await loadAdsConnection(supabase, orgId);
  if (!row?.customer_id || row.status === "disabled") {
    return { ok: false as const, error: "Compte Google Ads non connecté." };
  }
  try {
    const access = await accessTokenFor(row);
    const settings = parseAdsSettings(row.settings);
    const ensured = await ensureConversionActions(access, row.customer_id, settings);
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400000);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const daysRows = await fetchCampaignPerformance(access, row.customer_id, iso(from), iso(to));
    if (daysRows.length) {
      await supabase
        .from("ads_campaign_stats")
        .upsert(
          daysRows.map((item) => ({
            organization_id: orgId,
            connection_id: row.id,
            campaign_id: item.campaignId,
            campaign_name: item.campaignName,
            date: item.date,
            impressions: item.impressions,
            clicks: item.clicks,
            cost_micros: item.costMicros,
          })),
          { onConflict: "connection_id,campaign_id,date" },
        );
    }
    await supabase
      .from("ads_connections")
      .update({
        status: "active",
        last_sync_at: new Date().toISOString(),
        last_error: null,
        settings: ensured as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { ok: true as const, campaigns: daysRows.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync Google Ads impossible.";
    await supabase
      .from("ads_connections")
      .update({ status: "error", last_error: message, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ok: false as const, error: message };
  }
}

export async function reportAdsConversion(input: {
  supabase: SupabaseClient<Database>;
  organizationId: string;
  quoteId: string;
  kind: "quote" | "won";
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  occurredAt: string;
  value?: number | null;
}) {
  if (!input.gclid && !input.gbraid && !input.wbraid) {
    await input.supabase.from("ads_conversion_uploads").upsert(
      {
        organization_id: input.organizationId,
        quote_id: input.quoteId,
        kind: input.kind,
        gclid: null,
        status: "skipped",
        error: "Pas de gclid",
      },
      { onConflict: "quote_id,kind" },
    );
    return;
  }
  const row = await loadAdsConnection(input.supabase, input.organizationId);
  if (!row?.customer_id || row.status === "disabled") return;
  const settings = parseAdsSettings(row.settings);
  const action = input.kind === "won" ? settings.wonActionResource : settings.quoteActionResource;
  if (!action) return;
  try {
    const access = await accessTokenFor(row);
    await uploadClickConversion({
      accessToken: access,
      customerId: row.customer_id,
      conversionAction: action,
      gclid: input.gclid,
      gbraid: input.gbraid,
      wbraid: input.wbraid,
      conversionDateTime: adsDateTime(input.occurredAt),
      value: input.value,
    });
    await input.supabase.from("ads_conversion_uploads").upsert(
      {
        organization_id: input.organizationId,
        quote_id: input.quoteId,
        kind: input.kind,
        gclid: input.gclid ?? input.gbraid ?? input.wbraid,
        status: "uploaded",
        uploaded_at: new Date().toISOString(),
        error: null,
      },
      { onConflict: "quote_id,kind" },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload conversion impossible.";
    await input.supabase.from("ads_conversion_uploads").upsert(
      {
        organization_id: input.organizationId,
        quote_id: input.quoteId,
        kind: input.kind,
        gclid: input.gclid ?? input.gbraid ?? input.wbraid,
        status: "error",
        error: message,
      },
      { onConflict: "quote_id,kind" },
    );
  }
}

export type { AdsConnectionSettings };
export { parseAdsSettings };
