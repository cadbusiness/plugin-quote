"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { insertMemberSpaceFromTemplate, parseCreateMemberSpaceForm } from "@/lib/members/create";
import { loadMemberSpaceDocument, persistMemberSpaceDocument } from "@/lib/members/document";
import { asJson } from "@/lib/members/types";
import { uploadMemberDoc } from "@/lib/members/upload";
import { memberSpaceBasePath } from "@/lib/members/urls";
import {
  memberStatusAfterArchiveToggle,
  parsePageDraft,
  parseResourceDraft,
  parseStatus,
  parseTheme,
} from "@/lib/members/parse";
import { createClient } from "@/lib/supabase/server";

function revalidateSpace(orgSlug: string, spaceSlug: string, spaceId?: string) {
  revalidatePath("/membres");
  if (spaceId) revalidatePath(`/membres/${spaceId}`);
  const publicPath = memberSpaceBasePath(orgSlug, spaceSlug);
  revalidatePath(publicPath);
  revalidatePath(publicPath, "layout");
}

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

export async function createMemberSpace(formData: FormData): Promise<{ error?: string } | void> {
  const ctx = await requireAdmin();
  const input = parseCreateMemberSpaceForm(formData);
  if (!input) return { error: "Donnez un nom d’au moins 2 caractères." };
  const supabase = await createClient();
  const space = await insertMemberSpaceFromTemplate(supabase, ctx.organization.id, ctx.organization.name, input);
  if (!space) {
    return {
      error:
        "Impossible de créer l’espace. Vérifiez que la migration 0040_member_spaces est appliquée sur Supabase.",
    };
  }
  revalidateSpace(ctx.organization.slug, space.slug, space.id);
  redirect(`/membres/${space.id}`);
}

export async function uploadMemberResource(formData: FormData): Promise<{ url?: string; error?: string }> {
  const ctx = await requireAdmin();
  const spaceId = String(formData.get("spaceId") ?? "");
  const file = formData.get("file");
  if (!spaceId || !(file instanceof File) || !file.size) return { error: "Choisissez un fichier." };
  const supabase = await createClient();
  const { data: space } = await supabase
    .from("member_spaces")
    .select("id")
    .eq("id", spaceId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!space) return { error: "Espace introuvable" };
  try {
    const url = await uploadMemberDoc(ctx.organization.id, spaceId, file);
    return { url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload impossible." };
  }
}

export async function saveMemberSpace(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const doc = await loadMemberSpaceDocument(supabase, ctx.organization.id, id);
  if (!doc) return { error: "Espace introuvable" };

  doc.space.name = String(formData.get("name") ?? doc.space.name).trim() || doc.space.name;
  const status = parseStatus(formData.get("status"));
  doc.space.status = status;
  if (status === "published" && !doc.space.published_at) doc.space.published_at = new Date().toISOString();
  doc.space.theme = asJson(parseTheme(JSON.parse(String(formData.get("theme") ?? "{}"))));

  const pagesRaw = JSON.parse(String(formData.get("pages") ?? "[]")) as unknown[];
  const pages = Array.isArray(pagesRaw)
    ? pagesRaw.map((item, index) => parsePageDraft(item, index)).filter((item) => item !== null)
    : [];
  const resourcesRaw = JSON.parse(String(formData.get("resources") ?? "[]")) as unknown[];
  const resources = Array.isArray(resourcesRaw)
    ? resourcesRaw.map((item, index) => parseResourceDraft(item, index)).filter((item) => item !== null)
    : [];

  await persistMemberSpaceDocument(supabase, ctx.organization.id, doc, { pages, resources });
  revalidateSpace(ctx.organization.slug, doc.space.slug, id);
  return { ok: true };
}

export async function publishMemberSpace(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("status") ?? "published");
  const supabase = await createClient();
  const { data: space } = await supabase
    .from("member_spaces")
    .update({
      status: next === "draft" ? "draft" : "published",
      published_at: next === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .select("slug")
    .maybeSingle();
  revalidateSpace(ctx.organization.slug, space?.slug ?? id, id);
}

export async function setMemberSpaceArchived(spaceId: string) {
  const ctx = await requireAdmin();
  if (!spaceId) return;
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("member_spaces")
    .select("slug, status, published_at")
    .eq("id", spaceId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!current) return;
  const next = memberStatusAfterArchiveToggle(current.status, current.published_at);
  const { data: space } = await supabase
    .from("member_spaces")
    .update({
      status: next,
      published_at: next === "published" ? current.published_at ?? new Date().toISOString() : current.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", spaceId)
    .eq("organization_id", ctx.organization.id)
    .select("slug")
    .maybeSingle();
  revalidateSpace(ctx.organization.slug, space?.slug ?? current.slug, spaceId);
}

export async function removeMemberSpace(spaceId: string) {
  const ctx = await requireAdmin();
  if (!spaceId) return;
  const supabase = await createClient();
  const { data: space } = await supabase
    .from("member_spaces")
    .select("slug")
    .eq("id", spaceId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  await supabase.from("member_spaces").delete().eq("id", spaceId).eq("organization_id", ctx.organization.id);
  if (space?.slug) revalidateSpace(ctx.organization.slug, space.slug, spaceId);
  else revalidatePath("/membres");
  redirect("/membres");
}
