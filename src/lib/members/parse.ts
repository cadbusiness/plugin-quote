import {
  MEMBER_BLOCK_TYPES,
  MEMBER_PAGE_KINDS,
  MEMBER_RESOURCE_KINDS,
  MEMBER_SPACE_STATUSES,
  type MemberBlock,
  type MemberBlockType,
  type MemberLinkItem,
  type MemberPageDraft,
  type MemberPageKind,
  type MemberResourceDraft,
  type MemberResourceKind,
  type MemberSpaceStatus,
  type MemberTheme,
} from "@/lib/members/types";

export const DEFAULT_MEMBER_THEME: MemberTheme = {
  accent: "#E85D04",
  background: "#FFFFFF",
  text: "#1A1510",
  headerBackground: "",
  welcomeHeading: "Votre espace devis",
  welcomeSub: "Retrouvez vos demandes, documents et ressources au même endroit.",
};

function obj(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

export function parseStatus(value: unknown): MemberSpaceStatus {
  const raw = str(value, "draft");
  return (MEMBER_SPACE_STATUSES as readonly string[]).includes(raw) ? (raw as MemberSpaceStatus) : "draft";
}

export function parsePageKind(value: unknown): MemberPageKind {
  const raw = str(value, "custom");
  return (MEMBER_PAGE_KINDS as readonly string[]).includes(raw) ? (raw as MemberPageKind) : "custom";
}

export function parseResourceKind(value: unknown): MemberResourceKind {
  const raw = str(value, "link");
  return (MEMBER_RESOURCE_KINDS as readonly string[]).includes(raw) ? (raw as MemberResourceKind) : "link";
}

export function parseBlockType(value: unknown): MemberBlockType | null {
  const raw = str(value);
  return (MEMBER_BLOCK_TYPES as readonly string[]).includes(raw) ? (raw as MemberBlockType) : null;
}

export function parseTheme(value: unknown): MemberTheme {
  const raw = obj(value);
  return {
    accent: str(raw.accent, DEFAULT_MEMBER_THEME.accent) || DEFAULT_MEMBER_THEME.accent,
    background: str(raw.background, DEFAULT_MEMBER_THEME.background) || DEFAULT_MEMBER_THEME.background,
    text: str(raw.text, DEFAULT_MEMBER_THEME.text) || DEFAULT_MEMBER_THEME.text,
    headerBackground: str(raw.headerBackground, DEFAULT_MEMBER_THEME.headerBackground),
    welcomeHeading: str(raw.welcomeHeading, DEFAULT_MEMBER_THEME.welcomeHeading) || DEFAULT_MEMBER_THEME.welcomeHeading,
    welcomeSub: str(raw.welcomeSub, DEFAULT_MEMBER_THEME.welcomeSub),
  };
}

function parseLinks(value: unknown): MemberLinkItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      label: str(item.label).trim() || "Lien",
      href: str(item.href).trim(),
    }))
    .filter((item) => item.href);
}

export function parseBlock(value: unknown): MemberBlock | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const type = parseBlockType(raw.type);
  if (!type) return null;
  const id = str(raw.id) || crypto.randomUUID();
  return {
    id,
    type,
    heading: str(raw.heading) || undefined,
    sub: str(raw.sub) || undefined,
    text: str(raw.text) || undefined,
    ctaLabel: str(raw.ctaLabel) || undefined,
    src: type === "image" || type === "video" ? str(raw.src).trim() || undefined : undefined,
    links: type === "links" ? parseLinks(raw.links) : undefined,
  };
}

export function parseBlocks(value: unknown): MemberBlock[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseBlock).filter((block): block is MemberBlock => Boolean(block));
}

export function pageFromRow(row: {
  id: string;
  kind: string;
  slug: string;
  title: string;
  blocks: unknown;
  is_published: boolean;
  sort_order: number;
}): MemberPageDraft {
  return {
    id: row.id,
    kind: parsePageKind(row.kind),
    slug: row.slug,
    title: row.title,
    blocks: parseBlocks(row.blocks),
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

export function resourceFromRow(row: {
  id: string;
  kind: string;
  title: string;
  description: string;
  href: string;
  is_published: boolean;
  sort_order: number;
}): MemberResourceDraft {
  return {
    id: row.id,
    kind: parseResourceKind(row.kind),
    title: row.title,
    description: row.description,
    href: row.href,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

export function clientQuoteStageLabel(slug: string) {
  if (slug === "won") return "Accepté";
  if (slug === "started") return "Commencée";
  if (slug === "lost") return "Clôturé";
  if (slug === "in_progress" || slug === "waiting") return "Devis envoyé";
  if (slug === "contacted") return "En étude";
  return "Reçu";
}

export function memberStatusAfterArchiveToggle(status: string, publishedAt: string | null): MemberSpaceStatus {
  if (status === "archived") return publishedAt ? "published" : "draft";
  return "archived";
}

export function parsePageDraft(value: unknown, index: number): MemberPageDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const id = str(raw.id);
  if (!id) return null;
  return {
    id,
    kind: parsePageKind(raw.kind),
    slug: str(raw.slug, `page-${index}`) || `page-${index}`,
    title: str(raw.title, "Page") || "Page",
    blocks: parseBlocks(raw.blocks),
    isPublished: bool(raw.isPublished ?? raw.is_published, true),
    sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : index,
  };
}

export function parseResourceDraft(value: unknown, index: number): MemberResourceDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const id = str(raw.id);
  if (!id) return null;
  return {
    id,
    kind: parseResourceKind(raw.kind),
    title: str(raw.title, "Ressource") || "Ressource",
    description: str(raw.description),
    href: str(raw.href),
    isPublished: bool(raw.isPublished ?? raw.is_published, true),
    sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : index,
  };
}
