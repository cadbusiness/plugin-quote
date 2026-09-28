import type { Metadata } from "next";
import Link from "next/link";
import { CoutDevisSansValidationEstimator } from "@/components/marketing/cout-devis-sans-validation-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des devis envoyés sans validation interne",
  description:
    "Estimez le coût des devis B2B envoyés sans relecture interne : corrections, remises sauvages, heures perdues, opportunités. Calcul 100 % local.",
  path: "/outils/estimateur-cout-devis-sans-validation",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, panier et taux horaire restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "La somme de trois ordres de grandeur : le temps chargé des corrections après envoi, le coût indicatif des remises ou erreurs de marge sur les devis partis sans relecture, et les opportunités si un panier et un écart de conversion sont renseignés.",
  },
  {
    q: "Pourquoi marge et opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas l’écart de marge ni l’écart de conversion en euros. Devis à risque, corrections, heures et coût de friction restent affichés.",
  },
  {
    q: "Comment relier ça à un process de validation ?",
    a: "Statut brouillon / en validation / prêt, checklist courte, seuil de remise et version figée à l’envoi. Lire la validation interne avant envoi d’un devis B2B.",
  },
];

export default function EstimateurCoutDevisSansValidationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût des devis envoyés sans validation interne",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures perdues, coût marge et opportunités manquées quand les devis B2B partent sans relecture interne.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-devis-sans-validation`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des devis envoyés sans validation interne
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de devis, part envoyée sans relecture, taux de correction, remises sauvages et
            taux. L’outil estime les dossiers à risque, les heures perdues, le coût de friction, le
            coût marge et le total indicatif. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/validation-interne-avant-envoi-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Validation interne avant envoi d’un devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutDevisSansValidationEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les devis à risque = devis envoyés × part sans relecture. Les corrections = ces devis ×
          taux de correction après envoi. Les heures perdues = corrections × minutes, ramenées en
          heures. Le coût de friction = ces heures × le taux horaire chargé. Le coût marge = devis
          à risque × part de remise sauvage × panier × écart de marge. Si le panier est renseigné,
          les opportunités = devis à risque × écart de conversion (en points) × panier. Le total
          additionne friction, marge et opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/validation-interne-avant-envoi-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            validation interne avant envoi
          </Link>
          {" · "}
          <Link
            href="/blog/remise-commerciale-marge-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            remise et marge
          </Link>
          {" · "}
          <Link
            href="/blog/commentaires-annotations-devis-collaboratif-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            commentaires collaboratifs
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
        title="Faites partir les devis après relecture."
        text="Statut en validation, seuil de remise, version figée à l’envoi. Free sans carte."
      />
    </>
  );
}
