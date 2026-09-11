import { createServiceClient } from "@/lib/supabase/service";
import { pickPreferredBySlug, publicShopSlugs } from "@/lib/demo/public-slugs";
import { parseStatus } from "@/lib/shops/parse";

export type ShopCatalogScope = {
  organizationId: string;
  orgSlug: string;
  shopId: string;
  shopSlug: string;
  configuratorId: string;
  configuratorSlug: string;
};

export type ShopCatalogDenyReason = "shop_unavailable" | "no_catalog" | "catalog_mismatch";

export type ShopCatalogResolve =
  | { ok: true; scope: ShopCatalogScope }
  | { ok: false; reason: Exclude<ShopCatalogDenyReason, "catalog_mismatch"> };

export type ShopCatalogGate =
  | { ok: true; scope: ShopCatalogScope }
  | { ok: false; reason: ShopCatalogDenyReason; status: 403 | 404; error: string };

export const SHOP_CATALOG_ERRORS: Record<ShopCatalogDenyReason, { status: 403 | 404; error: string }> = {
  shop_unavailable: { status: 404, error: "Boutique introuvable" },
  no_catalog: { status: 404, error: "Catalogue de cette boutique introuvable" },
  catalog_mismatch: { status: 403, error: "Ce catalogue n’appartient pas à cette boutique" },
};

export function shopCatalogError(reason: ShopCatalogDenyReason) {
  return SHOP_CATALOG_ERRORS[reason];
}

export function shopConfiguratorApiPath(orgSlug: string, shopSlug: string) {
  return `/api/public/shop/${orgSlug}/${shopSlug}/configurator`;
}

export function shopSuggestionsApiPath(sessionId: string, orgSlug: string, shopSlug: string) {
  return `/api/public/sessions/${sessionId}/suggestions?org=${encodeURIComponent(orgSlug)}&shop=${encodeURIComponent(shopSlug)}`;
}

/** Fail-closed: shop devis may only bind to the shop’s linked configurator. */
export function gateShopCatalogRequest(
  resolved: ShopCatalogResolve,
  requested?: { configuratorId?: string | null; configuratorSlug?: string | null },
): ShopCatalogGate {
  if (!resolved.ok) {
    const { status, error } = shopCatalogError(resolved.reason);
    return { ok: false, reason: resolved.reason, status, error };
  }
  const requestedId = requested?.configuratorId?.trim() || "";
  const requestedSlug = requested?.configuratorSlug?.trim() || "";
  if (requestedId && requestedId !== resolved.scope.configuratorId) {
    const { status, error } = shopCatalogError("catalog_mismatch");
    return { ok: false, reason: "catalog_mismatch", status, error };
  }
  if (requestedSlug && requestedSlug !== resolved.scope.configuratorSlug) {
    const { status, error } = shopCatalogError("catalog_mismatch");
    return { ok: false, reason: "catalog_mismatch", status, error };
  }
  return { ok: true, scope: resolved.scope };
}

export function restrictProductsToShopCatalog<T extends { configuratorId: string }>(
  products: T[],
  shopConfiguratorId: string,
): T[] {
  if (!shopConfiguratorId) return [];
  return products.filter((product) => product.configuratorId === shopConfiguratorId);
}

export function productsWithinShopCatalog<T extends { configuratorId: string }>(
  products: T[],
  shopConfiguratorId: string,
) {
  return products.length > 0 && products.every((product) => product.configuratorId === shopConfiguratorId);
}

export async function resolveShopCatalog(orgSlug: string, shopSlug: string): Promise<ShopCatalogResolve> {
  const supabase = createServiceClient();
  const { data: org } = await supabase.from("organizations").select("id, slug").eq("slug", orgSlug).maybeSingle();
  if (!org) return { ok: false, reason: "shop_unavailable" };

  const slugs = publicShopSlugs(org.slug, shopSlug);
  const { data: matches } = await supabase
    .from("shops")
    .select("id, slug, organization_id, configurator_id, status")
    .eq("organization_id", org.id)
    .in("slug", slugs);
  const shop = pickPreferredBySlug(matches, slugs);
  if (!shop || parseStatus(shop.status) === "archived") {
    return { ok: false, reason: "shop_unavailable" };
  }
  if (!shop.configurator_id) return { ok: false, reason: "no_catalog" };

  const { data: configurator } = await supabase
    .from("configurators")
    .select("id, slug, is_active, organization_id")
    .eq("id", shop.configurator_id)
    .maybeSingle();
  if (!configurator?.is_active || configurator.organization_id !== org.id) {
    return { ok: false, reason: "no_catalog" };
  }

  return {
    ok: true,
    scope: {
      organizationId: org.id,
      orgSlug: org.slug,
      shopId: shop.id,
      shopSlug: shop.slug,
      configuratorId: configurator.id,
      configuratorSlug: configurator.slug,
    },
  };
}
