import type { Json } from "@/lib/db/database.types";
import { mergeOrgFamily } from "@/lib/funnels/families";
import { DEMO_ORG, DEMO_SEED_VERSION } from "@/lib/demo/constants";
import type { DemoClient, DemoOrg, SeedModule, SeedModuleResult } from "@/lib/demo/types";

function demoBranding(existing: Json | null): Json {
  const merged = mergeOrgFamily(existing, DEMO_ORG.family);
  const base =
    merged && typeof merged === "object" && !Array.isArray(merged)
      ? { ...(merged as Record<string, unknown>) }
      : {};
  return {
    ...base,
    accent: DEMO_ORG.accent,
    logoText: "QB Démo",
    demoSeed: { version: DEMO_SEED_VERSION, slug: DEMO_ORG.slug },
  } as Json;
}

export async function ensureDemoOrg(supabase: DemoClient): Promise<{ org: DemoOrg; created: boolean }> {
  const { data: existing, error: readError } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", DEMO_ORG.slug)
    .maybeSingle();
  if (readError) throw readError;

  const patch = {
    name: DEMO_ORG.name,
    plan: DEMO_ORG.plan,
    sales_name: DEMO_ORG.salesName,
    sales_email: DEMO_ORG.salesEmail,
    sales_phone: DEMO_ORG.salesPhone,
    branding: demoBranding(existing?.branding ?? null),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("organizations")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error || !data) throw error ?? new Error("Impossible de mettre à jour l’org démo");
    return { org: data, created: false };
  }

  const { data, error } = await supabase
    .from("organizations")
    .insert({ slug: DEMO_ORG.slug, ...patch })
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("Impossible de créer l’org démo");
  return { org: data, created: true };
}

export const orgModule: SeedModule = {
  id: "org",
  title: "Organisation démo",
  async run(ctx) {
    const { data } = await ctx.supabase.from("pdf_templates").select("id").eq("organization_id", ctx.org.id).limit(1);
    const results: SeedModuleResult[] = [
      { module: "org", action: "updated", detail: `${ctx.org.name} (${ctx.org.slug}) v${DEMO_SEED_VERSION}` },
    ];
    if (!data?.length) {
      const { error } = await ctx.supabase.from("pdf_templates").insert({
        organization_id: ctx.org.id,
        title: "Récapitulatif de votre configuration",
        intro:
          "Voici la synthèse de votre projet. Les prix sont des fourchettes indicatives, hors pose et hors options spécifiques.",
        footer: "QuoteBuilder Démo — Devis indicatif, non contractuel.",
      });
      if (error) throw error;
      results.push({ module: "org", action: "created", detail: "Modèle PDF" });
    }
    return results;
  },
};
