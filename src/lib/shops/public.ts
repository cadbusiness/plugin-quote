import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/service";
import { loadShopProducts } from "@/lib/shops/document";
import { navFromRow, pageFromRow, parseLegal, parseSeo, parseStatus, parseTheme } from "@/lib/shops/parse";
import type { ShopDocument, ShopProduct } from "@/lib/shops/types";

export type PublicShop = {
  orgSlug: string;
  orgName: string;
  funnelSlug: string | null;
  doc: ShopDocument;
  products: ShopProduct[];
  theme: ReturnType<typeof parseTheme>;
  seo: ReturnType<typeof parseSeo>;
  legal: ReturnType<typeof parseLegal>;
  pages: ReturnType<typeof pageFromRow>[];
  nav: ReturnType<typeof navFromRow>[];
};

export const loadPublicShop = cache(async function loadPublicShop(
  orgSlug: string,
  shopSlug: string,
  opts?: { allowDraft?: boolean },
): Promise<PublicShop | null> {
  const supabase = createServiceClient();
  const { data: org } = await supabase.from("organizations").select("id, name, slug").eq("slug", orgSlug).maybeSingle();
  if (!org) return null;
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("organization_id", org.id)
    .eq("slug", shopSlug)
    .maybeSingle();
  if (!shop) return null;
  const status = parseStatus(shop.status);
  if (status === "archived") return null;
  if (status !== "published" && !opts?.allowDraft) return null;

  const [{ data: pages }, { data: nav }, products, funnel] = await Promise.all([
    supabase.from("shop_pages").select("*").eq("shop_id", shop.id).order("sort_order", { ascending: true }),
    supabase.from("shop_nav_items").select("*").eq("shop_id", shop.id).order("sort_order", { ascending: true }),
    loadShopProducts(supabase, org.id, shop.configurator_id),
    shop.configurator_id
      ? supabase.from("configurators").select("slug").eq("id", shop.configurator_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const doc: ShopDocument = { shop, pages: pages ?? [], nav: nav ?? [] };
  return {
    orgSlug: org.slug,
    orgName: org.name,
    funnelSlug: funnel.data?.slug ?? null,
    doc,
    products,
    theme: parseTheme(shop.theme),
    seo: parseSeo(shop.seo, shop.name),
    legal: parseLegal(shop.legal),
    pages: (pages ?? []).map(pageFromRow),
    nav: (nav ?? []).map(navFromRow),
  };
});
