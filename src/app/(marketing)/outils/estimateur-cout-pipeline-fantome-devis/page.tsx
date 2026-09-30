import type { Metadata } from "next";
import Link from "next/link";
import { CoutPipelineFantomeDevisCalculator } from "@/components/marketing/cout-pipeline-fantome-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût du pipeline fantôme devis",
  description:
    "Estimez le coût des dossiers fantômes dans un pipeline devis B2B : temps de suivi flou, faux espoirs Perdu, Gagné non closés. Calcul 100 % local.",
  path: "/outils/estimateur-cout-pipeline-fantome-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, panier et taux horaire restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "Deux ordres de grandeur : le temps chargé du suivi flou sur les dossiers sans mise à jour de statut depuis 30 jours, et les opportunités si un panier et une part de fantômes qui auraient dû être Perdu sont renseignés. La valeur des Gagné non closés est affichée à part : elle n’entre pas dans le total.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas les Perdu potentiels ni les Gagné non closés en euros. Dossiers fantômes, heures et coût temps restent affichés.",
  },
  {
    q: "L’âge moyen change-t-il le montant ?",
    a: "Non. Il documente le stock dans le récap. Le coût vient des minutes de suivi par dossier fantôme et, si le panier est renseigné, des opportunités Perdu.",
  },
  {
    q: "L’outil change-t-il un statut ou signe-t-il un devis ?",
    a: "Non. C’est un ordre de grandeur pour une revue d’équipe. Gagné et Perdu sont posés par le commercial. Il n’y a pas de signature ni d’acceptation prospect. Les statuts CRM restent les sept de la liste fixe : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Accepté et Signé ne sont pas des statuts.",
  },
];

export default function EstimateurCoutPipelineFantomeDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût du pipeline fantôme devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime dossiers fantômes, heures de suivi flou, coût temps, opportunités Perdu et Gagné non closés dans un pipeline devis B2B.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-pipeline-fantome-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût du pipeline fantôme devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de dossiers ouverts, part sans mise à jour de statut depuis 30 jours, minutes de
            suivi flou, panier et parts qui auraient dû être Perdu ou Gagné. L’outil estime les
            dossiers fantômes, les heures, le coût temps, les opportunités et le total indicatif.
            Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/statuts-pipeline-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Les 7 statuts d’un pipeline devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutPipelineFantomeDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les dossiers fantômes = dossiers ouverts × part sans mise à jour de statut depuis 30
          jours. Les heures perdues = ces fantômes × minutes de suivi, ramenées en heures. Le coût
          temps = ces heures × le taux horaire chargé. Si le panier est renseigné, les opportunités
          = fantômes × part qui aurait dû être Perdu × panier. Le total additionne coût temps et
          opportunités Perdu. La valeur des Gagné non closés est montrée à côté, elle ne s’ajoute
          pas au total.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/statuts-pipeline-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            les 7 statuts pipeline devis
          </Link>
          {" · "}
          <Link
            href="/blog/revue-pipeline-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            revue de pipeline
          </Link>
          {" · "}
          <Link
            href="/blog/score-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            score demande
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
        title="Forcez les sorties Gagné et Perdu."
        text="Sept statuts CRM, revue hebdo, prochaine action datée. Accepté et Signé ne sont pas des statuts. Free sans carte."
      />
    </>
  );
}
