import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/env";
import {
  exchangeCode,
  listAccessibleCustomers,
  readOAuthState,
  ensureConversionActions,
} from "@/lib/ads/google";
import { storeRefreshToken, syncAdsCampaigns } from "@/lib/ads/sync";
import type { Json } from "@/lib/db/database.types";

export async function GET(req: Request) {
  const origin = getAppUrl();
  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL("/acquisition?error=denied", origin));
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/acquisition?error=oauth", origin));
  const parsed = readOAuthState(state);
  if (!parsed) return NextResponse.redirect(new URL("/acquisition?error=state", origin));

  const supabase = await createClient();
  try {
    const tokens = await exchangeCode(code);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL("/acquisition?error=refresh", origin));
    }
    const customers = await listAccessibleCustomers(tokens.access_token);
    const credentials = storeRefreshToken(tokens.refresh_token);
    const { data: existing } = await supabase
      .from("ads_connections")
      .select("id")
      .eq("organization_id", parsed.orgId)
      .eq("provider", "google_ads")
      .maybeSingle();

    const payload = {
      organization_id: parsed.orgId,
      provider: "google_ads" as const,
      credentials,
      credentials_hint: "Google Ads",
      status: customers.length === 1 ? "active" : "pending",
      customer_id: customers[0]?.id ?? null,
      customer_name: customers[0]?.name ?? null,
      settings: { pendingCustomers: customers } as Json,
      last_error: null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from("ads_connections").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("ads_connections").insert(payload);
    }

    if (customers.length === 1 && customers[0]) {
      const settings = await ensureConversionActions(tokens.access_token, customers[0].id, {});
      await supabase
        .from("ads_connections")
        .update({ settings: settings as Json, status: "active" })
        .eq("organization_id", parsed.orgId)
        .eq("provider", "google_ads");
      await syncAdsCampaigns(supabase, parsed.orgId);
      return NextResponse.redirect(new URL("/acquisition", origin));
    }
    return NextResponse.redirect(new URL("/acquisition?pick=1", origin));
  } catch (err) {
    console.error("Google Ads OAuth failed", err);
    const message = err instanceof Error ? err.message : "oauth";
    await supabase.from("ads_connections").upsert(
      {
        organization_id: parsed.orgId,
        provider: "google_ads",
        status: "error",
        last_error: message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,provider" },
    );
    return NextResponse.redirect(new URL("/acquisition?error=oauth", origin));
  }
}
