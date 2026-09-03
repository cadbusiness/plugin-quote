import { NextResponse } from "next/server";
import { z } from "zod";
import { encryptCredentials, maskHint, randomToken } from "@/lib/integrations/secrets";
import { runCatalogSync } from "@/lib/integrations/sync";
import { DEFAULT_SETTINGS } from "@/lib/integrations/types";
import { normalizeSiteUrl } from "@/lib/integrations/woocommerce";
import type { Json } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const schema = z.object({
  code: z.string().min(6).max(32),
  site_url: z.string().min(4),
  consumer_key: z.string().min(10),
  consumer_secret: z.string().min(10),
  site_name: z.string().max(120).optional(),
});

/**
 * Appairage du plugin WordPress : le site pousse lui-même ses clés WooCommerce
 * en échange d'un code à usage unique généré dans QuoteBuilder.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const body = parsed.data;

  let siteUrl: string;
  try {
    siteUrl = normalizeSiteUrl(body.site_url);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "URL invalide" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { data: pairing } = await supabase
    .from("catalog_pairings")
    .select("*")
    .eq("code", body.code.trim().toUpperCase())
    .eq("status", "pending")
    .maybeSingle();

  if (!pairing) {
    return NextResponse.json({ error: "Code d'appairage inconnu ou déjà utilisé" }, { status: 404 });
  }
  if (new Date(pairing.expires_at).getTime() < Date.now()) {
    await supabase.from("catalog_pairings").update({ status: "expired" }).eq("id", pairing.id);
    return NextResponse.json({ error: "Code d'appairage expiré" }, { status: 410 });
  }

  const webhookSecret = randomToken(24);
  const { data: connection, error } = await supabase
    .from("catalog_connections")
    .upsert(
      {
        organization_id: pairing.organization_id,
        configurator_id: pairing.configurator_id,
        provider: "woocommerce",
        label: body.site_name?.trim() || new URL(siteUrl).hostname,
        store_domain: siteUrl,
        credentials: encryptCredentials({
          consumer_key: body.consumer_key,
          consumer_secret: body.consumer_secret,
        }) as unknown as Json,
        credentials_hint: maskHint(body.consumer_key),
        settings: DEFAULT_SETTINGS as unknown as Json,
        webhook_secret: webhookSecret,
        status: "active",
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,provider,store_domain" },
    )
    .select("id, webhook_secret")
    .single();

  if (error || !connection) {
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  }

  await supabase
    .from("catalog_pairings")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      connection_id: connection.id,
      paired_site: siteUrl,
    })
    .eq("id", pairing.id);

  const result = await runCatalogSync({ connectionId: connection.id, trigger: "pairing" });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  return NextResponse.json({
    ok: !result.error,
    connection_id: connection.id,
    webhook_url: `${appUrl}/api/integrations/${connection.id}/webhook`,
    webhook_secret: connection.webhook_secret,
    imported: result.created + result.updated,
    error: result.error,
  });
}
