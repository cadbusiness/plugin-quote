import { slugify } from "@/lib/org/slug";

export const RESERVED_MEMBER_PAGE_SLUGS = new Set(["accueil", "devis"]);

export function memberSpaceBasePath(orgSlug: string, spaceSlug: string) {
  return `/m/${orgSlug}/${spaceSlug}`;
}

export function memberSpaceAbsoluteUrl(origin: string, orgSlug: string, spaceSlug: string, path = "") {
  const base = `${origin.replace(/\/$/, "")}${memberSpaceBasePath(orgSlug, spaceSlug)}`;
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function memberPagePath(slug: string) {
  if (!slug || slug === "accueil") return "/";
  return `/${slug}`;
}

export function memberResourceSlug(title: string) {
  return slugify(title) || "ressource";
}

export function uniqueMemberPageSlug(
  pages: { id: string; slug: string }[],
  proposed: string,
  excludeId?: string,
) {
  const used = new Set(pages.filter((page) => page.id !== excludeId).map((page) => page.slug));
  const base = proposed.trim() ? slugify(proposed) : "page";
  let candidate = base;
  let n = 2;
  while (used.has(candidate) || RESERVED_MEMBER_PAGE_SLUGS.has(candidate)) {
    candidate = `${base.slice(0, 44)}-${n}`;
    n += 1;
  }
  return candidate;
}
