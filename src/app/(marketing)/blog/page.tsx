import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { BLOG_POSTS } from "@/lib/marketing/blog";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Devis B2B, relances, funnel vs formulaire, widget WordPress, sync WooCommerce / Shopify. Textes longs, sources, outils.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">Blog</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Ce qui fait aboutir un devis.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#1A1510]/70 sm:text-lg">
            Relances, parcours, catalogue, intégration. Pas des extraits de fiche produit.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <ul className="space-y-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={post.path}
                className="block rounded-[22px] bg-white p-5 ring-1 ring-black/6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)] sm:p-6"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26]">
                  {post.eyebrow}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{post.title}</h2>
                <p className="mt-2 text-[15px] leading-7 text-[#1A1510]/65">{post.description}</p>
                <p className="mt-3 text-xs text-[#1A1510]/40">{post.readingMinutes} min de lecture</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MarketingCta
        title="Si vous voulez essayer le parcours"
        text="Un funnel, un dossier, des relances. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
