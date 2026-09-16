import type { Metadata } from "next";
import Link from "next/link";
import { QuotingTimeEstimator } from "@/components/marketing/quoting-time-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur temps de chiffrage devis",
  description:
    "Estimez le temps mensuel de chiffrage Hot/Warm/Cold : minutes par seau, qualification, revisions/versions, charge vs capacité. Calcul 100 % dans le navigateur.",
  path: "/outils/estimateur-temps-chiffrage-devis",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un planning RH ?",
    a: "Non. C’est un ordre de grandeur : volume × minutes (chiffrage, qualification, revisions) vs heures dispo. Il sert à voir si les v2 / v3 mangent le mois, pas à calendariser chaque affaire.",
  },
  {
    q: "Que compter dans les minutes de chiffrage vs revisions ?",
    a: "Le chiffrage, c’est le premier devis. Les revisions couvrent v2 / v3, remises et scope creep. La qualification est le temps avant de produire un montant. Mettez 0 sur une ligne si vous ne voulez pas la compter.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça aux versions de devis ?",
    a: "Si les minutes revisions explosent, le process de versions est trop lourd ou le brief d’entrée trop flou. Lire versions et historique des devis B2B, puis qualifier avant de chiffrer.",
  },
];

export default function EstimateurTempsChiffragePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur temps de chiffrage devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime le temps mensuel de chiffrage des demandes de devis Hot, Warm et Cold, avec qualification et revisions.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-temps-chiffrage-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur de temps de chiffrage devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Estimez les heures mensuelles passées à chiffrer (Hot / Warm / Cold), avec option
            qualification et revisions / versions. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/versions-historique-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Versions et historique des devis
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <QuotingTimeEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          La charge, c’est le volume par seau × minutes de premier chiffrage, plus qualification et
          revisions si vous les activez. La capacité, c’est personnes × heures vraiment dispo pour
          chiffrer. L’écart dit si les v2 / v3 tiennent dans le mois.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/versions-historique-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            versions et historique
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-capacite-equipe-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            capacité équipe
          </Link>
          {" · "}
          <Link
            href="/blog/qualifier-demande-devis-avant-chiffrage"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            qualifier avant chiffrage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez du temps au dossier versionné."
        text="Une version active, un journal, des relances alignées. Free sans carte."
      />
    </>
  );
}
