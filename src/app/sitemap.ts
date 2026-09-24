import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/marketing/blog";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { SITE_URL } from "@/lib/marketing/site";

/** Dates éditoriales hors articles (le blog passe par publishedAt). */
const CONTENT_LASTMOD: Record<string, string> = {
  "/secteurs/funnel-devis-pompe-chaleur-chauffage": "2026-09-24",
  "/outils/estimateur-cout-devis-pdf-seuls": "2026-09-24",
  "/secteurs/funnel-devis-pergola-terrasse": "2026-09-23",
  "/outils/estimateur-gain-temps-catalogue-devis": "2026-09-23",
  "/outils/estimateur-leads-formulaire-vs-funnel-wp": "2026-09-23",
  "/outils/calculateur-seuil-remise-marge": "2026-09-22",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const dates = new Map(BLOG_POSTS.map((post) => [post.path, post.publishedAt]));
  return MARKETING_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified: dates.get(route.path) ?? route.lastModified ?? CONTENT_LASTMOD[route.path] ?? new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
