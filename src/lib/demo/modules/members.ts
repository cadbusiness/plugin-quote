import { DEMO_FUNNEL_SLUG, DEMO_MEMBER_SPACE_SLUG, DEMO_ORG, DEMO_SHOP_SLUG } from "@/lib/demo/constants";
import { insertMemberSpaceFromTemplate } from "@/lib/members/create";
import type { DemoClient, SeedModule } from "@/lib/demo/types";

function demoResourceHref(kind: string) {
  if (kind === "plugin" || kind === "link") {
    return `https://www.quotebuilder.co/b/${DEMO_ORG.slug}/${DEMO_SHOP_SLUG}`;
  }
  return `https://www.quotebuilder.co/c/${DEMO_ORG.slug}/${DEMO_FUNNEL_SLUG}`;
}

async function patchDemoResources(supabase: DemoClient, spaceId: string) {
  const { data: resources } = await supabase
    .from("member_space_resources")
    .select("id, kind")
    .eq("space_id", spaceId);
  for (const row of resources ?? []) {
    const plugin = row.kind === "plugin" || row.kind === "link";
    const { error } = await supabase
      .from("member_space_resources")
      .update({
        href: demoResourceHref(row.kind),
        title: plugin ? "Vitrine devis" : "Guide projet",
        description: plugin
          ? "Catalogue public QuoteBuilder, sans paiement."
          : "Ce que nous avons besoin pour chiffrer : plans, photos, contraintes.",
        is_published: true,
      })
      .eq("id", row.id);
    if (error) throw error;
  }
}

export const memberSpaceModule: SeedModule = {
  id: "members",
  title: "Espace membres",
  async run(ctx) {
    const { data: existing, error: existingError } = await ctx.supabase
      .from("member_spaces")
      .select("id, slug, status")
      .eq("organization_id", ctx.org.id)
      .eq("slug", DEMO_MEMBER_SPACE_SLUG)
      .maybeSingle();
    if (existingError) {
      return {
        module: "members",
        action: "skipped",
        detail: "Migration 0040_member_spaces absente",
      };
    }

    if (existing) {
      const { error } = await ctx.supabase
        .from("member_spaces")
        .update({
          name: "Espace devis clients",
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;
      await patchDemoResources(ctx.supabase, existing.id);
      return {
        module: "members",
        action: "updated",
        detail: `/m/${ctx.org.slug}/${DEMO_MEMBER_SPACE_SLUG}`,
      };
    }

    const created = await insertMemberSpaceFromTemplate(ctx.supabase, ctx.org.id, ctx.org.name, {
      name: "Espace devis clients",
      includeDocuments: true,
      includePlugins: true,
    });
    if (!created) throw new Error("Impossible de créer l’espace membres démo");

    const { error } = await ctx.supabase
      .from("member_spaces")
      .update({
        slug: DEMO_MEMBER_SPACE_SLUG,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", created.id);
    if (error) throw error;

    await patchDemoResources(ctx.supabase, created.id);

    return {
      module: "members",
      action: "created",
      detail: `/m/${ctx.org.slug}/${DEMO_MEMBER_SPACE_SLUG}`,
    };
  },
};
