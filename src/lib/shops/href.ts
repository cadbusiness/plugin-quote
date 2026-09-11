import { shopQuotePath } from "@/lib/shops/urls";

export function resolveShopHref(
  href: string,
  opts: { orgSlug: string; shopSlug: string; funnelSlug: string | null },
) {
  if (href === "/devis" || href === "devis") {
    return shopQuotePath(opts.orgSlug, opts.shopSlug);
  }
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/c/")) return href;
  if (href.startsWith("/b/")) return href;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `/b/${opts.orgSlug}/${opts.shopSlug}${path === "/" ? "" : path}`;
}
