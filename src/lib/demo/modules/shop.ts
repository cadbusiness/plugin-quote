import { DEMO_ORG, DEMO_SHOP_ALIASES, DEMO_SHOP_SLUG } from "@/lib/demo/constants";
import { pickPreferredBySlug } from "@/lib/demo/public-slugs";
import { insertShopFromTemplate } from "@/lib/shops/create";
import type { SeedModule } from "@/lib/demo/types";

export const shopModule: SeedModule = {
  id: "shop",
  title: "Boutique native",
  async run(ctx) {
    const { data: byAlias, error: aliasError } = await ctx.supabase
      .from("shops")
      .select("id, slug, status")
      .eq("organization_id", ctx.org.id)
      .in("slug", [...DEMO_SHOP_ALIASES]);
    if (aliasError) throw aliasError;
    let existing = pickPreferredBySlug(byAlias, DEMO_SHOP_ALIASES);
    if (!existing) {
      const { data: byName } = await ctx.supabase
        .from("shops")
        .select("id, slug, status")
        .eq("organization_id", ctx.org.id)
        .eq("name", "Vitrine rayonnage")
        .maybeSingle();
      existing = byName;
    }

    if (existing) {
      const { error } = await ctx.supabase
        .from("shops")
        .update({
          slug: DEMO_SHOP_SLUG,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;
      return {
        module: "shop",
        action: "updated",
        detail: `/b/${ctx.org.slug}/${DEMO_SHOP_SLUG}`,
      };
    }

    const created = await insertShopFromTemplate(ctx.supabase, ctx.org.id, ctx.org.name, {
      name: "Vitrine rayonnage",
      sector: DEMO_ORG.family,
      configuratorId: ctx.funnel?.id ?? null,
      createCatalogFunnel: false,
      legal: {
        company: DEMO_ORG.name,
        siret: "000 000 000 00000",
        address: "12 rue du Devis",
        city: "Lyon",
        postalCode: "69002",
        email: DEMO_ORG.salesEmail,
        phone: DEMO_ORG.salesPhone,
        director: "Équipe démo",
      },
    });
    if (!created) throw new Error("Impossible de créer la boutique démo");

    const { error } = await ctx.supabase
      .from("shops")
      .update({
        slug: DEMO_SHOP_SLUG,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", created.id);
    if (error) throw error;

    return {
      module: "shop",
      action: "created",
      detail: `/b/${ctx.org.slug}/${DEMO_SHOP_SLUG}`,
    };
  },
};
