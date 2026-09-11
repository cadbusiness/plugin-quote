import Link from "next/link";
import { BLOG_DEMO_FUNNEL, BLOG_UI } from "@/lib/marketing/blog";

export function BlogMidCta({ href = BLOG_DEMO_FUNNEL }: { href?: string }) {
  return (
    <aside className="my-12 rounded-2xl border border-mk-border bg-mk-surface px-5 py-6 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent">Démo</p>
      <p className="mt-2 text-[17px] font-semibold tracking-tight">{BLOG_UI.midCtaTitle}</p>
      <p className="mt-1.5 text-[15px] leading-6 text-mk-muted">{BLOG_UI.midCtaText}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full bg-mk-accent px-4 py-2 text-sm font-semibold text-white hover:bg-mk-accent-hover"
      >
        {BLOG_UI.midCtaLink}
      </Link>
    </aside>
  );
}
