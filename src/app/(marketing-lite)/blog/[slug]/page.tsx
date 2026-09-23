import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  blogArticleJsonLd,
  blogBreadcrumbJsonLd,
  blogOgImagePath,
  getBlogPost,
  trimMetaDescription,
} from "@/lib/marketing/blog";
import { loadPostBody } from "@/lib/marketing/load-post";
import { pageMetadata } from "@/lib/marketing/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineHtml(text: string) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, '<a href="$2">$1</a>');
}

/** String HTML — no React markdown tree, no Sharp, no Satori. */
function articleHtml(source: string) {
  const blocks: string[] = [];
  for (const raw of source.replace(/\r\n/g, "\n").trim().split(/\n{2,}/)) {
    const block = raw.trim();
    if (!block || block.startsWith("# ") || block.startsWith("<!--")) continue;
    if (block.startsWith("## ")) {
      blocks.push(`<h2 class="mt-12 text-2xl font-semibold tracking-tight">${inlineHtml(block.slice(3))}</h2>`);
      continue;
    }
    if (block.startsWith("### ")) {
      blocks.push(`<h3 class="mt-8 text-lg font-semibold">${inlineHtml(block.slice(4))}</h3>`);
      continue;
    }
    if (/^[-*]\s/m.test(block) || /^\d+\.\s/m.test(block)) {
      const items = block
        .split("\n")
        .map((line) => line.replace(/^([-*]|\d+\.)\s+/, "").trim())
        .filter(Boolean)
        .map((item) => `<li>${inlineHtml(item)}</li>`)
        .join("");
      blocks.push(`<ul class="mt-5 list-disc pl-5 text-mk-muted">${items}</ul>`);
      continue;
    }
    blocks.push(`<p class="mt-5 text-[16px] leading-7 text-mk-muted">${inlineHtml(block.replace(/\n/g, " "))}</p>`);
  }
  return blocks.join("");
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
            <a href="/blog" className="hover:text-mk-ink">
              Blog
            </a>
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
