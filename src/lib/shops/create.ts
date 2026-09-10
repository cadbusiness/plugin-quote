import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { insertFunnelFromTemplate } from "@/lib/funnels/create";
import { catalogDefaultName } from "@/lib/funnels/kind";
import { getFunnelFamily, isFunnelFamilyId } from "@/lib/funnels/families";
import { defaultTemplateForFamily } from "@/lib/funnels/templates";
import { uniqueSlug } from "@/lib/org/slug";
import { blocksJson } from "@/lib/shops/blocks";
import { asJson, type ShopBlueprint, type ShopLegal } from "@/lib/shops/types";
import { buildShopBlueprint } from "@/lib/shops/templates";
import { parseLegal } from "@/lib/shops/parse";

export type CreateShopInput = {
  name: string;
  sector: string;
  configuratorId: string | null;
  createCatalogFunnel: boolean;
  legal: Partial<ShopLegal>;
  seedPrompt?: string;
};

export function parseCreateShopForm(formData: FormData): CreateShopInput | null {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return null;
  const sectorRaw = String(formData.get("sector") ?? "custom");
  const sector = isFunnelFamilyId(sectorRaw) ? sectorRaw : "custom";
  const catalogFrom = String(formData.get("configurator_id") ?? "").trim();
  const createCatalogFunnel = formData.get("create_funnel") === "on" || !catalogFrom;
  return {
    name,
    sector,
    configuratorId: catalogFrom || null,
    createCatalogFunnel: createCatalogFunnel && !catalogFrom,
    legal: parseLegal({
      company: String(formData.get("company") ?? "").trim(),
      siret: String(formData.get("siret") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      postalCode: String(formData.get("postalCode") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      director: String(formData.get("director") ?? "").trim(),
    }),
    seedPrompt: String(formData.get("seed_prompt") ?? "").trim() || undefined,
  };
}

export async function insertShopFromTemplate(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  orgName: string,
  input: CreateShopInput,
) {
  const family = getFunnelFamily(input.sector);
  const funnelTemplate = defaultTemplateForFamily(family.id);
  const blueprint = buildShopBlueprint({
    name: input.name,
    sector: family.id,
    orgName,
    legal: input.legal,
  });
  if (input.seedPrompt) {
    blueprint.theme.seedPrompt = input.seedPrompt;
  }

  let configuratorId = input.configuratorId;
  if (!configuratorId && input.createCatalogFunnel) {
    const funnel = await insertFunnelFromTemplate(supabase, organizationId, {
      name: catalogDefaultName(input.name),
      sector: funnelTemplate.id,
      kind: "catalog",
      wizardEnabled: true,
      chatEnabled: false,
      screens: ["suggestions", "customize", "contact"],
      catalogFromId: null,
    });
    configuratorId = funnel?.id ?? null;
  }

  const slug = await uniqueSlug(async (candidate) => {
    const { data } = await supabase
      .from("shops")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  }, input.name);

  const { data: shop, error } = await supabase
    .from("shops")
    .insert({
      organization_id: organizationId,
      configurator_id: configuratorId,
      name: blueprint.name,
      slug,
      sector: blueprint.sector,
      status: "draft",
      theme: asJson(blueprint.theme),
      seo: asJson(blueprint.seo),
      legal: asJson(blueprint.legal),
    })
    .select("id, slug")
    .single();
  if (error || !shop) return null;

  const { error: pagesError } = await supabase.from("shop_pages").insert(
    blueprint.pages.map((page) => ({
      organization_id: organizationId,
      shop_id: shop.id,
      kind: page.kind,
      slug: page.slug,
      title: page.title,
      seo: asJson(page.seo),
      blocks: blocksJson(page.blocks),
      is_published: page.isPublished,
      sort_order: page.sortOrder,
    })),
  );
  if (pagesError) return null;

  const { error: navError } = await supabase.from("shop_nav_items").insert(
    blueprint.nav.map((item) => ({
      organization_id: organizationId,
      shop_id: shop.id,
      location: item.location,
      label: item.label,
      href: item.href,
      sort_order: item.sortOrder,
    })),
  );
  if (navError) return null;

  return shop;
}

export function blueprintSummary(blueprint: ShopBlueprint) {
  return {
    pages: blueprint.pages.map((page) => page.slug),
    nav: blueprint.nav.map((item) => item.href),
    hasLegal: blueprint.pages.some((page) => page.kind === "legal"),
  };
}
