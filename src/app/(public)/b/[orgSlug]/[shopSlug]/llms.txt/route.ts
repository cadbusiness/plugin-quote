import { groupProductsByCategory } from "@/lib/catalog/group";
import { loadPublicShop } from "@/lib/shops/public";
import { llmsTxt } from "@/lib/shops/seo";
import { getAppUrl } from "@/lib/supabase/env";
import { shopQuotePath } from "@/lib/shops/urls";

export async function GET(_req: Request, { params }: { params: Promise<{ orgSlug: string; shopSlug: string }> }) {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadPublicShop(orgSlug, shopSlug);
  if (!shop) return new Response("Not found", { status: 404 });
  const body = llmsTxt({
    shopName: shop.doc.shop.name,
    seo: shop.seo,
    legal: shop.legal,
    pages: shop.pages.map((page) => ({ title: page.title, slug: page.slug })),
    categories: groupProductsByCategory(shop.products).map((group) => group.label),
    quoteUrl: `${getAppUrl()}${shopQuotePath(shop.orgSlug, shop.doc.shop.slug)}`,
    origin: getAppUrl(),
    orgSlug: shop.orgSlug,
    shopSlug: shop.doc.shop.slug,
  });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
