import type { Metadata } from "next";
import Link from "next/link";
import { TeamCapacityCalculator } from "@/components/marketing/team-capacity-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur capacité équipe devis",
  description:
    "Estimez la capacité mensuelle de votre équipe commerciale face au volume Hot/Warm/Cold. Minutes par seau, charge vs capacité, surcharge ou surplus. Calcul 100 % dans le navigateur.",
  path: "/outils/calculateur-capacite-equipe-devis",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un planning RH ?",
    a: "Non. C’est un ordre de grandeur : heures dispo × minutes moyennes par seau. Il sert à voir une surcharge avant de pousser le volume d’entrée, pas à calendariser chaque commercial.",
  },
  {
    q: "Que compter dans les minutes par seau ?",
    a: "Qualification, première réponse et chiffrage moyen. Pas le closing complet ni la visite de site si elle est rare. Ajustez selon le métier.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça à l’assignation et aux SLA ?",
    a: "Si la charge dépasse la capacité, les SLA Hot cassent en premier. Lire assignation et SLA des demandes de devis en équipe, puis plafonner les Hot par owner.",
  },
];

export default function CalculateurCapacitePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur capacité équipe devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime la capacité mensuelle d’une équipe commerciale face au volume de demandes de devis Hot, Warm et Cold.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/calculateur-capacite-equipe-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur de capacité équipe devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Comparez les heures dispo de l’équipe au volume mensuel Hot / Warm / Cold (minutes
            moyennes). Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/assignation-sla-demande-devis-equipe"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Assignation et SLA équipe
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <TeamCapacityCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          La capacité, c’est commerciaux × heures vraiment dispo × semaines du mois. La charge, c’est
          le volume par seau multiplié par les minutes moyennes. L’écart dit si vous tenez les SLA
          ou si vous recrutez du chaos.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/assignation-sla-demande-devis-equipe"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            assignation et SLA
          </Link>
          {" · "}
          <Link
            href="/outils/simulateur-taux-conversion-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            simulateur de conversion
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
        title="Passez de la charge au dossier."
        text="Owner, score et SLA dans la même file. Free sans carte."
      />
    </>
  );
}
