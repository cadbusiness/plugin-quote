import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingArticle } from "@/components/marketing/marketing-article";
import { BLOG_FAQ } from "@/lib/marketing/blog-faq";
import { BLOG_POSTS, getBlogPost } from "@/lib/marketing/blog";
import { loadPostBody } from "@/lib/marketing/load-post";
import { COMPANY, SITE_URL, pageMetadata } from "@/lib/marketing/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article" };
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: post.path,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const faq = BLOG_FAQ[post.slug] ?? [];
  const body = loadPostBody(post.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}${post.path}`,
    author: { "@type": "Organization", name: COMPANY.product, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingArticle post={post} body={body} faq={faq} />
    </>
  );
}
