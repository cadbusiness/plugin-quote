import type { Metadata } from "next";
import Link from "next/link";
import { RoiLogicielDevisCalculator } from "@/components/marketing/roi-logiciel-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Simulateur ROI logiciel de devis",
  description:
    "Estimez le ROI mensuel d’un logiciel de devis B2B : temps gagné, marge additionnelle, coût d’abonnement et délai de retour. Calcul local dans le navigateur.",
  path: "/outils/simulateur-roi-logiciel-devis",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un business case finance ?",
    a: "Non. C’est un ordre de grandeur : heures de chiffrage, coût chargé, taux d’acceptation, panier, marge et abonnement. Il sert à décider si le scénario tient, pas à budgéter une DAF.",
  },
  {
    q: "Que se passe-t-il si je laisse le taux après outil vide ?",
    a: "Le simulateur conserve votre taux actuel. Seul le gain de temps est alors valorisé. Renseignez un taux après outil seulement si vous avez un historique, pas un souhait.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça à une revue de pipeline ?",
    a: "Le ROI dit si le temps gagné et la marge additionnelle tiennent. La revue hebdo décide ensuite quels Hot chiffrer. Lire revue de pipeline devis B2B.",
  },
];

export default function SimulateurRoiLogicielDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simulateur ROI logiciel de devis B2B",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime le temps gagné, la marge additionnelle et le délai de retour d’un logiciel de devis.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/simulateur-roi-logiciel-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Simulateur ROI d’un logiciel de devis B2B
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Mesurez ce qu’un parcours de devis plus rapide peut apporter chaque mois : temps économisé,
            marge potentielle, coût de l’outil et délai de retour. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/revue-pipeline-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Revue de pipeline devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <RoiLogicielDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le gain de temps, c’est (heures avant − heures après) × coût horaire. Le gain de marge naît
          seulement si le taux d’acceptation monte. Le ROI net retranche l’abonnement (79 € par défaut,
          tarif Pro annuel observé).
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/revue-pipeline-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            revue de pipeline
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-temps-chiffrage-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            temps de chiffrage
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-capacite-equipe-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            capacité équipe
          </Link>
          {" · "}
          <Link href="/tarifs" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            tarifs
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez du scénario au dossier scoré."
        text="Une file unique, un score Hot/Warm/Cold, des relances alignées. Free sans carte."
      />
    </>
  );
}
