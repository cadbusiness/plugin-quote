import type { Metadata } from "next";
import Link from "next/link";
import { ConversionRateCalculator } from "@/components/marketing/conversion-rate-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Simulateur taux de conversion devis",
  description:
    "Simulez le CA mensuel et annualisé selon votre taux de conversion de devis actuel vs cible. Mini-outil gratuit QuoteBuilder, calcul 100 % dans le navigateur.",
  path: "/outils/simulateur-taux-conversion-devis",
});

const FAQ = [
  {
    q: "Le calcul est-il une prévision de CA ?",
    a: "Non. C’est un écart arithmétique : volume × panier × (taux cible − taux actuel). Il rend visible un levier. Il ne promet pas que le scoring ou les relances atteindront le taux cible tout seuls.",
  },
  {
    q: "Que signifie le CA pondéré Hot / Warm / Cold ?",
    a: "Si vous activez le mix à 100 %, chaque seau pèse sa part des envois multipliée par son taux de close. Utile quand un Hot convertit nettement mieux qu’un Cold.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça à la qualification ?",
    a: "Un point de conversion en plus vient souvent d’un brief plus propre, pas d’un volume d’envois plus haut. Lire qualifier une demande avant de chiffrer, puis le score brief.",
  },
];

export default function SimulateurConversionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simulateur taux de conversion devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Simule le CA mensuel et annualisé d’un flux de devis B2B selon le taux de conversion actuel et cible.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/simulateur-taux-conversion-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Simulateur de taux de conversion devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Estimez le CA mensuel au taux actuel, au taux cible, le gain et l’annualisé. Calcul 100 % dans
            votre navigateur.{" "}
            <Link
              href="/blog/qualifier-demande-devis-avant-chiffrage"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Qualifier avant de chiffrer
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <ConversionRateCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le taux actuel est votre closing réel sur les devis envoyés. Le taux cible est ce que vous jugez
          tenable si le brief est qualifié et les relances partent. L’outil ne simule pas la saisonnalité ni
          le mix produit.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/outils/score-brief-devis" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            score brief devis
          </Link>
          {" · "}
          <Link
            href="/blog/qualifier-demande-devis-avant-chiffrage"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            qualifier avant chiffrage
          </Link>
          {" · "}
          <Link href="/outils/cout-devis-non-relance" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            coût d’un devis non relancé
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez du taux au dossier."
        text="Funnel à l’entrée. Score et relances ensuite. Free sans carte."
      />
    </>
  );
}
