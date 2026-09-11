"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { FEATURE_MENU_GROUPS } from "@/lib/marketing/content";

const STATIC_LINKS = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/secteurs", label: "Secteurs" },
  { href: "/blog", label: "Blog" },
  { href: "/tarifs", label: "Tarifs" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const featuresActive = pathname.startsWith("/fonctionnalites");

  function openFeatures() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setFeaturesOpen(true);
  }

  function scheduleCloseFeatures() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setFeaturesOpen(false), 160);
  }

  useEffect(() => {
    setMobileOpen(false);
    setFeaturesOpen(false);
    setMobileFeaturesOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFeaturesOpen(false);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="marketing-root min-h-dvh bg-mk-bg text-mk-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow"
      >
        Aller au contenu
      </a>

      <header className="sticky top-0 z-40 border-b border-mk-border bg-mk-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-6">
          <BrandLogo variant="wordmark" href="/" priority />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            <div
              className="relative"
              onMouseEnter={openFeatures}
              onMouseLeave={scheduleCloseFeatures}
            >
              <Link
                href="/fonctionnalites"
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  featuresActive
                    ? "bg-mk-band text-mk-ink"
                    : "text-mk-muted hover:bg-mk-band hover:text-mk-ink"
                }`}
                aria-expanded={featuresOpen}
                aria-controls={menuId}
                onFocus={openFeatures}
              >
                Fonctionnalités
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-3.5 w-3.5 opacity-60 transition ${featuresOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              <div
                id={menuId}
                role="region"
                aria-label="Menu fonctionnalités"
                className={`absolute left-1/2 top-full z-50 w-[min(94vw,920px)] -translate-x-[32%] pt-3 transition duration-200 ${
                  featuresOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                }`}
                onMouseEnter={openFeatures}
                onMouseLeave={scheduleCloseFeatures}
              >
                <div className="overflow-hidden rounded-2xl border border-mk-border bg-mk-surface shadow-[0_24px_64px_-28px_rgba(11,13,18,0.28)]">
                  <div className="grid grid-cols-3">
                    {FEATURE_MENU_GROUPS.map((group, gi) => (
                      <div
                        key={group.id}
                        className={`p-5 ${gi === 0 ? "bg-mk-band/50" : "border-l border-mk-border"}`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
                          {group.label}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-mk-faint">
                          {group.blurb}
                        </p>
                        <ul className="mt-4 space-y-0.5">
                          {group.items.map((item) => {
                            const active = pathname === `/fonctionnalites/${item.slug}`;
                            return (
                              <li key={item.slug}>
                                <Link
                                  href={`/fonctionnalites/${item.slug}`}
                                  className={`group/item flex gap-3 rounded-lg px-2.5 py-2.5 transition ${
                                    active ? "bg-mk-accent-soft" : "hover:bg-mk-band"
                                  }`}
                                >
                                  <span
                                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold tracking-wide text-white transition ${
                                      active
                                        ? "bg-mk-accent"
                                        : "bg-mk-dark group-hover/item:bg-mk-accent"
                                    }`}
                                  >
                                    {item.menuLabel
                                      .split(/\s|&/)
                                      .filter(Boolean)
                                      .slice(0, 2)
                                      .map((w) => w[0])
                                      .join("")
                                      .toUpperCase()}
                                  </span>
                                  <span className="min-w-0">
                                    <span
                                      className={`block text-sm font-semibold ${
                                        active
                                          ? "text-mk-accent"
                                          : "text-mk-ink group-hover/item:text-mk-accent"
                                      }`}
                                    >
                                      {item.menuLabel}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-snug text-mk-faint">
                                      {item.menuBlurb}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 border-t border-mk-border bg-mk-band px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-mk-ink">
                        Plateforme complète
                      </p>
                      <p className="mt-0.5 text-xs text-mk-muted">
                        Huit modules reliés. Du funnel jusqu&apos;à l&apos;autopilote.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/fonctionnalites"
                        className="inline-flex items-center gap-1.5 rounded-full bg-mk-dark px-4 py-2 text-xs font-semibold text-white transition hover:bg-mk-accent"
                      >
                        Vue d&apos;ensemble
                        <span aria-hidden>→</span>
                      </Link>
                      <Link
                        href="/comment-ca-marche"
                        className="inline-flex items-center rounded-full bg-mk-surface px-4 py-2 text-xs font-semibold text-mk-ink ring-1 ring-mk-border transition hover:bg-mk-band"
                      >
                        Voir la démo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {STATIC_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-mk-band text-mk-ink"
                      : "text-mk-muted hover:bg-mk-band hover:text-mk-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-mk-muted hover:text-mk-ink sm:inline"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-mk-accent px-4 py-2 text-sm font-semibold text-white hover:bg-mk-accent-hover"
            >
              Essayer gratuitement
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-mk-border bg-mk-surface text-mk-ink lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span
                  className={`block h-0.5 w-4 bg-current transition ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`}
                />
                <span className={`block h-0.5 w-4 bg-current transition ${mobileOpen ? "opacity-0" : ""}`} />
                <span
                  className={`block h-0.5 w-4 bg-current transition ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div id="mobile-nav" className="border-t border-mk-border bg-mk-surface lg:hidden">
            <div className="mx-auto max-w-6xl space-y-1 px-6 py-4">
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[15px] font-semibold ${
                  featuresActive ? "bg-mk-band text-mk-accent" : "text-mk-ink hover:bg-mk-band"
                }`}
                aria-expanded={mobileFeaturesOpen}
                onClick={() => setMobileFeaturesOpen((v) => !v)}
              >
                Fonctionnalités
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 opacity-50 transition ${mobileFeaturesOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {mobileFeaturesOpen ? (
                <div className="ml-1 space-y-4 border-l-2 border-mk-accent/40 py-1 pl-3">
                  <Link
                    href="/fonctionnalites"
                    className="block rounded-lg px-2 py-2 text-sm font-semibold text-mk-accent"
                  >
                    Vue d&apos;ensemble
                  </Link>
                  {FEATURE_MENU_GROUPS.map((group) => (
                    <div key={group.id}>
                      <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-mk-faint">
                        {group.label}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {group.items.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={`/fonctionnalites/${item.slug}`}
                              className="block rounded-lg px-2 py-2 text-sm font-medium text-mk-muted hover:bg-mk-band"
                            >
                              {item.menuLabel}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}

              {STATIC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-3 py-3 text-[15px] font-semibold ${
                    isActivePath(pathname, link.href)
                      ? "bg-mk-band text-mk-accent"
                      : "text-mk-ink hover:bg-mk-band"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div id="contenu">{children}</div>

      <footer className="border-t border-mk-border bg-mk-surface px-6 py-14 text-sm text-mk-muted">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="font-medium text-mk-ink">QuoteBuilder · Devis qui aboutissent</p>
            <p className="mt-2 max-w-xs text-[13px] leading-6 text-mk-faint">
              Funnel, catalogue, pipeline, autopilote. Une plateforme pour les devis B2B qui ne
              s&apos;arrêtent pas au formulaire.
            </p>
            <p className="mt-4 text-xs text-mk-faint">
              © {new Date().getFullYear()} Vinci Liberta LTD · Dublin, Irlande
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-faint">
              Produit
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/fonctionnalites" className="hover:text-mk-ink">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/fonctionnalites/autopilote" className="hover:text-mk-ink">
                  Autopilote
                </Link>
              </li>
              <li>
                <Link href="/fonctionnalites/funnel" className="hover:text-mk-ink">
                  Funnel de devis
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-mk-ink">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-mk-ink">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-faint">
              Plateforme
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/fonctionnalites/demandes" className="hover:text-mk-ink">
                  Demandes
                </Link>
              </li>
              <li>
                <Link href="/fonctionnalites/stats" className="hover:text-mk-ink">
                  Stats
                </Link>
              </li>
              <li>
                <Link href="/fonctionnalites/equipe" className="hover:text-mk-ink">
                  Équipe
                </Link>
              </li>
              <li>
                <Link href="/fonctionnalites/integrations" className="hover:text-mk-ink">
                  Intégrations
                </Link>
              </li>
              <li>
                <Link href="/secteurs" className="hover:text-mk-ink">
                  Secteurs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-faint">
              Ressources
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/blog" className="hover:text-mk-ink">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/outils" className="hover:text-mk-ink">
                  Outils
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-mk-ink">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/legal/cgu" className="hover:text-mk-ink">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/confidentialite" className="hover:text-mk-ink">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function MarketingCta({
  title = "Bouchez le trou. Maintenant.",
  text = "Parcours pour le prospect. Autopilote pour vous. Free sans carte.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="px-6 pb-20 pt-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-mk-dark px-8 py-12 text-center text-mk-on-dark sm:px-16 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-mk-on-dark/65">{text}</p>
        <Link
          href="/signup"
          className="mt-8 inline-flex rounded-full bg-mk-accent px-6 py-3 text-sm font-semibold text-white hover:bg-mk-accent-hover"
        >
          Commencer gratuitement
        </Link>
      </div>
    </section>
  );
}
