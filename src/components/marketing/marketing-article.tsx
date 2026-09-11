import Image from "next/image";
import Link from "next/link";
import { BlogCoverPlaceholder } from "@/components/marketing/blog-cover";
import { BlogMidCta } from "@/components/marketing/blog-mid-cta";
import { BlogProgress } from "@/components/marketing/blog-progress";
import { BlogToc } from "@/components/marketing/blog-toc";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { MarketingFaq, type FaqItem } from "@/components/marketing/marketing-faq";
import {
  BLOG_UI,
  extractMarkdownH2s,
  formatBlogDate,
  getRelatedPosts,
  getRelatedTools,
  midArticleHeadingIndex,
  primaryTag,
  primaryTagLabel,
  type BlogPost,
} from "@/lib/marketing/blog";

export function MarketingArticle({
  post,
  body,
  faq,
}: {
  post: BlogPost;
  body: string;
  faq: readonly FaqItem[];
}) {
  const related = getRelatedPosts(post);
  const tools = getRelatedTools(post);
  const headings = extractMarkdownH2s(body);
  const midAfter = midArticleHeadingIndex(headings.length);
  const date = formatBlogDate(post.publishedAt);
  const hasInlineFaq = /^## FAQ\s*$/m.test(body);

  return (
    <>
      <BlogProgress />
      <article>
        <header className="px-6 pb-6 pt-12 sm:pt-16">
          <div className="mx-auto max-w-[45rem]">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-mk-faint" aria-label="Fil d’Ariane">
              <Link href="/blog" className="hover:text-mk-ink">
                Blog
              </Link>
              <span>/</span>
              <Link
                href={`/blog?tag=${primaryTag(post)}`}
                className="text-mk-accent hover:text-mk-accent-hover"
              >
                {primaryTagLabel(post)}
              </Link>
            </nav>
            <h1 className="mt-5 text-[2rem] font-semibold leading-[1.12] tracking-tight sm:text-[2.75rem] sm:leading-[1.08]">
              {post.title}
            </h1>
            <p className="mt-5 text-[15px] leading-6 text-mk-muted">
              {BLOG_UI.byline}
              <span className="mx-2 text-mk-faint">·</span>
              {date}
              <span className="mx-2 text-mk-faint">·</span>
              {post.readingMinutes} {BLOG_UI.reading}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 pb-8">
          <div className="overflow-hidden rounded-2xl ring-1 ring-mk-border">
            {post.cover ? (
              <div className="relative aspect-[16/9] bg-mk-dark">
                <Image
                  src={post.cover}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            ) : (
              <BlogCoverPlaceholder post={post} />
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-8">
          <div className="lg:grid lg:grid-cols-[minmax(0,45rem)_minmax(13rem,1fr)] lg:gap-16">
            <div id="article-body" className="max-w-[45rem]">
              <BlogToc headings={headings} variant="mobile" />
              <Markdown
                source={body}
                midAfterHeading={midAfter}
                midSlot={<BlogMidCta href={post.ctaHref} />}
              />
            </div>
            <aside className="hidden lg:block">
              <BlogToc headings={headings} variant="desktop" />
            </aside>
          </div>
        </div>
      </article>

      {hasInlineFaq || faq.length === 0 ? null : (
        <div className="mx-auto max-w-2xl">
          <MarketingFaq items={faq} />
        </div>
      )}

      {related.length > 0 || tools.length > 0 ? (
        <section className="border-y border-mk-border bg-mk-band px-6 py-14">
          <div className="mx-auto max-w-6xl space-y-10">
            {related.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
                  {BLOG_UI.related}
                </p>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={item.path}
                        className="block h-full overflow-hidden rounded-2xl bg-mk-surface ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(11,13,18,0.2)]"
                      >
                        <div className="h-28">
                          <BlogCoverPlaceholder post={item} compact />
                        </div>
                        <div className="p-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent">
                            {primaryTagLabel(item)}
                          </p>
                          <p className="mt-1 text-[16px] font-semibold tracking-tight">{item.title}</p>
                          <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-mk-muted">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {tools.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
                  {BLOG_UI.tools}
                </p>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {tools.map((tool) => (
                    <li key={tool.href}>
                      <Link
                        href={tool.href}
                        className="block h-full rounded-2xl bg-mk-surface p-5 ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(11,13,18,0.2)]"
                      >
                        <p className="text-[16px] font-semibold tracking-tight">{tool.title}</p>
                        <p className="mt-2 text-[14px] leading-6 text-mk-muted">{tool.text}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <MarketingCta
        title="Si vous voulez tester le parcours"
        text="Le prospect configure. Vous recevez un dossier. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
