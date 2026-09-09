import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import {
  FEATURE_MENU_GROUPS,
  FEATURES,
  getFeatureHref,
  type FeatureSlug,
} from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Fonctionnalités · QuoteBuilder",
  description:
    "Funnel, catalogue, pipeline, autopilote, espace prospect, stats, équipe, intégrations. La plateforme complète.",
};

function featureBySlug(slug: FeatureSlug) {
  return FEATURES.find((f) => f.slug === slug)!;
}

const FLOW = [
  { label: "Funnel", href: "/fonctionnalites/funnel" },
  { label: "Catalogue", href: "/fonctionnalites/catalogue" },
  { label: "Demandes", href: "/fonctionnalites/demandes" },
  { label: "Autopilote", href: "/fonctionnalites/autopilote" },
  { label: "Stats", href: "/fonctionnalites/stats" },
] as const;

export default function FonctionnalitesIndexPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-10 pt-12 sm:pb-12 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-4 h-64 w-64 -translate-x-1/2 rounded-full bg-[#F3B184]/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Plateforme</p>
          <h1 className="mt-3 text-[1.9rem] font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]">
            Pas un formulaire. Un système.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1A1510]/70 sm:text-lg">
            Huit briques reliées. De l&apos;entrée du devis jusqu&apos;à la relance, en passant par
            le catalogue, le pipeline et l&apos;équipe.
          </p>
        </div>

        <div className="relative mx-auto mt-10 max-w-4xl overflow-x-auto">
          <div className="flex min-w-[34rem] items-center justify-center gap-2 sm:gap-3">
            {FLOW.map((step, i) => (
              <div key={step.href} className="flex items-center gap-2 sm:gap-3">
                <Link
                  href={step.href}
                  className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1510] ring-1 ring-black/8 transition hover:bg-[#E85D04] hover:text-white hover:ring-[#E85D04] sm:text-sm"
                >
                  {step.label}
                </Link>
                {i < FLOW.length - 1 ? (
                  <span className="text-[#1A1510]/25" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-12 px-6 pb-14 sm:space-y-16 sm:pb-20">
        {FEATURE_MENU_GROUPS.map((group) => (
          <div key={group.id}>
            <div className="mb-5 flex flex-col gap-1 border-b border-[#1A1510]/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C45C26]">
                  {group.label}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                  {group.label}
                </h2>
                <p className="mt-1 max-w-xl text-sm text-[#1A1510]/55">{group.blurb}</p>
              </div>
              <p className="text-xs font-medium text-[#1A1510]/35">
                {group.items.length} module{group.items.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.slugs.map((slug) => {
                const feature = featureBySlug(slug);
                return (
                  <Link
                    key={slug}
                    href={getFeatureHref(slug)}
                    className="group flex flex-col rounded-[22px] bg-white p-5 ring-1 ring-black/6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(60,30,8,0.45)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1510] text-[11px] font-bold text-white transition group-hover:bg-[#E85D04]">
                        {feature.menuLabel
                          .split(/\s|&/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                      <span className="rounded-full bg-[#FFF4EB] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#C45C26]">
                        {feature.eyebrow}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-[#E85D04]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[15px] leading-7 text-[#1A1510]/65">
                      {feature.lead}
                    </p>
                    <p className="mt-4 text-sm font-medium text-[#1A1510]/45 group-hover:text-[#E85D04]">
                      Explorer le module →
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="border-y border-[#1A1510]/8 bg-[#1A1510] px-6 py-12 text-[#F6F0E8]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-[#F3B184]">Tout est connecté</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Une demande traverse funnel, score, assignation et autopilote.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/comment-ca-marche"
              className="inline-flex rounded-full bg-[#E85D04] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Voir comment ça marche
            </Link>
            <Link
              href="/fonctionnalites/autopilote"
              className="inline-flex rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              Zoom autopilote
            </Link>
          </div>
        </div>
      </section>

      <MarketingCta />
    </>
  );
}
