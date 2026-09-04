"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { parseProductCsv } from "@/lib/catalog/csv";
import { parseConditions } from "@/lib/catalog/rules";
import { parseProductAttributes } from "@/lib/catalog/attributes";
import { readPriceRange } from "@/lib/catalog/product-form";
import { uploadCatalogImage } from "@/lib/catalog/upload";
import type { Json } from "@/lib/db/database.types";
import { createClient } from "@/lib/supabase/server";

export type ProductFormState = { error?: string };

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

function readTags(formData: FormData) {
  return String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function firstConfiguratorId(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configurators")
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const ctx = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Donnez un nom au produit." };

  const configuratorId =
    String(formData.get("configurator_id") ?? "") || (await firstConfiguratorId(ctx.organization.id));
  if (!configuratorId) {
    return { error: "Créez d'abord un funnel : le catalogue s'y rattache." };
  }

  const { priceMin, priceMax } = readPriceRange(formData);
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      organization_id: ctx.organization.id,
      configurator_id: configuratorId,
      source: "manual",
      name,
      sku: String(formData.get("sku") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      price_min: priceMin,
      price_max: priceMax,
      currency: String(formData.get("currency") ?? "EUR").trim() || "EUR",
      image_url: imageUrl,
      images: (imageUrl ? [{ src: imageUrl, alt: null }] : []) as unknown as Json,
      tags: readTags(formData),
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Création impossible." };

  const image = formData.get("image");
  if (image instanceof File && image.size) {
    try {
      const uploaded = await uploadCatalogImage(ctx.organization.id, data.id, image);
      await supabase
        .from("products")
        .update({
          image_url: uploaded,
          images: [{ src: uploaded, alt: null }] as unknown as Json,
        })
        .eq("id", data.id);
    } catch (uploadError) {
      return { error: uploadError instanceof Error ? uploadError.message : "Image non envoyée." };
    }
  }

  revalidatePath("/produits");
  redirect(`/produits/${data.id}`);
}

export async function updateProduct(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { priceMin, priceMax } = readPriceRange(formData);
  let imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const image = formData.get("image");
  if (image instanceof File && image.size) {
    imageUrl = await uploadCatalogImage(ctx.organization.id, id, image);
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  const gallery = Array.isArray(current?.images) ? [...(current.images as { src?: string }[])] : [];
  if (imageUrl && !gallery.some((item) => item.src === imageUrl)) {
    gallery.unshift({ src: imageUrl, alt: null });
  }

  await supabase
    .from("products")
    .update({
      name: String(formData.get("name") ?? "").trim() || "Produit",
      sku: String(formData.get("sku") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      price_min: priceMin,
      price_max: priceMax,
      currency: String(formData.get("currency") ?? "EUR").trim() || "EUR",
      image_url: imageUrl,
      images: gallery as unknown as Json,
      tags: readTags(formData),
      options: parseProductAttributes(formData) as unknown as Json,
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);

  revalidatePath("/produits");
  revalidatePath(`/produits/${id}`);
}

export async function toggleProduct(productId: string, active: boolean) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ is_active: active, archived_by_sync: false, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits");
  revalidatePath(`/produits/${productId}`);
}

export async function deleteProduct(productId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits");
  redirect("/produits");
}

export async function importProductsCsv(formData: FormData) {
  const ctx = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return;

  const configuratorId =
    String(formData.get("configurator_id") ?? "") || (await firstConfiguratorId(ctx.organization.id));
  if (!configuratorId) return;

  const rows = parseProductCsv(await file.text());
  if (!rows.length) return;

  const supabase = await createClient();

  // Un ré-import ne doit pas dupliquer : on recale sur le SKU quand il existe.
  const skus = rows.map((row) => row.sku).filter((sku): sku is string => Boolean(sku));
  const { data: existing } = skus.length
    ? await supabase
        .from("products")
        .select("id, sku")
        .eq("configurator_id", configuratorId)
        .in("sku", skus)
    : { data: [] };
  const bySku = new Map((existing ?? []).map((product) => [product.sku, product.id]));

  let created = 0;
  let updated = 0;
  const inserts: Record<string, unknown>[] = [];

  for (const row of rows) {
    const payload = {
      name: row.name,
      sku: row.sku,
      description: row.description,
      price_min: row.price_min,
      price_max: row.price_max,
      tags: row.tags,
      category: row.category,
    };
    const existingId = row.sku ? bySku.get(row.sku) : undefined;
    if (existingId) {
      await supabase
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existingId);
      updated += 1;
    } else {
      inserts.push({
        ...payload,
        organization_id: ctx.organization.id,
        configurator_id: configuratorId,
        source: "manual",
      });
      created += 1;
    }
  }

  if (inserts.length) {
    await supabase.from("products").insert(inserts as never);
  }

  await supabase.from("product_imports").insert({
    organization_id: ctx.organization.id,
    source: "csv",
    status: "done",
    row_count: created + updated,
  });

  revalidatePath("/produits");
}

export async function createRule(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const ctx = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Donnez un nom à la règle." };

  const configuratorId = String(formData.get("configurator_id") ?? "");
  if (!configuratorId) return { error: "Choisissez le funnel concerné." };

  const productIds = formData.getAll("product_ids").map(String).filter(Boolean);
  if (!productIds.length) return { error: "Choisissez au moins un produit à proposer." };

  const supabase = await createClient();
  const { error } = await supabase.from("suggestion_rules").insert({
    organization_id: ctx.organization.id,
    configurator_id: configuratorId,
    name,
    headline: String(formData.get("headline") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    priority: Number(formData.get("priority") || 0),
    conditions: parseConditions(formData) as unknown as Json,
    product_ids: productIds,
  });
  if (error) return { error: error.message };

  revalidatePath("/produits/regles");
  return {};
}

export async function toggleRule(ruleId: string, active: boolean) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("suggestion_rules")
    .update({ is_active: active })
    .eq("id", ruleId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits/regles");
}

export async function deleteRule(ruleId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("suggestion_rules")
    .delete()
    .eq("id", ruleId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits/regles");
}

export async function saveRule(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase
    .from("suggestion_rules")
    .update({
      name: String(formData.get("name") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      description: String(formData.get("description") ?? ""),
      price_min: Number(formData.get("price_min") || 0) || null,
      price_max: Number(formData.get("price_max") || 0) || null,
      priority: Number(formData.get("priority") || 0),
      conditions: parseConditions(formData) as unknown as Json,
      product_ids: formData.getAll("product_ids").map(String).filter(Boolean),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits/regles");
}
