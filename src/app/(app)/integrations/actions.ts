"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { getAdapter } from "@/lib/integrations/connections";
import {
  encryptCredentials,
  maskHint,
  randomPairingCode,
  randomToken,
} from "@/lib/integrations/secrets";
import { normalizeShopDomain } from "@/lib/integrations/shopify";
import { runCatalogSync } from "@/lib/integrations/sync";
import {
  parseSettings,
  type CatalogProvider,
  type ConnectionSettings,
  type ProviderCredentials,
  type ResolvedConnection,
} from "@/lib/integrations/types";
import { normalizeSiteUrl } from "@/lib/integrations/woocommerce";
import type { Json } from "@/lib/db/database.types";
import { createClient } from "@/lib/supabase/server";

export type ConnectState = { error?: string; ok?: boolean };

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

function readSettings(formData: FormData): ConnectionSettings {
  return parseSettings({
    importDrafts: formData.get("importDrafts") === "on",
    skipOutOfStock: formData.get("skipOutOfStock") === "on",
    archiveMissing: formData.get("archiveMissing") === "on",
    markupPercent: Number(String(formData.get("markupPercent") ?? "0").replace(",", ".")) || 0,
    categories: String(formData.get("categories") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
  });
}

export async function connectStore(
  _prev: ConnectState,
  formData: FormData,
): Promise<ConnectState> {
  const ctx = await requireAdmin();
  const provider = String(formData.get("provider") ?? "") as CatalogProvider;
  if (provider !== "woocommerce" && provider !== "shopify") {
    return { error: "Choisissez WooCommerce ou Shopify." };
  }

  let storeDomain: string;
  let credentials: ProviderCredentials;
  let hintSource: string;

  try {
    if (provider === "woocommerce") {
      storeDomain = normalizeSiteUrl(String(formData.get("store") ?? ""));
      const consumer_key = String(formData.get("consumer_key") ?? "").trim();
      const consumer_secret = String(formData.get("consumer_secret") ?? "").trim();
      if (!consumer_key || !consumer_secret) {
        return { error: "Renseignez la consumer key et le consumer secret WooCommerce." };
      }
      credentials = { consumer_key, consumer_secret };
      hintSource = consumer_key;
    } else {
      storeDomain = normalizeShopDomain(String(formData.get("store") ?? ""));
      const access_token = String(formData.get("access_token") ?? "").trim();
      if (!access_token) return { error: "Renseignez le jeton d'accès Admin API Shopify." };
      credentials = { access_token };
      hintSource = access_token;
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Boutique invalide." };
  }

  const settings = readSettings(formData);
  const configuratorId = String(formData.get("configurator_id") ?? "") || null;
  const webhookSecret = String(formData.get("webhook_secret") ?? "").trim() || randomToken(24);

  const probe: ResolvedConnection = {
    id: "probe",
    organizationId: ctx.organization.id,
    configuratorId,
    provider,
    label: storeDomain,
    storeDomain,
    credentials,
    settings,
    webhookSecret,
    currency: "EUR",
  };

  const adapter = getAdapter(provider);
  const test = await adapter.test(probe);
  if (!test.ok) return { error: test.error };

  const supabase = await createClient();
  const label = String(formData.get("label") ?? "").trim() || test.shopName || storeDomain;

  const { data: connection, error } = await supabase
    .from("catalog_connections")
    .upsert(
      {
        organization_id: ctx.organization.id,
        configurator_id: configuratorId,
        provider,
        label,
        store_domain: storeDomain,
        credentials: encryptCredentials(credentials) as unknown as Json,
        credentials_hint: maskHint(hintSource),
        settings: settings as unknown as Json,
        webhook_secret: webhookSecret,
        currency: test.currency,
        status: "active",
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,provider,store_domain" },
    )
    .select("id")
    .single();

  if (error || !connection) {
    return { error: error?.message ?? "Impossible d'enregistrer la connexion." };
  }

  const result = await runCatalogSync({ connectionId: connection.id, trigger: "manual" });
  revalidatePath("/integrations");
  revalidatePath("/produits");
  if (result.error) return { error: result.error };
  redirect(`/integrations/${connection.id}`);
}

export async function syncConnection(connectionId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_connections")
    .select("id")
    .eq("id", connectionId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!data) return { error: "Connexion introuvable." };

  const result = await runCatalogSync({ connectionId, trigger: "manual" });
  revalidatePath("/integrations");
  revalidatePath(`/integrations/${connectionId}`);
  revalidatePath("/produits");
  return result;
}

export async function updateConnection(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("catalog_connections")
    .update({
      label: String(formData.get("label") ?? "").trim() || "Boutique",
      configurator_id: String(formData.get("configurator_id") ?? "") || null,
      settings: readSettings(formData) as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath(`/integrations/${id}`);
  revalidatePath("/integrations");
}

export async function toggleConnection(connectionId: string, enable: boolean) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("catalog_connections")
    .update({ status: enable ? "active" : "disabled", updated_at: new Date().toISOString() })
    .eq("id", connectionId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/integrations");
  revalidatePath(`/integrations/${connectionId}`);
}

export async function rotateWebhookSecret(connectionId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("catalog_connections")
    .update({ webhook_secret: randomToken(24), updated_at: new Date().toISOString() })
    .eq("id", connectionId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath(`/integrations/${connectionId}`);
}

export async function deleteConnection(connectionId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  // Les produits importés restent, détachés de la boutique et désactivés.
  await supabase
    .from("products")
    .update({ is_active: false, connection_id: null, external_id: null })
    .eq("connection_id", connectionId)
    .eq("organization_id", ctx.organization.id);
  await supabase
    .from("catalog_connections")
    .delete()
    .eq("id", connectionId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/integrations");
  revalidatePath("/produits");
  redirect("/integrations");
}

/** Code court affiché dans QuoteBuilder puis collé dans le plugin WordPress. */
export async function createPairingCode(configuratorId: string | null) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const code = randomPairingCode();
  await supabase
    .from("catalog_pairings")
    .insert({
      organization_id: ctx.organization.id,
      configurator_id: configuratorId,
      provider: "woocommerce",
      code,
      expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
    });
  revalidatePath("/integrations");
  return { code };
}
