import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { uniqueSlug } from "@/lib/org/slug";
import { emptyMemberBlock } from "@/lib/members/blocks";
import { DEFAULT_MEMBER_THEME } from "@/lib/members/parse";
import { asJson, newMemberId, type MemberBlock, type MemberPageKind, type MemberTheme } from "@/lib/members/types";

export type CreateMemberSpaceInput = {
  name: string;
  includeDocuments: boolean;
  includePlugins: boolean;
  theme?: Partial<MemberTheme>;
};

export function parseCreateMemberSpaceForm(formData: FormData): CreateMemberSpaceInput | null {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return null;
  return {
    name,
    includeDocuments: formData.get("documents") === "on",
    includePlugins: formData.get("plugins") === "on",
  };
}

function page(
  kind: MemberPageKind,
  slug: string,
  title: string,
  blocks: MemberBlock[],
  sortOrder: number,
) {
  return { kind, slug, title, blocks, sortOrder };
}

export function buildMemberSpaceBlueprint(input: CreateMemberSpaceInput & { orgName: string }) {
  const theme: MemberTheme = {
    ...DEFAULT_MEMBER_THEME,
    ...input.theme,
    welcomeHeading: input.theme?.welcomeHeading || `Espace devis ${input.orgName}`,
  };
  const homeBlocks: MemberBlock[] = [
    emptyMemberBlock("hero"),
    emptyMemberBlock("quotes"),
  ];
  if (input.includeDocuments) homeBlocks.push(emptyMemberBlock("documents"));
  if (input.includePlugins) homeBlocks.push(emptyMemberBlock("plugins"));
  homeBlocks.push(emptyMemberBlock("text"));

  const pages = [page("home", "accueil", "Accueil", homeBlocks, 0), page("quotes", "devis", "Mes devis", [emptyMemberBlock("quotes")], 1)];
  if (input.includeDocuments || input.includePlugins) {
    const blocks: MemberBlock[] = [];
    if (input.includeDocuments) blocks.push(emptyMemberBlock("documents"));
    if (input.includePlugins) blocks.push(emptyMemberBlock("plugins"));
    pages.push(page("documents", "documents", "Documents", blocks, 2));
  }

  const resources = [
    ...(input.includeDocuments
      ? [
          {
            id: newMemberId(),
            kind: "document" as const,
            title: "Guide projet",
            description: "Ce que nous avons besoin pour chiffrer : plans, photos, contraintes.",
            href: "",
            isPublished: true,
            sortOrder: 0,
          },
        ]
      : []),
    ...(input.includePlugins
      ? [
          {
            id: newMemberId(),
            kind: "plugin" as const,
            title: "Liste de devis WordPress",
            description: "Si vous avez le plugin QuoteBuilder, vos clients y voient aussi leurs demandes.",
            href: "",
            isPublished: true,
            sortOrder: 1,
          },
        ]
      : []),
  ];

  return { name: input.name, theme, pages, resources };
}

export async function insertMemberSpaceFromTemplate(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  orgName: string,
  input: CreateMemberSpaceInput,
) {
  const blueprint = buildMemberSpaceBlueprint({ ...input, orgName });
  const slug = await uniqueSlug(async (candidate) => {
    const { data } = await supabase
      .from("member_spaces")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  }, input.name);

  const { data: space, error } = await supabase
    .from("member_spaces")
    .insert({
      organization_id: organizationId,
      name: blueprint.name,
      slug,
      status: "draft",
      theme: asJson(blueprint.theme),
    })
    .select("id, slug")
    .single();
  if (error || !space) return null;

  const { error: pagesError } = await supabase.from("member_space_pages").insert(
    blueprint.pages.map((item) => ({
      organization_id: organizationId,
      space_id: space.id,
      kind: item.kind,
      slug: item.slug,
      title: item.title,
      blocks: asJson(item.blocks),
      is_published: true,
      sort_order: item.sortOrder,
    })),
  );
  if (pagesError) return null;

  if (blueprint.resources.length) {
    await supabase.from("member_space_resources").insert(
      blueprint.resources.map((item, index) => ({
        id: item.id,
        organization_id: organizationId,
        space_id: space.id,
        kind: item.kind,
        title: item.title,
        description: item.description,
        href: item.href,
        is_published: item.isPublished,
        sort_order: item.sortOrder ?? index,
      })),
    );
  }

  return space;
}
