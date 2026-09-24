import type { Metadata } from "next";
import Link from "next/link";
import { CoutDevisPdfSeulsEstimator } from "@/components/marketing/cout-devis-pdf-seuls-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des devis PDF seuls",
  description:
    "Estimez heures perdues, coût chargé et opportunités manquées quand vos devis partent en PDF e-mail plutôt qu’en lien sécurisé. Calcul 100 % local.",
  path: "/outils/estimateur-cout-devis-pdf-seuls",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux et panier restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesurent les devis fantômes ?",
    a: "Un ordre de grandeur : la part jamais ouverte, plus 70 % de la part versions obsolètes ou mauvaises pièces jointes, plafonnée à 100 % du volume. Ce n’est pas un taux de perte comptable.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas l’écart de conversion en euros. Heures, coût de friction, fantômes et deals récupérés restent affichés.",
  },
  {
    q: "Comment relier ça à l’envoi par lien ?",
    a: "Comparez le PDF en pièce jointe à un lien sécurisé (espace prospect, versions, relances, signature). Lire envoyer un devis par lien vs PDF, l’espace prospect, et les versions.",
  },
];

export default function EstimateurCoutDevisPdfSeulsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût des devis PDF seuls",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures perdues, coût chargé et opportunités manquées quand les devis B2B partent en PDF e-mail plutôt qu’en lien sécurisé / espace prospect.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-devis-pdf-seuls`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des devis PDF seuls
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de devis envoyés en PDF, part jamais ouverte, versions ou pièces jointes foireuses,
            temps de ressaisie et écart de conversion face à un lien sécurisé. L’outil estime les heures
            perdues, le coût chargé et les opportunités manquées. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/envoyer-devis-lien-securise-vs-pdf-email"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Envoyer un devis par lien sécurisé vs PDF
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutDevisPdfSeulsEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les heures perdues = devis × minutes de ressaisie. Le coût de friction = ces heures × le
          taux horaire chargé. Les fantômes combinent la part jamais ouverte et 70 % de la part
          versions ou pièces jointes foireuses, sans dépasser le volume. Les deals récupérés = volume
          × écart entre le taux de conversion avec lien et le taux PDF actuel (écart négatif ignoré).
          Si le panier est renseigné, les opportunités manquées = deals × panier. Le total additionne
          friction et opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/envoyer-devis-lien-securise-vs-pdf-email"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            lien sécurisé vs PDF
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/espace-prospect"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            espace prospect
          </Link>
          {" · "}
          <Link
            href="/blog/versions-historique-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            versions et historique
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
        title="Passez les devis Hot en lien, gardez le PDF en export."
        text="Espace prospect, versions, relances sur ouverture réelle. Free sans carte."
      />
    </>
  );
}
