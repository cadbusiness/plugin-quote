import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingArticle } from "@/components/marketing/marketing-article";
import { BLOG_FAQ } from "@/lib/marketing/blog-faq";
import {
  blogArticleJsonLd,
  blogBreadcrumbJsonLd,
  blogOgImagePath,
  getBlogPost,
  trimMetaDescription,
} from "@/lib/marketing/blog";
import { withResolvedCover } from "@/lib/marketing/blog-assets";
import { loadPostBody } from "@/lib/marketing/load-post";
import { pageMetadata } from "@/lib/marketing/site";

type Props = { params: Promise<{ slug: string }> };

// ISR/SSG of a single article OOMs the isolated ~2GB heap (build and runtime).
// SSR stays indexable; sitemap and metadata are unchanged.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article" };
  return pageMetadata({
    title: post.title,
    description: trimMetaDescription(post.description),
    path: post.path,
    type: "article",
    publishedTime: post.publishedAt,
    image: blogOgImagePath(post),
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const found = getBlogPost(slug);
  if (!found) notFound();
  const post = withResolvedCover(found);
  const faq = BLOG_FAQ[post.slug] ?? [];
  const body = loadPostBody(post.slug);
  const articleLd = blogArticleJsonLd(post);
  const breadcrumbLd = blogBreadcrumbJsonLd(post);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingArticle post={post} body={body} faq={faq} />
    </>
  );
}
