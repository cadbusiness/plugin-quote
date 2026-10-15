import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  blogArticleJsonLd,
  blogBreadcrumbJsonLd,
  blogOgImagePath,
  getBlogPost,
  trimMetaDescription,
} from "@/lib/marketing/blog";
import { articleHtml } from "@/lib/marketing/article-html";
import { loadPostBody } from "@/lib/marketing/load-post";
import { pageMetadata } from "@/lib/marketing/site";

type Props = { params: Promise<{ slug: string }> };

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
  const post = getBlogPost(slug);
  if (!post) notFound();
  const body = loadPostBody(post.slug);
  const articleLd = blogArticleJsonLd(post);
  const breadcrumbLd = blogBreadcrumbJsonLd(post);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <article className="px-4 pb-16 pt-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium text-mk-faint">
            <Link href="/blog" className="hover:text-mk-ink">
              Blog
            </Link>
          </p>
          <h1 className="mt-4 text-[2.15rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-[15px] leading-6 text-mk-muted">{post.description}</p>
          <div
            className="marketing-md mt-10"
            dangerouslySetInnerHTML={{ __html: articleHtml(body) }}
          />
        </div>
      </article>
    </>
  );
}
