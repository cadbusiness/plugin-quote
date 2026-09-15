import type { Json, Tables } from "@/lib/db/database.types";

export const MEMBER_SPACE_STATUSES = ["draft", "published", "archived"] as const;
export type MemberSpaceStatus = (typeof MEMBER_SPACE_STATUSES)[number];

export const MEMBER_PAGE_KINDS = ["home", "quotes", "documents", "custom"] as const;
export type MemberPageKind = (typeof MEMBER_PAGE_KINDS)[number];

export const MEMBER_RESOURCE_KINDS = ["document", "plugin", "link"] as const;
export type MemberResourceKind = (typeof MEMBER_RESOURCE_KINDS)[number];

export const MEMBER_BLOCK_TYPES = ["hero", "text", "quotes", "documents", "plugins", "links"] as const;
export type MemberBlockType = (typeof MEMBER_BLOCK_TYPES)[number];

export type MemberTheme = {
  accent: string;
  background: string;
  text: string;
  welcomeHeading: string;
  welcomeSub: string;
};

export type MemberLinkItem = { label: string; href: string };

export type MemberBlock = {
  id: string;
  type: MemberBlockType;
  heading?: string;
  sub?: string;
  text?: string;
  ctaLabel?: string;
  links?: MemberLinkItem[];
};

export type MemberPageDraft = {
  id: string;
  kind: MemberPageKind;
  slug: string;
  title: string;
  blocks: MemberBlock[];
  isPublished: boolean;
  sortOrder: number;
};

export type MemberResourceDraft = {
  id: string;
  kind: MemberResourceKind;
  title: string;
  description: string;
  href: string;
  isPublished: boolean;
  sortOrder: number;
};

export type MemberSpaceDocument = {
  space: Tables<"member_spaces">;
  pages: Tables<"member_space_pages">[];
  resources: Tables<"member_space_resources">[];
};

export type MemberQuoteCard = {
  id: string;
  createdAt: string;
  contactName: string;
  contactCompany: string | null;
  scoreLabel: string | null;
  statusLabel: string;
  statusSlug: string;
  suiviUrl: string | null;
};

export function asJson<T>(value: T): Json {
  return value as unknown as Json;
}

export function newMemberId() {
  return crypto.randomUUID();
}
