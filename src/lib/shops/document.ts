import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { asJson, type ShopDocument, type ShopProduct } from "@/lib/shops/types";
import { parseBlocks } from "@/lib/shops/blocks";
import { navFromRow, pageFromRow, parseLegal, parseNavLocation, parsePageKind, parsePageSeo, parseSeo, parseStatus, parseTheme } from "@/lib/shops/parse";

export async function loadShopDocument(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  shopId: string,
): Promise<ShopDocument | null> {
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!shop) return null;
  const [{ data: pages }, { data: nav }] = await Promise.all([
    supabase.from("shop_pages").select("*").eq("shop_id", shop.id).order("sort_order", { ascending: true }),
    supabase.from("shop_nav_items").select("*").eq("shop_id", shop.id).order("sort_order", { ascending: true }),
  ]);
  return { shop, pages: pages ?? [], nav: nav ?? [] };
}

export async function persistShopDocument(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  doc: ShopDocument,
) {
  const theme = parseTheme(doc.shop.theme);
  delete theme.seedPrompt;
  await supabase
    .from("shops")
    .update({
      name: doc.shop.name,
      status: parseStatus(doc.shop.status),
      theme: asJson(theme),
      seo: asJson(parseSeo(doc.shop.seo, doc.shop.name)),
      legal: asJson(parseLegal(doc.shop.legal)),
      published_at: doc.shop.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", doc.shop.id)
    .eq("organization_id", organizationId);

  const { data: existingPages } = await supabase.from("shop_pages").select("id, slug").eq("shop_id", doc.shop.id);
  const keepPageIds = new Set(doc.pages.map((page) => page.id));
  for (const row of existingPages ?? []) {
    if (!keepPageIds.has(row.id)) {
      await supabase.from("shop_pages").delete().eq("id", row.id).eq("shop_id", doc.shop.id);
    }
  }
  for (const page of doc.pages) {
    const payload = {
      organization_id: organizationId,
      shop_id: doc.shop.id,
      kind: parsePageKind(page.kind),
      slug: page.slug,
      title: page.title,
      seo: asJson(parsePageSeo(page.seo, page.title)),
      blocks: asJson(parseBlocks(page.blocks)),
      is_published: page.is_published,
      sort_order: page.sort_order,
      updated_at: new Date().toISOString(),
    };
    const exists = (existingPages ?? []).some((row) => row.id === page.id);
    if (exists) {
      await supabase.from("shop_pages").update(payload).eq("id", page.id).eq("shop_id", doc.shop.id);
    } else {
      await supabase.from("shop_pages").insert({ ...payload, id: page.id });
    }
  }

  await supabase.from("shop_nav_items").delete().eq("shop_id", doc.shop.id);
  if (doc.nav.length) {
    await supabase.from("shop_nav_items").insert(
      doc.nav.map((item, index) => ({
        organization_id: organizationId,
        shop_id: doc.shop.id,
        location: parseNavLocation(item.location),
        label: item.label,
        href: item.href,
        sort_order: item.sort_order ?? index,
      })),
    );
  }
}

export async function loadShopProducts(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  configuratorId: string | null,
): Promise<ShopProduct[]> {
  if (!configuratorId) return [];
  const { data } = await supabase
    .from("products")
    .select("id, name, description, image_url, price_min, price_max, currency, category, sku")
    .eq("organization_id", organizationId)
    .eq("configurator_id", configuratorId)
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as ShopProduct[];
}

export { pageFromRow, navFromRow };
