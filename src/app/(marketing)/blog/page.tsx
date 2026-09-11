import type { Metadata } from "next";
import Link from "next/link";
import { BlogIndex } from "@/components/marketing/blog-index";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { BLOG_POSTS, BLOG_UI, resolveBlogTag } from "@/lib/marketing/blog";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Devis B2B, scoring, configurateur vs Excel, relances, funnel vs formulaire, widget WordPress, sync WooCommerce / Shopify.",
  path: "/blog",
});

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const activeTag = resolveBlogTag(tag);

  return (
    <>
      <section className="relative overflow-hidden px-6 pb-8 pt-14 sm:pt-20">
        <div aria-hidden className="marketing-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            {BLOG_UI.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-[1.85rem] font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]">
            {BLOG_UI.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-mk-muted sm:text-lg">
            {BLOG_UI.heroSubtitle}
          </p>
          <div className="mt-7">
            <Link
              href="/signup?plan=free"
              className="inline-flex rounded-full bg-mk-surface px-5 py-2.5 text-sm font-semibold text-mk-ink ring-1 ring-mk-border hover:bg-mk-band"
            >
              {BLOG_UI.tryFree}
            </Link>
          </div>
        </div>
      </section>

      <BlogIndex posts={BLOG_POSTS} tag={activeTag} />

      <MarketingCta
        title="Si vous voulez essayer le parcours"
        text="Un funnel, un dossier, des relances. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
