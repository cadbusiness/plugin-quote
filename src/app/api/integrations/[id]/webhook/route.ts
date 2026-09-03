import { NextResponse } from "next/server";
import { getAdapter, loadConnection, resolveConnection } from "@/lib/integrations/connections";
import { syncExternalProduct } from "@/lib/integrations/sync";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook produit d'une boutique connectée.
 * WooCommerce signe en `x-wc-webhook-signature`, Shopify en `x-shopify-hmac-sha256`.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawBody = await req.text();

  const supabase = createServiceClient();
  const row = await loadConnection(supabase, id);
  if (!row) return NextResponse.json({ error: "Connexion inconnue" }, { status: 404 });

  let connection;
  try {
    connection = resolveConnection(row);
  } catch {
    return NextResponse.json({ error: "Accès illisibles" }, { status: 409 });
  }

  const adapter = getAdapter(connection.provider);
  if (!adapter.verifyWebhook(connection, rawBody, req.headers)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  // Le ping de création de webhook et les sujets hors produit sont acquittés sans rien faire.
  const event = adapter.readWebhook(rawBody, req.headers);
  if (!event) return NextResponse.json({ ignored: true });

  const result = await syncExternalProduct({
    connectionId: connection.id,
    externalId: event.externalId,
    deleted: event.deleted,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 202 });
}
