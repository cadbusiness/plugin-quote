import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/marketing/blog";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { SITE_URL } from "@/lib/marketing/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const dates = new Map(BLOG_POSTS.map((post) => [post.path, post.publishedAt]));
  return MARKETING_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified: dates.get(route.path) ?? new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
