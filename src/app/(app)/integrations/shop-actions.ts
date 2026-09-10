"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { insertShopFromTemplate, parseCreateShopForm } from "@/lib/shops/create";
import { loadShopDocument, persistShopDocument } from "@/lib/shops/document";
import { asJson } from "@/lib/shops/types";
import { parseLayout } from "@/lib/shops/layout";
import { parseLegal, parsePageSeo, parseSeo, parseStatus, parseTheme } from "@/lib/shops/parse";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

export async function createShop(formData: FormData): Promise<{ error?: string } | void> {
  const ctx = await requireAdmin();
  const input = parseCreateShopForm(formData);
  if (!input) return { error: "Donnez un nom d’au moins 2 caractères." };
  const supabase = await createClient();
  const shop = await insertShopFromTemplate(supabase, ctx.organization.id, ctx.organization.name, input);
  if (!shop) {
    return {
      error:
        "Impossible de créer la boutique. Vérifiez que la migration 0021_native_shops est appliquée sur Supabase.",
    };
  }
  revalidatePath("/integrations");
  const chat = input.seedPrompt ? "?chat=1" : "";
  redirect(`/integrations/shop/${shop.id}${chat}`);
}

export async function saveShop(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const doc = await loadShopDocument(supabase, ctx.organization.id, id);
  if (!doc) return { error: "Boutique introuvable" };

  doc.shop.name = String(formData.get("name") ?? doc.shop.name).trim() || doc.shop.name;
  const status = parseStatus(formData.get("status"));
  doc.shop.status = status;
  if (status === "published" && !doc.shop.published_at) doc.shop.published_at = new Date().toISOString();
  doc.shop.theme = asJson(parseTheme(JSON.parse(String(formData.get("theme") ?? "{}"))));
  doc.shop.seo = asJson(parseSeo(JSON.parse(String(formData.get("seo") ?? "{}")), doc.shop.name));
  doc.shop.legal = asJson(parseLegal(JSON.parse(String(formData.get("legal") ?? "{}"))));

  const pagesRaw = JSON.parse(String(formData.get("pages") ?? "[]")) as unknown[];
  if (Array.isArray(pagesRaw) && pagesRaw.length) {
    doc.pages = pagesRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item, index) => {
        const existing = doc.pages.find((page) => page.id === item.id) ?? doc.pages[index];
        return {
          ...(existing ?? doc.pages[0]!),
          id: String(item.id ?? existing?.id ?? ""),
          slug: String(item.slug ?? existing?.slug ?? `page-${index}`),
          title: String(item.title ?? existing?.title ?? "Page"),
          kind: String(item.kind ?? existing?.kind ?? "custom"),
          seo: asJson(parsePageSeo(item.seo, String(item.title ?? ""))),
          blocks: asJson(parseLayout(item.blocks)),
          is_published: item.isPublished !== false && item.is_published !== false,
          sort_order: typeof item.sortOrder === "number" ? item.sortOrder : index,
        };
      });
  }

  const navRaw = JSON.parse(String(formData.get("nav") ?? "[]")) as unknown[];
  if (Array.isArray(navRaw)) {
    doc.nav = navRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item, index) => ({
        id: String(item.id ?? `nav-${index}`),
        organization_id: ctx.organization.id,
        shop_id: doc.shop.id,
        location: String(item.location ?? "header"),
        label: String(item.label ?? ""),
        href: String(item.href ?? "/"),
        sort_order: typeof item.sortOrder === "number" ? item.sortOrder : index,
        created_at: new Date().toISOString(),
      }));
  }

  await persistShopDocument(supabase, ctx.organization.id, doc);
  revalidatePath("/integrations");
  revalidatePath(`/integrations/shop/${id}`);
  return { ok: true };
}

export async function publishShop(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("status") ?? "published");
  const supabase = await createClient();
  await supabase
    .from("shops")
    .update({
      status: next === "draft" ? "draft" : "published",
      published_at: next === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/integrations");
  revalidatePath(`/integrations/shop/${id}`);
}

export async function deleteShop(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("shops").delete().eq("id", id).eq("organization_id", ctx.organization.id);
  revalidatePath("/integrations");
  redirect("/integrations");
}
