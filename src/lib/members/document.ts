import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { asJson, type MemberPageDraft, type MemberResourceDraft, type MemberSpaceDocument } from "@/lib/members/types";
import { parseBlocks, parsePageKind, parseResourceKind, parseStatus, parseTheme } from "@/lib/members/parse";

export async function loadMemberSpaceDocument(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  spaceId: string,
): Promise<MemberSpaceDocument | null> {
  const { data: space } = await supabase
    .from("member_spaces")
    .select("*")
    .eq("id", spaceId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!space) return null;
  const [{ data: pages }, { data: resources }] = await Promise.all([
    supabase.from("member_space_pages").select("*").eq("space_id", space.id).order("sort_order", { ascending: true }),
    supabase.from("member_space_resources").select("*").eq("space_id", space.id).order("sort_order", { ascending: true }),
  ]);
  return { space, pages: pages ?? [], resources: resources ?? [] };
}

export async function persistMemberSpaceDocument(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  doc: MemberSpaceDocument,
  drafts: { pages: MemberPageDraft[]; resources: MemberResourceDraft[] },
) {
  const theme = parseTheme(doc.space.theme);
  await supabase
    .from("member_spaces")
    .update({
      name: doc.space.name,
      status: parseStatus(doc.space.status),
      theme: asJson(theme),
      published_at: doc.space.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", doc.space.id)
    .eq("organization_id", organizationId);

  const { data: existingPages } = await supabase.from("member_space_pages").select("id").eq("space_id", doc.space.id);
  const keepPageIds = new Set(drafts.pages.map((page) => page.id));
  for (const row of existingPages ?? []) {
    if (!keepPageIds.has(row.id)) {
      await supabase.from("member_space_pages").delete().eq("id", row.id).eq("space_id", doc.space.id);
    }
  }
  for (const [index, page] of drafts.pages.entries()) {
    const payload = {
      organization_id: organizationId,
      space_id: doc.space.id,
      kind: parsePageKind(page.kind),
      slug: page.slug,
      title: page.title,
      blocks: asJson(parseBlocks(page.blocks)),
      is_published: page.isPublished,
      sort_order: page.sortOrder ?? index,
      updated_at: new Date().toISOString(),
    };
    const exists = (existingPages ?? []).some((row) => row.id === page.id);
    if (exists) {
      await supabase.from("member_space_pages").update(payload).eq("id", page.id).eq("space_id", doc.space.id);
    } else {
      await supabase.from("member_space_pages").insert({ ...payload, id: page.id });
    }
  }

  const { data: existingResources } = await supabase
    .from("member_space_resources")
    .select("id")
    .eq("space_id", doc.space.id);
  const keepResourceIds = new Set(drafts.resources.map((item) => item.id));
  for (const row of existingResources ?? []) {
    if (!keepResourceIds.has(row.id)) {
      await supabase.from("member_space_resources").delete().eq("id", row.id).eq("space_id", doc.space.id);
    }
  }
  for (const [index, resource] of drafts.resources.entries()) {
    const payload = {
      organization_id: organizationId,
      space_id: doc.space.id,
      kind: parseResourceKind(resource.kind),
      title: resource.title,
      description: resource.description,
      href: resource.href,
      is_published: resource.isPublished,
      sort_order: resource.sortOrder ?? index,
      updated_at: new Date().toISOString(),
    };
    const exists = (existingResources ?? []).some((row) => row.id === resource.id);
    if (exists) {
      await supabase.from("member_space_resources").update(payload).eq("id", resource.id).eq("space_id", doc.space.id);
    } else {
      await supabase.from("member_space_resources").insert({ ...payload, id: resource.id });
    }
  }
}
