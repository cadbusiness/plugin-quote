import type { Metadata } from "next";
import Link from "next/link";
import { AutopilotStage } from "@/components/marketing/autopilot-stage";
import { LandingSectors } from "@/components/marketing/landing-sectors";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SystemCinema } from "@/components/marketing/system-cinema";
import { FEATURE_MENU_GROUPS, STATS } from "@/lib/marketing/content";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-14 pt-16 sm:pb-20 sm:pt-24">
        <div aria-hidden className="marketing-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-mk-accent">Funnel de devis B2B</p>
          <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.1] tracking-tight sm:text-6xl sm:leading-[1.04]">
            Arrêtez de perdre vos devis.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mk-muted sm:mt-6 sm:text-lg">
            Le prospect n’a pas de parcours. Vous n’avez pas de suivi. QuoteBuilder règle les
            deux : dossier complet à l’entrée, autopilote de relances ensuite.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-mk-accent px-6 py-3 text-sm font-semibold text-white hover:bg-mk-accent-hover"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/comment-ca-marche"
              className="text-sm font-medium text-mk-muted underline-offset-4 hover:text-mk-ink hover:underline"
            >
              Voir la démo
            </Link>
          </div>
          <p className="mt-4 text-xs text-mk-faint">Free · sans carte · upgrade quand vous voulez</p>
        </div>
      </section>

      <section className="border-y border-mk-border bg-mk-band px-6 py-10 sm:py-12">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-mk-faint">
          Un trou dans le pipeline, documenté des deux côtés
        </p>
        <div className="mx-auto mt-8 grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-6">
          {STATS.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-mk-ink sm:text-4xl">
                {stat.value}
              </p>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-5 text-mk-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Les deux côtés souffrent.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-mk-muted sm:text-[17px] sm:leading-8">
          Prospect sans parcours. Équipe sans suivi. Les bons dossiers meurent dans la boîte mail.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Card
            mark="✕"
            title="Pas de demande propre"
            text="Formulaire vague, ou rien. Le commercial découvre le besoin au téléphone."
          />
          <Card
            mark="✕"
            title="Devis dans le vide"
            text="Des heures de préparation, zéro retour. Ou un mail flou à décrypter."
          />
          <Card
            mark="✕"
            title="Suivi inexistant"
            text="80 % des ventes demandent 5+ relances. 44 % s’arrêtent après une."
          />
        </div>
      </section>

      <section className="border-y border-mk-border bg-mk-band px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Ce qu’il faut mettre en place.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-mk-muted">
            Pas un catalogue de plus. Un parcours pour entrer le devis, un autopilote pour le faire
            aboutir.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Card n="1" title="Parcours de devis" text="Funnel, catalogue ou chat. Dossier complet, pas un « bonjour »." />
            <Card n="2" title="Dossier exploitable" text="Produits, budget, score. Rappeler pour conclure." />
            <Card n="3" title="Autopilote" text="Confirmation, relances, rappel si non traité." />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-mk-accent">La chaîne</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Offre → funnel → dossier → autopilote.
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-mk-muted">
              La même séquence que dans le logiciel. En quelques secondes.
            </p>
          </div>
          <div className="mt-10">
            <SystemCinema />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/comment-ca-marche"
              className="text-sm font-semibold text-mk-ink underline-offset-4 hover:underline"
            >
              Voir comment ça marche en détail →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mk-dark px-6 py-16 text-mk-on-dark sm:py-24">
        <div className="mx-auto max-w-6xl">
          <AutopilotStage />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/fonctionnalites/autopilote"
              className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
            >
              Zoom autopilote
            </Link>
            <Link
              href="/fonctionnalites"
              className="text-sm font-medium text-mk-on-dark/65 underline-offset-4 hover:text-white hover:underline"
            >
              Toutes les fonctionnalités
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-mk-accent">Plateforme</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Huit modules. Un système.
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-mk-muted">
              Acquisition, pilotage, organisation. Tout relié au même dossier.
            </p>
          </div>
          <div className="mt-12 space-y-10">
            {FEATURE_MENU_GROUPS.map((group) => (
              <div key={group.id}>
                <div className="mb-4 flex items-end justify-between gap-3 border-b border-mk-border pb-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
                      {group.label}
                    </p>
                    <p className="mt-1 text-sm text-mk-muted">{group.blurb}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/fonctionnalites/${item.slug}`}
                      className="group rounded-xl bg-mk-surface p-4 ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(11,13,18,0.2)] sm:p-5"
                    >
                      <h3 className="text-[15px] font-semibold tracking-tight group-hover:text-mk-accent">
                        {item.menuLabel}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-5 text-mk-muted">{item.menuBlurb}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-mk-border bg-mk-band px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-mk-accent">Secteurs</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Votre métier. Votre offre.
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-mk-muted">
              Le funnel s’appuie sur ce que vous livrez vraiment. Pas un formulaire générique.
            </p>
          </div>
          <div className="mt-10">
            <LandingSectors />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/secteurs"
              className="text-sm font-semibold text-mk-ink underline-offset-4 hover:underline"
            >
              Voir tous les secteurs →
            </Link>
          </div>
        </div>
      </section>

      <MarketingCta
        title="Bouchez le trou. Maintenant."
        text="Parcours pour le prospect. Autopilote pour vous. Free sans carte."
      />
    </>
  );
}

function Card({
  n,
  mark,
  title,
  text,
}: {
  n?: string;
  mark?: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl bg-mk-surface p-5 ring-1 ring-mk-border sm:p-6">
      <p className="text-sm font-medium text-mk-accent">{n ?? mark ?? "·"}</p>
      <h3 className="mt-3 text-base font-semibold sm:text-lg">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-mk-muted">{text}</p>
    </article>
  );
}
