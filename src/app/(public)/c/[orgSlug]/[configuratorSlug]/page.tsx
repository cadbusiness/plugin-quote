import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { ConfiguratorApp } from "@/components/configurator/configurator-app";
import { FunnelFrame } from "@/components/configurator/funnel-frame";
import { firstChoiceImage, funnelPageMetadata } from "@/lib/configurator/public-funnel";
import type { Database } from "@/lib/db/database.types";
import { shopDevisRedirectFromFunnel, shopHintFromSearch, type ShopSearchParams } from "@/lib/shops/from-shop";
import { loadPublicShop } from "@/lib/shops/public";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { loadDefinition } from "@/lib/wizard/definition";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
  searchParams: Promise<ShopSearchParams>;
};

async function loadMetaDefinition(orgSlug: string, configuratorSlug: string) {
  if (hasServiceRoleKey()) return loadDefinition(createServiceClient(), orgSlug, configuratorSlug);
  const env = requireSupabaseEnv();
  const anon = createClient<Database>(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return loadDefinition(anon, orgSlug, configuratorSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, configuratorSlug } = await params;
  const path = `/c/${orgSlug}/${configuratorSlug}`;
  try {
    const definition = await loadMetaDefinition(orgSlug, configuratorSlug);
    if (!definition) return funnelPageMetadata(null);
    return funnelPageMetadata({
      orgName: definition.organization.name,
      configuratorName: definition.configurator.name,
      subtitle: definition.steps[0]?.subtitle,
      path,
      image: firstChoiceImage(definition.steps),
    });
  } catch {
    return funnelPageMetadata(null);
  }
}

export default async function PublicConfiguratorPage({ params, searchParams }: Props) {
  const { orgSlug, configuratorSlug } = await params;
  const search = await searchParams;
  const shopHint = shopHintFromSearch(search);
  if (shopHint) {
    const shop = await loadPublicShop(orgSlug, shopHint);
    const dest = shopDevisRedirectFromFunnel({
      orgSlug,
      configuratorSlug,
      shopHint,
      shop: shop
        ? { slug: shop.doc.shop.slug, status: shop.doc.shop.status, funnelSlug: shop.funnelSlug }
        : null,
      search,
    });
    if (dest) redirect(dest);
  }
  return (
    <FunnelFrame>
      <ConfiguratorApp orgSlug={orgSlug} configuratorSlug={configuratorSlug} />
    </FunnelFrame>
  );
}
