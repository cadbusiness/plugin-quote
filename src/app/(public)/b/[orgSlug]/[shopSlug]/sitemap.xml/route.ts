import { loadPublicShop } from "@/lib/shops/public";
import { sitemapEntries } from "@/lib/shops/seo";
import { getAppUrl } from "@/lib/supabase/env";

type Ctx = { params: Promise<{ orgSlug: string; shopSlug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadPublicShop(orgSlug, shopSlug);
  if (!shop) return new Response("Not found", { status: 404 });
  const entries = sitemapEntries({
    origin: getAppUrl(),
    orgSlug: shop.orgSlug,
    shopSlug: shop.doc.shop.slug,
    pages: shop.pages,
    products: shop.products,
    updatedAt: shop.doc.shop.updated_at,
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod.slice(0, 10)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
