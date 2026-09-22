import Link from "next/link";
import { MarketingJsonLd } from "@/components/marketing/marketing-jsonld";

/** Server-only chrome: no next/image, no client shell, no Sharp. */
export default function MarketingLiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-root min-h-dvh bg-mk-bg text-mk-ink">
      <header className="border-b border-mk-border bg-mk-surface">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            QuoteBuilder
          </Link>
          <nav className="flex items-center gap-4 text-sm text-mk-muted" aria-label="Navigation">
            <Link href="/blog" className="hover:text-mk-ink">
              Blog
            </Link>
            <Link href="/fonctionnalites" className="hover:text-mk-ink">
              Fonctionnalités
            </Link>
            <Link href="/tarifs" className="hover:text-mk-ink">
              Tarifs
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-mk-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-mk-accent-hover"
            >
              Essai gratuit
            </Link>
          </nav>
        </div>
      </header>
      <MarketingJsonLd />
      <main id="contenu">{children}</main>
      <footer className="border-t border-mk-border px-6 py-8 text-sm text-mk-faint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p>QuoteBuilder</p>
          <div className="flex gap-4">
            <Link href="/legal/cgu" className="hover:text-mk-ink">
              Conditions
            </Link>
            <Link href="/legal/confidentialite" className="hover:text-mk-ink">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
