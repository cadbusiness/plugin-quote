import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json, Database } from "@/lib/db/database.types";
import { QUICKLY_PLACEHOLDER_NAMES, QUICKLY_PRODUCTS, QUICKLY_RULE_SKUS } from "@/lib/quickly/catalog";

/**
 * Upsert du catalogue Quickly. Aucun e-mail, aucune invitation.
 */
export async function seedQuicklyCatalog(supabase: SupabaseClient<Database>) {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", "quickly")
    .maybeSingle();
  if (orgError) throw new Error(orgError.message);
  if (!org) throw new Error("Organisation quickly introuvable.");

  const { data: funnel, error: funnelError } = await supabase
    .from("configurators")
    .select("id")
    .eq("organization_id", org.id)
    .eq("slug", "rayonnage")
    .maybeSingle();
  if (funnelError) throw new Error(funnelError.message);
  if (!funnel) throw new Error("Funnel rayonnage introuvable pour quickly.");

  let upserted = 0;
  for (const product of QUICKLY_PRODUCTS) {
    const row = {
      name: product.name,
      description: product.description,
      category: product.category,
      tags: product.tags,
      sku: product.sku,
      external_url: product.url,
      options: product.options as unknown as Json,
      source: "manual",
      sync_lock: true,
      is_active: true,
      currency: "EUR",
      price_min: null,
      price_max: null,
      updated_at: new Date().toISOString(),
    };
    const { data: existing, error: findError } = await supabase
      .from("products")
      .select("id")
      .eq("organization_id", org.id)
      .eq("sku", product.sku)
      .maybeSingle();
    if (findError) throw new Error(findError.message);
    if (existing) {
      const { error } = await supabase.from("products").update(row).eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("products").insert({
        ...row,
        organization_id: org.id,
        configurator_id: funnel.id,
      });
      if (error) throw new Error(error.message);
    }
    upserted += 1;
  }

  const { data: retired, error: retireError } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("organization_id", org.id)
    .is("sku", null)
    .in("name", [...QUICKLY_PLACEHOLDER_NAMES])
    .select("id");
  if (retireError) throw new Error(retireError.message);

  const skus = [...new Set(QUICKLY_RULE_SKUS.flatMap((rule) => rule.skus))];
  const { data: linked, error: linkError } = await supabase
    .from("products")
    .select("id, sku")
    .eq("organization_id", org.id)
    .in("sku", skus);
  if (linkError) throw new Error(linkError.message);
  const idBySku = new Map((linked ?? []).map((product) => [product.sku, product.id]));

  let rules = 0;
  for (const rule of QUICKLY_RULE_SKUS) {
    const productIds = rule.skus.map((sku) => idBySku.get(sku)).filter((id): id is string => Boolean(id));
    if (!productIds.length) continue;
    const { error } = await supabase
      .from("suggestion_rules")
      .update({ product_ids: productIds })
      .eq("organization_id", org.id)
      .eq("name", rule.name);
    if (error) throw new Error(error.message);
    rules += 1;
  }

  return { upserted, deactivated: retired?.length ?? 0, rules };
}
