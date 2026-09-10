import { loadPublicShop } from "@/lib/shops/public";
import { robotsTxt } from "@/lib/shops/seo";
import { getAppUrl } from "@/lib/supabase/env";

export async function GET(_req: Request, { params }: { params: Promise<{ orgSlug: string; shopSlug: string }> }) {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadPublicShop(orgSlug, shopSlug);
  if (!shop) return new Response("Not found", { status: 404 });
  return new Response(robotsTxt(getAppUrl(), shop.orgSlug, shop.doc.shop.slug), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
