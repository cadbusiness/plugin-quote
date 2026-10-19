import type { Metadata } from "next";
import Link from "next/link";
import { AnalyseurMotifsDevisPerdusCalculator } from "@/components/marketing/analyseur-motifs-devis-perdus-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/analyseur-motifs-devis-perdus";

const DESCRIPTION =
  "Devis perdus : saisissez vos devis gagnés et vos devis perdus par motif (prix, délai, concurrent préféré, pas de réponse, projet annulé ou reporté, hors cible, sans motif), la commande moyenne, la marge et le temps de chiffrage. L'outil donne le taux de gain, la répartition des pertes, ce qu'elles représentent et ce que rapporterait d'en récupérer une partie. Calcul 100 % local.";

const JSON_LD_DESCRIPTION =
  "Calcule le taux de gain sur les devis tranchés, la répartition des devis perdus par motif (prix, délai, concurrent préféré, pas de réponse, projet annulé ou reporté, hors cible, sans motif) et par groupe, ce que représentent les pertes en commandes, en marge et en temps de chiffrage, et l'effet d'en récupérer une partie. Calcul local.";

const INTRO =
  "Un devis perdu dit quelque chose, à condition d'avoir noté pourquoi. Saisissez vos devis tranchés sur une période, gagnés et perdus par motif : le calcul donne le taux de gain, la répartition des pertes, ce qu'elles représentent en commandes et en temps de chiffrage, et ce que rapporterait d'en récupérer une partie sur les motifs où vous avez la main.";

const NOTE =
  "Tous les devis perdus n'étaient pas gagnables. Ces montants mesurent ce qui est passé devant l'équipe, pas ce qu'elle aurait dû signer.";

export const metadata: Metadata = pageMetadata({
  title: "Analyseur des motifs de devis perdus",
  description: DESCRIPTION,
  path: PATH,
});

export default function AnalyseurMotifsDevisPerdusPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Analyseur des motifs de devis perdus",
    url: `${SITE_URL}${PATH}`,
    description: JSON_LD_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: { "@type": "Organization", name: "QuoteBuilder", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Analyseur des motifs de devis perdus
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <AnalyseurMotifsDevisPerdusCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/analyser-devis-perdus-motifs-perte-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Devis perdus : noter le motif, compter les pertes et corriger ce qui peut l&apos;être
          </Link>
          {" · "}
          <Link href="/fonctionnalites/demandes" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            La liste des demandes QuoteBuilder
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            voir la démo
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos chiffres.
        </p>
      </section>
    </>
  );
}
