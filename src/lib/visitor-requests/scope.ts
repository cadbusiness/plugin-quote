import { createServiceClient } from "@/lib/supabase/service";
import { resolvePublicConfigurator } from "@/lib/public/session";
import { gateShopCatalogRequest, resolveShopCatalog } from "@/lib/shops/catalog-scope";
import type { VisitorScope } from "@/lib/visitor-requests/service";

export async function resolveVisitorScope(input: {
  orgSlug: string;
  configuratorSlug?: string | null;
  configuratorId?: string | null;
  shopSlug?: string | null;
  connectionId?: string | null;
}): Promise<{ ok: true; scope: VisitorScope } | { ok: false; status: number; error: string }> {
  const orgSlug = input.orgSlug.trim();
  const shopSlug = input.shopSlug?.trim() || "";
  const configuratorSlug = input.configuratorSlug?.trim() || "";
  const configuratorId = input.configuratorId?.trim() || "";

  let organizationId = "";
  let resolvedConfiguratorId = "";

  if (shopSlug) {
    const resolved = await resolveShopCatalog(orgSlug, shopSlug);
    const gate = gateShopCatalogRequest(resolved, {
      configuratorId: configuratorId || null,
      configuratorSlug: configuratorSlug || null,
    });
    if (!gate.ok) return { ok: false, status: gate.status, error: gate.error };
    organizationId = gate.scope.organizationId;
    resolvedConfiguratorId = gate.scope.configuratorId;
  } else if (configuratorSlug) {
    const resolved = await resolvePublicConfigurator(orgSlug, configuratorSlug);
    if (!resolved) return { ok: false, status: 404, error: "Configurateur introuvable" };
    if (configuratorId && configuratorId !== resolved.configuratorId) {
      return { ok: false, status: 403, error: "Ce catalogue n’appartient pas à ce funnel" };
    }
    organizationId = resolved.organizationId;
    resolvedConfiguratorId = resolved.configuratorId;
  } else {
    return { ok: false, status: 400, error: "Funnel ou boutique requis" };
  }

  const connectionId = input.connectionId?.trim() || null;
  if (connectionId) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("catalog_connections")
      .select("id")
      .eq("id", connectionId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!data) return { ok: false, status: 404, error: "Connexion introuvable" };
  }

  return {
    ok: true,
    scope: { organizationId, configuratorId: resolvedConfiguratorId, connectionId },
  };
}
