"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { parseProductCsv, type CsvProductRow } from "@/lib/catalog/csv";
import { sanitizeProductHtml } from "@/lib/catalog/html";
import { parseGallery, withCover, withoutImage } from "@/lib/catalog/media";
import { parseConditions } from "@/lib/catalog/rules";
import { parseProductAttributes } from "@/lib/catalog/attributes";
import { readPriceRange } from "@/lib/catalog/product-form";
import { uploadCatalogImage } from "@/lib/catalog/upload";
import type { Json } from "@/lib/db/database.types";
import type { ProductImage } from "@/lib/integrations/types";
import { parseSettings, type ConnectionSettings } from "@/lib/integrations/types";
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
  const supabase = await createClient();

  await supabase
    .from("products")
    .update({
      name: String(formData.get("name") ?? "").trim() || "Produit",
      sku: String(formData.get("sku") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      description: sanitizeProductHtml(String(formData.get("description") ?? "")) || null,
      price_min: priceMin,
      price_max: priceMax,
      currency: String(formData.get("currency") ?? "EUR").trim() || "EUR",
      tags: readTags(formData),
      options: parseProductAttributes(formData) as unknown as Json,
      is_active: formData.get("is_active") === "on",
      sync_lock: formData.get("sync_lock") === "on",
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

export type CsvImportState = { error?: string; created?: number; updated?: number; skipped?: number };

export async function importProductRows(
  configuratorId: string,
  rows: CsvProductRow[],
): Promise<CsvImportState> {
  const ctx = await requireAdmin();
  const funnelId = configuratorId || (await firstConfiguratorId(ctx.organization.id));
  if (!funnelId) return { error: "Créez d'abord un funnel : le catalogue s'y rattache." };
  if (!rows.length) return { error: "Aucune ligne à importer." };

  const supabase = await createClient();
  const skus = rows.map((row) => row.sku).filter((sku): sku is string => Boolean(sku));
  const { data: existing } = skus.length
    ? await supabase
        .from("products")
        .select("id, sku")
        .eq("configurator_id", funnelId)
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
        configurator_id: funnelId,
        source: "csv",
      });
      created += 1;
    }
  }

  if (inserts.length) {
    const { error } = await supabase.from("products").insert(inserts as never);
    if (error) return { error: error.message, created, updated };
  }

  await supabase.from("product_imports").insert({
    organization_id: ctx.organization.id,
    source: "csv",
    status: "done",
    row_count: created + updated,
  });

  revalidatePath("/produits");
  return { created, updated };
}

export async function importProductsCsv(formData: FormData): Promise<CsvImportState> {
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choisissez un fichier CSV." };
  const configuratorId = String(formData.get("configurator_id") ?? "");
  return importProductRows(configuratorId, parseProductCsv(await file.text()));
}

async function loadGallery(productId: string, organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("images, image_url")
    .eq("id", productId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  return { supabase, images: parseGallery(data?.images, data?.image_url) };
}

async function saveGallery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  organizationId: string,
  images: ProductImage[],
) {
  await supabase
    .from("products")
    .update({
      images: images as unknown as Json,
      image_url: images[0]?.src ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("organization_id", organizationId);
  revalidatePath("/produits");
  revalidatePath(`/produits/${productId}`);
  return { images };
}

export async function addProductImages(formData: FormData): Promise<{ images?: ProductImage[]; error?: string }> {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const files = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  if (!id || !files.length) return { error: "Ajoutez au moins une image." };
  const { supabase, images } = await loadGallery(id, ctx.organization.id);
  try {
    for (const file of files) {
      const url = await uploadCatalogImage(ctx.organization.id, id, file);
      if (!images.some((image) => image.src === url)) images.push({ src: url, alt: null });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Image non envoyée." };
  }
  return saveGallery(supabase, id, ctx.organization.id, images);
}

export async function removeProductImage(productId: string, src: string) {
  const ctx = await requireAdmin();
  const { supabase, images } = await loadGallery(productId, ctx.organization.id);
  return saveGallery(supabase, productId, ctx.organization.id, withoutImage(images, src));
}

export async function setProductCover(productId: string, src: string) {
  const ctx = await requireAdmin();
  const { supabase, images } = await loadGallery(productId, ctx.organization.id);
  return saveGallery(supabase, productId, ctx.organization.id, withCover(images, src));
}

export async function uploadDescriptionImage(productId: string, formData: FormData): Promise<{ url?: string; error?: string }> {
  const ctx = await requireAdmin();
  const file = formData.get("image");
  if (!(file instanceof File) || !file.size) return { error: "Choisissez une image." };
  try {
    const url = await uploadCatalogImage(ctx.organization.id, productId, file);
    const { supabase, images } = await loadGallery(productId, ctx.organization.id);
    if (!images.some((image) => image.src === url)) {
      await saveGallery(supabase, productId, ctx.organization.id, [...images, { src: url, alt: null }]);
    }
    return { url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Image non envoyée." };
  }
}

export async function updateSyncPolicy(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("catalog_connections")
    .select("settings")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!existing) return;
  const settings: ConnectionSettings = {
    ...parseSettings(existing.settings),
    pullFromStore: formData.get("pullFromStore") === "on",
    pushToStore: formData.get("pushToStore") === "on",
    protectLocalEdits: formData.get("protectLocalEdits") === "on",
  };
  await supabase
    .from("catalog_connections")
    .update({ settings: settings as unknown as Json, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits");
  revalidatePath("/produits/import");
  revalidatePath(`/integrations/${id}`);
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
