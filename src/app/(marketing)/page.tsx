import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { STATS } from "@/lib/marketing/content";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-10 pt-10 sm:pb-12 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-[#F3B184]/45 blur-3xl sm:h-[26rem] sm:w-[26rem]"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Funnel de devis B2B</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold leading-[1.15] tracking-tight sm:text-5xl sm:leading-[1.08]">
            Arrêtez de perdre vos devis.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#1A1510]/70 sm:mt-5 sm:text-lg">
            Le prospect n’a pas de parcours. Vous n’avez pas de suivi. QuoteBuilder règle les
            deux : dossier complet à l’entrée, autopilote de relances ensuite.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/tarifs"
              className="text-sm font-medium text-[#1A1510]/70 underline-offset-4 hover:underline"
            >
              Voir les tarifs
            </Link>
          </div>
          <p className="mt-3 text-xs text-[#1A1510]/45">Free · sans carte · upgrade quand vous voulez</p>
        </div>
      </section>

      <section className="border-y border-[#1A1510]/8 bg-white/60 px-6 py-8 sm:py-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-[#1A1510]/40">
          Un trou dans le pipeline, documenté des deux côtés
        </p>
        <div className="mx-auto mt-6 grid max-w-4xl gap-6 sm:grid-cols-3 sm:gap-4">
          {STATS.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-[#E85D04] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-5 text-[#1A1510]/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Les deux côtés souffrent.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-[#1A1510]/65 sm:text-[17px] sm:leading-8">
          Prospect sans parcours. Équipe sans suivi. Les bons dossiers meurent dans la boîte mail.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card
            title="Pas de demande propre"
            text="Formulaire vague, ou rien. Le commercial découvre le besoin au téléphone."
          />
          <Card
            title="Devis dans le vide"
            text="Des heures de préparation, zéro retour. Ou un mail flou à décrypter."
          />
          <Card
            title="Suivi inexistant"
            text="80 % des ventes demandent 5+ relances. 44 % s’arrêtent après une."
          />
        </div>
      </section>

      <section className="bg-white/70 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Ce qu’il faut mettre en place.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-[#1A1510]/65">
            Pas un catalogue de plus. Un parcours pour entrer le devis, un autopilote pour le faire
            aboutir.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card n="1" title="Parcours de devis" text="Funnel, catalogue ou chat. Dossier complet, pas un « bonjour »." />
            <Card n="2" title="Dossier exploitable" text="Produits, budget, score. Rappeler pour conclure." />
            <Card n="3" title="Autopilote" text="Confirmation, relances, rappel si non traité." />
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/fonctionnalites"
              className="rounded-full bg-[#1A1510] px-6 py-3 text-sm font-semibold text-white hover:bg-black"
            >
              Toutes les fonctionnalités
            </Link>
            <Link
              href="/comment-ca-marche"
              className="text-sm font-medium text-[#1A1510]/70 underline-offset-4 hover:underline"
            >
              Voir comment ça marche
            </Link>
          </div>
        </div>
      </section>

      <MarketingCta />
    </>
  );
}

function Card({
  n,
  title,
  text,
}: {
  n?: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-black/6 sm:p-6">
      {n ? <p className="text-sm font-medium text-[#C45C26]">{n}</p> : (
        <p className="text-sm font-medium text-[#C45C26]">✕</p>
      )}
      <h3 className="mt-3 text-base font-semibold sm:text-lg">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-[#1A1510]/70">{text}</p>
    </article>
  );
}
