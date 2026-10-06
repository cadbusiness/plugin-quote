import type { Metadata } from "next";
import Link from "next/link";
import { DemandesHorsBudgetFourchetteDevisCalculator } from "@/components/marketing/demandes-hors-budget-fourchette-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur des demandes de devis hors budget et de la fourchette de prix",
  description:
    "Estimez le temps et le coût des demandes de devis qui s'arrêtent au prix, et ce qu'une fourchette indicative affichée plus tôt pourrait éviter. Aperçu du montant d'une ligne (prix min, prix max, quantité). Vos chiffres, calcul 100 % local.",
  path: "/outils/estimateur-demandes-hors-budget-fourchette-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, pourcentages, minutes, taux et prix restent dans votre navigateur. Rien n'est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût indicatif ?",
    a: "Les dossiers hors budget = demandes × le % qui s'arrête au prix. Les heures = ces dossiers × minutes / 60. Le coût = ces heures × le taux horaire. Sur 12 mois, ce coût × 12. La part récupérable part de votre hypothèse : dossiers écartés plus tôt × (minutes avant moins minutes restantes) / 60, puis × le taux. Les minutes restantes sont plafonnées au temps passé par dossier. C'est indicatif, sur vos hypothèses, pas un conseil financier ni un benchmark.",
  },
  {
    q: "Que signifie un prix max vide ?",
    a: "Le prix est fixe : le maximum suit le minimum. Le total de la ligne s'affiche alors en un seul montant. Si le maximum est inférieur au minimum, l'outil remet les deux dans l'ordre. La quantité est ramenée à 1 au minimum.",
  },
  {
    q: "Une fourchette indicative est-elle un devis ?",
    a: "Non. C'est un ordre de grandeur. Dans QuoteBuilder, chaque produit s'annonce en Prix fixe, Fourchette ou Sur devis. La fourchette d'une règle se saisit dans l'édition de la règle (page Règles). Les montants sont dans la devise du produit (l'euro par défaut), sans TVA ni mention HT ou TTC. Le score Hot / Warm / Cold ne lit pas les prix.",
  },
];

export default function EstimateurDemandesHorsBudgetFourchetteDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur des demandes hors budget",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime le temps et le coût des demandes de devis B2B qui s'arrêtent au prix, la part récupérable avec une fourchette indicative affichée plus tôt, et le montant d'une ligne. Calcul local sur vos hypothèses.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-demandes-hors-budget-fourchette-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur des demandes hors budget
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de demandes, part qui s&apos;arrête au prix, temps passé sur ces dossiers, taux horaire, et votre
            hypothèse sur la part qu&apos;une fourchette indicative affichée dès la demande aurait écartée ou recadrée.
            L&apos;outil estime les heures, le coût mensuel et le temps récupérable, puis l&apos;aperçu d&apos;une ligne.
            Ce sont vos hypothèses, pas un benchmark. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/fourchette-prix-indicative-demande-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Fourchette de prix indicative
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <DemandesHorsBudgetFourchetteDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les dossiers hors budget = demandes / mois × le pourcentage qui s&apos;arrête au prix. Les heures = ces
          dossiers × minutes ÷ 60. Le coût = ces heures × le taux horaire chargé. Sur 12 mois, ce coût × 12. Les
          dossiers écartés ou recadrés plus tôt = dossiers hors budget × votre hypothèse de pourcentage. Le temps
          récupérable = ces dossiers × (minutes avant moins minutes restantes) ÷ 60, puis × le taux. Les minutes
          restantes sont plafonnées au temps passé par dossier. Ordre de grandeur pour une discussion d&apos;équipe, pas
          un conseil financier.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          L&apos;aperçu de ligne reprend le montant de ligne de la fiche devis, de l&apos;espace prospect et du PDF : prix
          minimum × quantité et prix maximum × quantité. Si le prix maximum est vide, le prix est fixe. Une fourchette
          saisie à l&apos;envers est remise dans l&apos;ordre. La quantité est ramenée à 1 au minimum. Les options
          d&apos;un produit ne changent pas le montant.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Une fourchette indicative n&apos;est pas un devis. Chaque produit s&apos;annonce en Prix fixe, Fourchette ou
          Sur devis. La fourchette d&apos;une règle de suggestion se saisit dans l&apos;édition de la règle, page Règles,
          pas dans la fenêtre de création. Les montants sont dans la devise du produit (l&apos;euro par défaut), sans TVA
          ni mention HT ou TTC. Le score Hot, Warm
          ou Cold suit une formule fixe qui ne lit pas les prix.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            compte Free
          </Link>
          {" · "}
          <Link
            href="/blog/fourchette-prix-indicative-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            fourchette de prix indicative
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-traiteur-evenementiel"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel devis traiteur
          </Link>
          {" · "}
          <Link
            href="/blog/qualifier-demande-devis-avant-chiffrage"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            qualifier une demande avant chiffrage
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-cout-brief-incomplet"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            coût d&apos;un brief incomplet
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/catalogue"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            catalogue
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Donner un ordre de grandeur dès la demande."
        text="Prix fixe, fourchette ou sur devis sur chaque produit. La fourchette de règle se saisit à l'édition, page Règles. Compte Free sans carte. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
