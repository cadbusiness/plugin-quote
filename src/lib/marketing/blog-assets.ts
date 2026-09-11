import { existsSync } from "node:fs";
import { join } from "node:path";
import { BLOG_IMAGE_DIR, normalizeCoverPath, type BlogPost } from "@/lib/marketing/blog";

const COVER_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"] as const;

function publicFileExists(publicPath: string): boolean {
  const relative = publicPath.replace(/^\/+/, "");
  return existsSync(join(process.cwd(), "public", relative));
}

/** Chemins essayés : `cover` explicite, puis `/images/blog/{slug}.{ext}`. */
export function coverCandidatesForSlug(slug: string, explicitCover?: string): string[] {
  const fromExplicit = explicitCover ? [normalizeCoverPath(explicitCover)] : [];
  const fromSlug = COVER_EXTENSIONS.map((ext) => `${BLOG_IMAGE_DIR}/${slug}${ext}`);
  return [...fromExplicit, ...fromSlug];
}

export function resolveCoverForPost(post: Pick<BlogPost, "slug" | "cover">): string | undefined {
  if (post.cover) {
    const normalized = normalizeCoverPath(post.cover);
    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return normalized;
    }
    if (publicFileExists(normalized)) return normalized;
  }
  for (const ext of COVER_EXTENSIONS) {
    const candidate = `${BLOG_IMAGE_DIR}/${post.slug}${ext}`;
    if (publicFileExists(candidate)) return candidate;
  }
  return undefined;
}

export function withResolvedCover<T extends BlogPost>(post: T): T {
  return { ...post, cover: resolveCoverForPost(post) };
}
