"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BlogCover } from "@/components/marketing/blog-cover";
import {
  BLOG_TAG_DEFS,
  BLOG_UI,
  blogTagLabel,
  filterBlogPosts,
  formatBlogDate,
  getFeaturedPost,
  primaryTag,
  primaryTagLabel,
  type BlogPost,
} from "@/lib/marketing/blog";

function TagChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-[#1A1510] text-white"
          : "bg-white text-[#1A1510]/70 ring-1 ring-black/8 hover:bg-[#FFF8F1] hover:text-[#1A1510]"
      }`}
    >
      {label}
    </Link>
  );
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <p className="text-xs text-[#1A1510]/40">
      {formatBlogDate(post.publishedAt)} · {post.readingMinutes} {BLOG_UI.reading}
    </p>
  );
}

function PostTags({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap gap-2">
      {post.tags.map((slug) => (
        <Link
          key={slug}
          href={`/blog?tag=${slug}`}
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26] hover:text-[#E85D04]"
        >
          {blogTagLabel(slug)}
        </Link>
      ))}
    </div>
  );
}

export function BlogIndex({ posts, tag }: { posts: BlogPost[]; tag?: string }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => filterBlogPosts(posts, { tag, q }), [posts, tag, q]);
  const searching = q.trim().length > 0 || !!tag;
  const featured = searching ? null : getFeaturedPost(posts);
  const grid = featured ? filtered.filter((post) => post.slug !== featured.slug) : filtered;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <TagChip href="/blog" label="Tous" active={!tag} />
          {BLOG_TAG_DEFS.map((item) => (
            <TagChip
              key={item.slug}
              href={`/blog?tag=${item.slug}`}
              label={item.label}
              active={tag === item.slug}
            />
          ))}
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">{BLOG_UI.searchPlaceholder}</span>
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={BLOG_UI.searchPlaceholder}
            className="w-full rounded-full border-0 bg-white px-4 py-2.5 text-sm text-[#1A1510] ring-1 ring-black/8 placeholder:text-[#1A1510]/35 focus:outline-none focus:ring-2 focus:ring-[#E85D04]/40"
          />
        </label>
      </div>

      {featured ? (
        <article className="group mt-8 grid overflow-hidden rounded-[28px] bg-white ring-1 ring-black/6 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-32px_rgba(60,30,8,0.45)] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1A1510]/35">
                {BLOG_UI.featured}
              </p>
              <Link
                href={`/blog?tag=${primaryTag(featured)}`}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26] hover:text-[#E85D04]"
              >
                {primaryTagLabel(featured)}
              </Link>
            </div>
            <Link href={featured.path} className="mt-3 block">
              <h2 className="text-2xl font-semibold tracking-tight group-hover:text-[#E85D04] sm:text-3xl sm:leading-tight">
                {featured.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-[#1A1510]/65">
                {featured.description}
              </p>
              <div className="mt-4">
                <PostMeta post={featured} />
              </div>
            </Link>
          </div>
          <Link
            href={featured.path}
            className="border-t border-[#1A1510]/6 bg-[#F6F0E8] p-5 sm:p-6 lg:border-l lg:border-t-0"
            aria-hidden
            tabIndex={-1}
          >
            <BlogCover post={featured} sizes="(max-width: 1024px) 100vw, 560px" priority />
          </Link>
        </article>
      ) : null}

      <div className={featured ? "mt-10" : "mt-8"}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C45C26]">
          {BLOG_UI.grid}
        </p>
        {grid.length === 0 ? (
          <p className="mt-6 text-sm text-[#1A1510]/50">{BLOG_UI.empty}</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {grid.map((post) => (
              <li
                key={post.slug}
                className="flex h-full flex-col rounded-[22px] bg-white p-5 ring-1 ring-black/6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)] sm:p-6"
              >
                <PostTags post={post} />
                <Link href={post.path} className="flex flex-1 flex-col">
                  <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-7 text-[#1A1510]/65">
                    {post.description}
                  </p>
                  <div className="mt-auto pt-4">
                    <PostMeta post={post} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
