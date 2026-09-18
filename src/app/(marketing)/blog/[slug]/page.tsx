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

// Prerender only this sprint’s article. SSG of the full catalog OOMs the
// isolated 2GB workers (81/109). Other slugs stay indexable via ISR.
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ slug: "options-variantes-alternatives-devis-b2b" }];
}

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
