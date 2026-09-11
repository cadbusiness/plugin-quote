import { quoteFunnelPath, shopQuotePath } from "@/lib/shops/urls";

function splitHref(href: string) {
  const q = href.indexOf("?");
  return q === -1 ? { path: href, search: "" } : { path: href.slice(0, q), search: href.slice(q) };
}

export function resolveShopHref(
  href: string,
  opts: { orgSlug: string; shopSlug: string; funnelSlug: string | null },
) {
  if (href === "/devis" || href === "devis") {
    return shopQuotePath(opts.orgSlug, opts.shopSlug);
  }
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/c/")) {
    const { path, search } = splitHref(href);
    const funnel = quoteFunnelPath(opts.orgSlug, opts.funnelSlug);
    if (funnel && path === funnel) {
      return `${shopQuotePath(opts.orgSlug, opts.shopSlug)}${search}`;
    }
    return href;
  }
  if (href.startsWith("/b/")) return href;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `/b/${opts.orgSlug}/${opts.shopSlug}${path === "/" ? "" : path}`;
}
