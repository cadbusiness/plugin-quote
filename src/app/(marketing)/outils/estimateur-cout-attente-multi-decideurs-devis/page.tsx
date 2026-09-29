import type { Metadata } from "next";
import Link from "next/link";
import { CoutAttenteMultiDecideursEstimator } from "@/components/marketing/cout-attente-multi-decideurs-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût d’attente multi-décideurs sur devis",
  description:
    "Estimez le coût de l’attente quand un devis B2B circule chez plusieurs décideurs sans circuit clair : jours d’attente, relances, opportunités. Calcul 100 % local.",
  path: "/outils/estimateur-cout-attente-multi-decideurs-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, panier et taux horaire restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "Deux ordres de grandeur : le temps chargé des relances et clarifications sur les devis multi-décideurs, et les opportunités si un panier et un pourcentage de deals perdus ou retardés sont renseignés. Les jours-homme d’attente mesurent le stock de cycle immobilisé (devis × jours / 20 j ouvrés), pas des heures facturables.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas les deals perdus ou retardés en euros. Devis concernés, jours-homme, heures et coût temps restent affichés.",
  },
  {
    q: "Le nombre de décideurs change-t-il le montant ?",
    a: "Non. Il documente le circuit dans le récap. Le coût vient des jours d’attente additionnels et des minutes de relance sur les devis concernés.",
  },
  {
    q: "Comment relier ça à un circuit client ?",
    a: "Lien unique, invitations de relecteurs, badges vu / approuvé / demande de modifs, commentaires, versions, notifications (invitation, approbation, demande de modifs, validation) et signature sur la dernière version. La fiche peut afficher une dernière consultation relative. Pas de première ouverture, pas de compteur, pas d’historique d’ouvertures, pas d’alerte à la consultation, pas de pixel e-mail.",
  },
];

export default function EstimateurCoutAttenteMultiDecideursPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût d’attente multi-décideurs sur devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime jours d’attente, coût des relances et opportunités quand un devis B2B circule chez plusieurs décideurs sans circuit clair.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-attente-multi-decideurs-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût d’attente multi-décideurs sur devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de devis envoyés à des comptes multi-décideurs, jours d’attente additionnels,
            minutes de relance et taux. L’outil estime les devis concernés, les jours-homme
            d’attente, le coût temps, les opportunités et le total indicatif. Calcul 100 % dans
            votre navigateur.{" "}
            <Link
              href="/blog/approbation-client-multi-decideurs-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Approbation client multi-décideurs sur un devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutAttenteMultiDecideursEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les devis concernés = devis envoyés × part multi-décideurs. Les jours-homme d’attente =
          ces devis × jours d’attente additionnels / 20 jours ouvrés. Les heures perdues = devis
          concernés × minutes de relance, ramenées en heures. Le coût temps = ces heures × le taux
          horaire chargé. Si le panier est renseigné, les opportunités = devis concernés × part de
          deals perdus ou retardés × panier. Le total additionne coût temps et opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/approbation-client-multi-decideurs-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            approbation client multi-décideurs
          </Link>
          {" · "}
          <Link
            href="/blog/commentaires-annotations-devis-collaboratif-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            commentaires collaboratifs
          </Link>
          {" · "}
          <Link
            href="/blog/suivi-ouverture-lecture-devis-en-ligne-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            dernière consultation et relecteurs
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
        title="Faites circuler le devis sur un seul lien."
        text="Invitations, badges relecteurs, versions et signature sur la bonne version. Free sans carte."
      />
    </>
  );
}
