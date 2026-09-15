import { emptyMemberBlock } from "@/lib/members/blocks";
import { newMemberId, type MemberBlock, type MemberPageDraft, type MemberPageKind } from "@/lib/members/types";
import { uniqueMemberPageSlug } from "@/lib/members/urls";

export const MEMBER_PAGE_TEMPLATE_IDS = ["documents", "plugins", "faq", "links", "blank"] as const;
export type MemberPageTemplateId = (typeof MEMBER_PAGE_TEMPLATE_IDS)[number];

export const MEMBER_PAGE_TEMPLATES: {
  id: MemberPageTemplateId;
  label: string;
  blurb: string;
  kind: MemberPageKind;
  defaultTitle: string;
  tint: string;
}[] = [
  {
    id: "documents",
    label: "Documents",
    blurb: "PDF, notices et guides à ouvrir une fois connecté.",
    kind: "documents",
    defaultTitle: "Documents",
    tint: "bg-amber-50 text-amber-900 ring-amber-200",
  },
  {
    id: "plugins",
    label: "Plugins et liens",
    blurb: "Plugin WordPress, outils et ressources pour vos clients.",
    kind: "custom",
    defaultTitle: "Plugins et liens",
    tint: "bg-violet-50 text-violet-900 ring-violet-200",
  },
  {
    id: "faq",
    label: "Comment ça marche",
    blurb: "Texte d’aide : connexion, PIN, où retrouver ses devis.",
    kind: "custom",
    defaultTitle: "Comment ça marche",
    tint: "bg-sky-50 text-sky-900 ring-sky-200",
  },
  {
    id: "links",
    label: "Liens utiles",
    blurb: "Liste de liens (catalogue, site, prise de rendez-vous).",
    kind: "custom",
    defaultTitle: "Liens utiles",
    tint: "bg-orange-50 text-orange-900 ring-orange-200",
  },
  {
    id: "blank",
    label: "Page vide",
    blurb: "Un bloc texte, à remplir dans le constructeur.",
    kind: "custom",
    defaultTitle: "Nouvelle page",
    tint: "bg-slate-50 text-slate-800 ring-slate-200",
  },
];

export function isLockedMemberPage(page: { kind: string; slug: string }) {
  return page.kind === "home" || page.kind === "quotes" || page.slug === "accueil" || page.slug === "devis";
}

function textBlock(heading: string, text: string): MemberBlock {
  return { ...emptyMemberBlock("text"), heading, text };
}

export function blocksForMemberPageTemplate(id: MemberPageTemplateId): MemberBlock[] {
  if (id === "documents") {
    return [
      emptyMemberBlock("documents"),
      textBlock(
        "À fournir",
        "Plans, photos et contraintes : déposez-les ici ou depuis le suivi de chaque devis.",
      ),
    ];
  }
  if (id === "plugins") {
    return [emptyMemberBlock("plugins")];
  }
  if (id === "faq") {
    return [
      textBlock(
        "Comment ça marche",
        "Connectez-vous avec l’e-mail du devis et le code PIN reçu. Toutes vos demandes de cette enseigne apparaissent ensuite ici.",
      ),
    ];
  }
  if (id === "links") {
    const block = emptyMemberBlock("links");
    return [
      {
        ...block,
        heading: "Liens utiles",
        links: [
          { label: "Notre catalogue", href: "https://" },
          { label: "Nous contacter", href: "https://" },
        ],
      },
    ];
  }
  return [emptyMemberBlock("text")];
}

export function parseMemberPageTemplateId(value: unknown): MemberPageTemplateId | null {
  const raw = typeof value === "string" ? value : "";
  return (MEMBER_PAGE_TEMPLATE_IDS as readonly string[]).includes(raw) ? (raw as MemberPageTemplateId) : null;
}

export function buildMemberPageFromTemplate(
  templateId: string,
  pages: { id: string; slug: string }[],
  title?: string,
): MemberPageDraft | null {
  const id = parseMemberPageTemplateId(templateId);
  if (!id) return null;
  const template = MEMBER_PAGE_TEMPLATES.find((item) => item.id === id);
  if (!template) return null;
  const resolvedTitle = title?.trim() || template.defaultTitle;
  return {
    id: newMemberId(),
    kind: template.kind,
    slug: uniqueMemberPageSlug(pages, resolvedTitle),
    title: resolvedTitle,
    blocks: blocksForMemberPageTemplate(id),
    isPublished: true,
    sortOrder: pages.length,
  };
}
