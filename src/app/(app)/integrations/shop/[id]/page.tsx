import { notFound, redirect } from "next/navigation";
import { ShopEditor } from "@/components/shops/shop-editor";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { loadShopDocument, loadShopProducts } from "@/lib/shops/document";
import { navFromRow, pageFromRow, parseLegal, parsePageSeo, parseSeo, parseTheme } from "@/lib/shops/parse";
import { shopAbsoluteUrl } from "@/lib/shops/urls";
import { getAppUrl } from "@/lib/supabase/env";
import { resolveQuoteMode } from "@/lib/quotes/quote-mode";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export default async function ShopEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const { id } = await params;
  const supabase = await createClient();
  const doc = await loadShopDocument(supabase, ctx.organization.id, id);
  if (!doc) notFound();
  const products = await loadShopProducts(supabase, ctx.organization.id, doc.shop.configurator_id);
  const { data: funnel } = doc.shop.configurator_id
    ? await supabase
        .from("configurators")
        .select("name, slug, theme")
        .eq("id", doc.shop.configurator_id)
        .maybeSingle()
    : { data: null };
  const theme = parseTheme(doc.shop.theme);
  const publicUrl = shopAbsoluteUrl(getAppUrl(), ctx.organization.slug, doc.shop.slug);

  return (
    <ShopEditor
      shop={{
        id: doc.shop.id,
        name: doc.shop.name,
        slug: doc.shop.slug,
        status: doc.shop.status,
        theme,
        seo: parseSeo(doc.shop.seo, doc.shop.name),
        legal: parseLegal(doc.shop.legal),
        seedPrompt: theme.seedPrompt,
      }}
      pages={doc.pages.map((page) => {
        const draft = pageFromRow(page);
        return {
          id: page.id,
          slug: draft.slug,
          title: draft.title,
          kind: draft.kind,
          seo: parsePageSeo(page.seo, page.title),
          blocks: draft.blocks,
          isPublished: draft.isPublished,
          sortOrder: draft.sortOrder,
        };
      })}
      nav={doc.nav.map(navFromRow)}
      products={products}
      publicUrl={publicUrl}
      funnelName={funnel?.name ?? null}
      funnelSlug={funnel?.slug ?? null}
      linkedQuoteMode={resolveQuoteMode({ configuratorTheme: funnel?.theme })}
      orgName={ctx.organization.name}
      orgSlug={ctx.organization.slug}
    />
  );
}
