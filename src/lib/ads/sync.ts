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
import { adsConversionValue, type AdsConversionValue } from "@/lib/ads/conversions";

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
  if (row.status === "pending") {
    return { ok: false as const, error: "Choisissez le compte Google Ads à relier." };
  }
  try {
    const access = await accessTokenFor(row);
    const raw = row.settings && typeof row.settings === "object" && !Array.isArray(row.settings) ? row.settings : {};
    const settings = parseAdsSettings(row.settings);
    const ensured = await ensureConversionActions(access, row.customer_id, settings);
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400000);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const daysRows = await fetchCampaignPerformance(
      access,
      row.customer_id,
      iso(from),
      iso(to),
      ensured.loginCustomerId,
    );
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
        settings: { ...raw, ...ensured } as Json,
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

async function recordUpload(
  supabase: SupabaseClient<Database>,
  row: {
    organizationId: string;
    quoteId: string;
    kind: "quote" | "won";
    gclid: string | null;
    status: "uploaded" | "skipped" | "error";
    error: string | null;
  },
) {
  await supabase.from("ads_conversion_uploads").upsert(
    {
      organization_id: row.organizationId,
      quote_id: row.quoteId,
      kind: row.kind,
      gclid: row.gclid,
      status: row.status,
      error: row.error,
      uploaded_at: row.status === "uploaded" ? new Date().toISOString() : null,
    },
    { onConflict: "quote_id,kind" },
  );
}

async function estimateFromQuote(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  quoteId: string,
  kind: "quote" | "won",
) {
  const { data: quote } = await supabase
    .from("quotes")
    .select("extracted_params")
    .eq("id", quoteId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  const { data: lines } = await supabase
    .from("quote_items")
    .select("price_min, price_max, quantity")
    .eq("quote_id", quoteId);
  return adsConversionValue({ kind, extractedParams: quote?.extracted_params, lines: lines ?? [] });
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
  /** Omitted: estimated from the quote price. Null: send no value. */
  value?: AdsConversionValue | null;
  /** Ads cookie consent when known; omitted means unknown and no consent is sent. */
  consentAds?: boolean;
  hashedEmail?: string;
}) {
  const base = { organizationId: input.organizationId, quoteId: input.quoteId, kind: input.kind };
  if (!input.gclid && !input.gbraid && !input.wbraid) {
    await recordUpload(input.supabase, { ...base, gclid: null, status: "skipped", error: "Pas de gclid" });
    return;
  }
  const clickId = input.gclid ?? input.gbraid ?? input.wbraid ?? null;
  const row = await loadAdsConnection(input.supabase, input.organizationId);
  if (!row?.customer_id || row.status === "disabled") return;
  if (row.status === "pending") {
    await recordUpload(input.supabase, {
      ...base,
      gclid: clickId,
      status: "error",
      error: "Compte Google Ads à choisir : conversion non envoyée.",
    });
    return;
  }
  const settings = parseAdsSettings(row.settings);
  const action = input.kind === "won" ? settings.wonActionResource : settings.quoteActionResource;
  if (!action) {
    const message = "Action de conversion Google Ads absente : relancez la synchronisation ou reconnectez le compte.";
    await recordUpload(input.supabase, { ...base, gclid: clickId, status: "error", error: message });
    await input.supabase
      .from("ads_connections")
      .update({ status: "error", last_error: message, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return;
  }
  try {
    const value =
      input.value !== undefined
        ? input.value
        : await estimateFromQuote(input.supabase, input.organizationId, input.quoteId, input.kind);
    const access = await accessTokenFor(row);
    await uploadClickConversion({
      accessToken: access,
      customerId: row.customer_id,
      loginCustomerId: settings.loginCustomerId,
      conversionAction: action,
      gclid: input.gclid,
      gbraid: input.gbraid,
      wbraid: input.wbraid,
      conversionDateTime: adsDateTime(input.occurredAt),
      value,
      consentAds: input.consentAds,
      hashedEmail: input.hashedEmail,
    });
    await recordUpload(input.supabase, { ...base, gclid: clickId, status: "uploaded", error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload conversion impossible.";
    await recordUpload(input.supabase, { ...base, gclid: clickId, status: "error", error: message });
  }
}

export type { AdsConnectionSettings };
export { parseAdsSettings };
