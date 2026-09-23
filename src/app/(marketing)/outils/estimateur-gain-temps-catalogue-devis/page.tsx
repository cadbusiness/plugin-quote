import type { Metadata } from "next";
import Link from "next/link";
import { GainTempsCatalogueCalculator } from "@/components/marketing/gain-temps-catalogue-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur gain de temps catalogue et kits devis",
  description:
    "Estimez les heures et euros gagnés par mois grâce à une bibliothèque de lignes et kits sur vos devis B2B. Calcul local, taux horaire chargé inclus.",
  path: "/outils/estimateur-gain-temps-catalogue-devis",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un audit du temps de chiffrage ?",
    a: "Non. C’est un ordre de grandeur : devis par mois × minutes gagnées, valorisées au taux horaire chargé. Il sert à cadrer un pilote catalogue, pas à calendariser l’équipe.",
  },
  {
    q: "Le pourcentage de lignes biblio entre-t-il dans les euros ?",
    a: "Non. Les heures et les euros partent des minutes gagnées par devis. Le % documente l’hypothèse d’adoption dans le récap, pour que l’équipe sache sur quoi elle s’appuie.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça à une bibliothèque de lignes ?",
    a: "Mesurez d’abord le temps de saisie actuel, puis un pilote de 5 à 10 kits. Lire bibliothèque de lignes et kits pour devis B2B, et l’estimateur de temps de chiffrage pour la baseline.",
  },
];

export default function EstimateurGainTempsCataloguePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur gain de temps catalogue et kits devis B2B",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime les heures et euros gagnés par mois grâce à une bibliothèque de lignes et kits sur les devis B2B.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-gain-temps-catalogue-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur gain de temps catalogue / kits devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Estimez les heures et euros gagnés chaque mois quand une part de vos lignes vient d’une
            bibliothèque (articles + kits) plutôt que d’une saisie manuelle. Calcul 100 % dans votre
            navigateur.{" "}
            <Link
              href="/blog/bibliotheque-lignes-kits-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Bibliothèque de lignes et kits devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <GainTempsCatalogueCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les minutes gagnées par devis sont plafonnées au temps de saisie manuel. Le total mensuel
          est ce gain × le nombre de devis, converti en heures puis en euros au taux horaire chargé.
          L’année reprend le mois × 12. Le temps restant par devis est la saisie actuelle moins les
          minutes gagnées.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/bibliotheque-lignes-kits-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            bibliothèque de lignes et kits
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-temps-chiffrage-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            estimateur temps de chiffrage
          </Link>
          {" · "}
          <Link
            href="/blog/configurateur-devis-vs-excel-pdf"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            configurateur vs Excel + PDF
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/catalogue"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            catalogue
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez du copier-coller à une bibliothèque vivante."
        text="Articles, kits, prix HT. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
