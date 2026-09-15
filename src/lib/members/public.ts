import { cache } from "react";
import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";
import { getAppUrl } from "@/lib/supabase/env";
import { pageFromRow, parseStatus, parseTheme, resourceFromRow } from "@/lib/members/parse";
import { memberSpaceAbsoluteUrl } from "@/lib/members/urls";
import type { MemberPageDraft, MemberResourceDraft, MemberTheme } from "@/lib/members/types";

export type PublicMemberSpace = {
  orgSlug: string;
  orgName: string;
  spaceId: string;
  organizationId: string;
  name: string;
  slug: string;
  theme: MemberTheme;
  pages: MemberPageDraft[];
  resources: MemberResourceDraft[];
};

export const loadPublicMemberSpace = cache(async function loadPublicMemberSpace(
  orgSlug: string,
  spaceSlug: string,
  opts?: { allowDraft?: boolean },
): Promise<PublicMemberSpace | null> {
  const supabase = createServiceClient();
  const { data: org } = await supabase.from("organizations").select("id, name, slug").eq("slug", orgSlug).maybeSingle();
  if (!org) return null;
  const { data: space, error } = await supabase
    .from("member_spaces")
    .select("*")
    .eq("organization_id", org.id)
    .eq("slug", spaceSlug)
    .maybeSingle();
  if (error || !space) return null;
  const status = parseStatus(space.status);
  if (status === "archived") return null;
  if (status !== "published" && !opts?.allowDraft) return null;

  const [{ data: pages }, { data: resources }] = await Promise.all([
    supabase.from("member_space_pages").select("*").eq("space_id", space.id).order("sort_order", { ascending: true }),
    supabase.from("member_space_resources").select("*").eq("space_id", space.id).order("sort_order", { ascending: true }),
  ]);

  return {
    orgSlug: org.slug,
    orgName: org.name,
    spaceId: space.id,
    organizationId: org.id,
    name: space.name,
    slug: space.slug,
    theme: parseTheme(space.theme),
    pages: (pages ?? []).filter((page) => page.is_published).map(pageFromRow),
    resources: (resources ?? []).filter((row) => row.is_published).map(resourceFromRow),
  };
});

export async function publishedMemberSpaceUrl(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  origin = getAppUrl(),
): Promise<string | null> {
  const [{ data: org }, { data: space, error }] = await Promise.all([
    supabase.from("organizations").select("slug").eq("id", organizationId).maybeSingle(),
    supabase
      .from("member_spaces")
      .select("slug")
      .eq("organization_id", organizationId)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (error || !org || !space) return null;
  return memberSpaceAbsoluteUrl(origin, org.slug, space.slug);
}

export async function memberSpaceMetadata(
  orgSlug: string,
  spaceSlug: string,
  pageSlug?: string,
): Promise<Metadata> {
  const space = await loadPublicMemberSpace(orgSlug, spaceSlug);
  const robots = { index: false, follow: false };
  if (!space) return { title: "Espace membres", robots };
  const page = pageSlug
    ? space.pages.find((item) => item.slug === pageSlug)
    : space.pages.find((item) => item.kind === "home");
  const title =
    page && page.kind !== "home" && page.slug !== "accueil" ? `${page.title} · ${space.name}` : space.name;
  return {
    title,
    description: space.theme.welcomeSub || `Espace devis ${space.orgName}`,
    robots,
  };
}
