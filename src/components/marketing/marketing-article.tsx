import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import type { BlogPost } from "@/lib/marketing/blog";
import { BLOG_POSTS } from "@/lib/marketing/blog";
import { MarketingFaq, type FaqItem } from "@/components/marketing/marketing-faq";

export function MarketingArticle({
  post,
  body,
  faq,
}: {
  post: BlogPost;
  body: string;
  faq: readonly FaqItem[];
}) {
  const related = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 3);
  const date = new Date(`${post.publishedAt}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <article>
        <header className="px-6 pb-6 pt-12 sm:pt-16">
          <div className="mx-auto max-w-3xl">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">
              {post.eyebrow}
            </p>
            <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-[16px] leading-7 text-[#1A1510]/65">{post.description}</p>
            <p className="mt-4 text-xs text-[#1A1510]/40">
              {date} · {post.readingMinutes} min de lecture
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-6 pb-6">
          <Markdown source={body} />
        </div>
      </article>

      <MarketingFaq items={faq} />

      <section className="border-y border-[#1A1510]/8 bg-white/55 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C45C26]">
            Continuer
          </p>
          <ul className="mt-4 space-y-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.path}
                  className="block rounded-2xl bg-white p-4 ring-1 ring-black/6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26]">
                    {item.eyebrow}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#1A1510]/55">{item.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MarketingCta
        title="Relancez ce qui dort."
        text="Parcours pour le prospect. Autopilote pour vous. Free sans carte."
      />
    </>
  );
}
