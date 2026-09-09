import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { FEATURE_BLOCKS } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Fonctionnalités · QuoteBuilder",
  description:
    "Funnel, catalogue, pipeline, autopilote, stats, intégrations. Tout le système pour faire aboutir les devis.",
};

export default function FonctionnalitesPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Caractéristiques</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Tout le système, pas juste un formulaire.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1A1510]/70 sm:text-lg">
            Entrée du devis, pilotage, relances, équipe, stats. Voici ce que QuoteBuilder livre
            aujourd’hui.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURE_BLOCKS.map((block) => (
            <a
              key={block.id}
              href={`#${block.id}`}
              className="rounded-full bg-white px-3.5 py-1.5 text-sm text-[#1A1510]/70 ring-1 ring-black/8 hover:bg-[#FFF8F1]"
            >
              {block.title}
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-6 py-10 sm:space-y-14 sm:py-14">
        {FEATURE_BLOCKS.map((block, i) => (
          <article
            key={block.id}
            id={block.id}
            className={`scroll-mt-28 grid gap-6 rounded-[24px] bg-white p-6 ring-1 ring-black/6 sm:p-8 lg:grid-cols-2 lg:gap-10 ${
              i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div>
              <p className="text-sm font-medium text-[#C45C26]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{block.title}</h2>
              <p className="mt-3 text-[16px] leading-7 text-[#1A1510]/70">{block.lead}</p>
            </div>
            <ul className="space-y-3 text-[15px] leading-7 text-[#1A1510]/75">
              {block.points.map((point) => (
                <li key={point} className="flex gap-2 border-b border-[#1A1510]/6 pb-3 last:border-0">
                  <span className="mt-0.5 text-[#E85D04]">▸</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="border-y border-[#1A1510]/8 bg-white/60 px-6 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold tracking-tight">Voir la chaîne en mouvement</p>
            <p className="mt-1 text-sm text-[#1A1510]/60">
              Démo produit : offre → funnel → dossier → autopilote.
            </p>
          </div>
          <Link
            href="/comment-ca-marche"
            className="rounded-full bg-[#1A1510] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            Comment ça marche
          </Link>
        </div>
      </section>

      <MarketingCta
        title="Installez le système."
        text="Free pour démarrer. Pro quand le volume monte."
      />
    </>
  );
}
