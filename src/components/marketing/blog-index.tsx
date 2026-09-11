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
          ? "bg-mk-dark text-white"
          : "bg-mk-surface text-mk-muted ring-1 ring-mk-border hover:bg-mk-band hover:text-mk-ink"
      }`}
    >
      {label}
    </Link>
  );
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <p className="text-xs text-mk-faint">
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
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent hover:text-mk-accent-hover"
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
            className="w-full rounded-full border-0 bg-mk-surface px-4 py-2.5 text-sm text-mk-ink ring-1 ring-mk-border placeholder:text-mk-faint focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
          />
        </label>
      </div>

      {featured ? (
        <article className="group mt-8 grid overflow-hidden rounded-2xl bg-mk-surface ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-28px_rgba(11,13,18,0.22)] lg:grid-cols-2">
          <Link
            href={featured.path}
            className="order-first min-h-[14rem] lg:order-last"
            aria-hidden
            tabIndex={-1}
          >
            <BlogCover post={featured} sizes="(max-width: 1024px) 100vw, 560px" priority />
          </Link>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-faint">
                {BLOG_UI.featured}
              </p>
              <Link
                href={`/blog?tag=${primaryTag(featured)}`}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent hover:text-mk-accent-hover"
              >
                {primaryTagLabel(featured)}
              </Link>
            </div>
            <Link href={featured.path} className="mt-3 block">
              <h2 className="text-2xl font-semibold tracking-tight group-hover:text-mk-accent sm:text-3xl sm:leading-tight">
                {featured.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-mk-muted">
                {featured.description}
              </p>
              <div className="mt-4">
                <PostMeta post={featured} />
              </div>
            </Link>
          </div>
        </article>
      ) : null}

      <div className={featured ? "mt-12" : "mt-8"}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          {BLOG_UI.grid}
        </p>
        {grid.length === 0 ? (
          <p className="mt-6 text-sm text-mk-muted">{BLOG_UI.empty}</p>
        ) : (
          <ul className="mt-5 grid gap-5 md:grid-cols-2">
            {grid.map((post) => (
              <li
                key={post.slug}
                className="flex h-full flex-col overflow-hidden rounded-2xl bg-mk-surface ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(11,13,18,0.2)]"
              >
                <Link href={post.path} className="block" tabIndex={-1} aria-hidden>
                  <BlogCover post={post} sizes="(max-width: 768px) 100vw, 520px" compact />
                </Link>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <PostTags post={post} />
                  <Link href={post.path} className="flex flex-1 flex-col">
                    <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{post.title}</h2>
                    <p className="mt-2 line-clamp-2 text-[15px] leading-7 text-mk-muted">
                      {post.description}
                    </p>
                    <div className="mt-auto pt-4">
                      <PostMeta post={post} />
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
