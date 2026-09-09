"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { syncAdsCampaigns, loadAdsConnection, accessTokenFor } from "@/lib/ads/sync";
import { ensureConversionActions, listAccessibleCustomers, parseAdsSettings } from "@/lib/ads/google";
import type { Json } from "@/lib/db/database.types";

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

export async function pickAdsCustomer(customerId: string, customerName: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const row = await loadAdsConnection(supabase, ctx.organization.id);
  if (!row) redirect("/acquisition?error=noconnect");
  try {
    const access = await accessTokenFor(row);
    const settings = await ensureConversionActions(access, customerId, parseAdsSettings(row.settings));
    await supabase
      .from("ads_connections")
      .update({
        customer_id: customerId,
        customer_name: customerName,
        status: "active",
        last_error: null,
        settings: { ...settings, pendingCustomers: undefined } as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("organization_id", ctx.organization.id);
    await syncAdsCampaigns(supabase, ctx.organization.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sélection du compte impossible.";
    await supabase
      .from("ads_connections")
      .update({ status: "error", last_error: message, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    redirect(`/acquisition?error=pick`);
  }
  revalidatePath("/acquisition");
  revalidatePath("/stats");
  redirect("/acquisition");
}

export async function refreshAdsStats() {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await syncAdsCampaigns(supabase, ctx.organization.id);
  revalidatePath("/acquisition");
  revalidatePath("/stats");
  redirect("/acquisition");
}

export async function disconnectAds() {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const row = await loadAdsConnection(supabase, ctx.organization.id);
  if (!row) return;
  await supabase.from("ads_campaign_stats").delete().eq("connection_id", row.id);
  await supabase.from("ads_connections").delete().eq("id", row.id).eq("organization_id", ctx.organization.id);
  revalidatePath("/acquisition");
  revalidatePath("/stats");
  redirect("/acquisition");
}

export async function reloadAdsCustomers() {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const row = await loadAdsConnection(supabase, ctx.organization.id);
  if (!row) redirect("/acquisition?error=noconnect");
  try {
    const access = await accessTokenFor(row);
    const customers = await listAccessibleCustomers(access);
    await supabase
      .from("ads_connections")
      .update({
        settings: { ...parseAdsSettings(row.settings), pendingCustomers: customers } as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  } catch {
    redirect("/acquisition?error=customers");
  }
  revalidatePath("/acquisition");
  redirect("/acquisition?pick=1");
}
