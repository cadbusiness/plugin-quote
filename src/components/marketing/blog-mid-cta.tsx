import Link from "next/link";
import { BLOG_DEMO_FUNNEL, BLOG_UI } from "@/lib/marketing/blog";

export function BlogMidCta() {
  return (
    <aside className="my-12 rounded-[22px] bg-white px-5 py-5 ring-1 ring-black/6 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26]">Démo</p>
      <p className="mt-2 text-[17px] font-semibold tracking-tight">{BLOG_UI.midCtaTitle}</p>
      <p className="mt-1.5 text-[15px] leading-6 text-[#1A1510]/60">{BLOG_UI.midCtaText}</p>
      <Link
        href={BLOG_DEMO_FUNNEL}
        className="mt-4 inline-flex text-sm font-semibold text-[#E85D04] underline-offset-4 hover:underline"
      >
        {BLOG_UI.midCtaLink} →
      </Link>
    </aside>
  );
}
