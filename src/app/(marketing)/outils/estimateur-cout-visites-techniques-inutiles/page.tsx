import type { Metadata } from "next";
import Link from "next/link";
import { CoutVisitesTechniquesInutilesEstimator } from "@/components/marketing/cout-visites-techniques-inutiles-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des visites techniques inutiles",
  description:
    "Estimez le coût des visites techniques inutiles avant devis B2B : déplacements, heures perdues, opportunités. Calcul 100 % local, sans envoi de données.",
  path: "/outils/estimateur-cout-visites-techniques-inutiles",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, panier et taux horaire restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "Deux ordres de grandeur : le temps chargé et le déplacement des visites inutiles, et les opportunités si un panier et un pourcentage de deals perdus faute de priorité sont renseignés. Les visites déclenchées et les heures perdues restent visibles même sans panier.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas les deals mal priorisés en euros. Visites, heures et coût temps + déplacement restent affichés.",
  },
  {
    q: "L’outil planifie-t-il les tournées ?",
    a: "Non. Il chiffre le coût d’un filtrage trop faible avant déplacement. La réservation de créneaux reste hors produit (agenda, process équipe).",
  },
  {
    q: "Comment relier ça à un funnel ?",
    a: "Le funnel collecte type d’intervention, accès, photos, urgence et type de client. QuoteBuilder pose un libellé automatique Hot, Warm ou Cold à partir des réponses du formulaire. Il n’est pas configurable. Hypothèses écrites si vous chiffrez sans visite. Le statut Gagné ou Perdu est posé par le commercial. Pas de suivi d’ouverture avancé : la dernière consultation est dans le champ Espace prospect de la fiche commerciale. Pastilles relecteurs : En attente, Consulté, Validé, Modifications. L’équipe est notifiée quand le client invite un relecteur, quand quelqu’un valide ou demande des modifications. Une invitation envoyée par le commercial ne notifie pas l’équipe.",
  },
];

export default function EstimateurCoutVisitesTechniquesInutilesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût des visites techniques inutiles",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime visites inutiles, heures perdues, coût temps et déplacement, et opportunités quand le brief est trop faible avant une visite technique devis B2B.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-visites-techniques-inutiles`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des visites techniques inutiles
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de devis, part de demandes qui déclenchent une visite, part de visites inutiles,
            durée et coûts. L’outil estime les visites déclenchées, les heures perdues, le coût
            temps + déplacement, les opportunités et le total indicatif. Calcul 100 % dans votre
            navigateur.{" "}
            <Link
              href="/blog/visite-technique-avant-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Visite technique avant devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutVisitesTechniquesInutilesEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les visites déclenchées = devis / mois × part qui déclenche une visite. Les visites
          inutiles = ces visites × part « inutiles » (brief trop faible, hors scope, deal déjà
          mort, décideur absent). Les heures perdues = visites inutiles × durée aller-retour +
          visite. Le coût temps = ces heures × le taux horaire chargé. Le déplacement = visites
          inutiles × coût fixe. Si le panier est renseigné, les opportunités = devis / mois × part
          de deals perdus faute de priorité × panier. Le total additionne coût temps, déplacement
          et opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          QuoteBuilder pose un libellé automatique Hot, Warm ou Cold à partir des réponses du
          formulaire. Il n’est pas configurable. Urgence, zone et délai de réponse se trient dans
          l’équipe, hors produit.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/visite-technique-avant-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            visite technique avant devis
          </Link>
          {" · "}
          <Link
            href="/blog/qualifier-demande-devis-avant-chiffrage"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            qualifier avant chiffrage
          </Link>
          {" · "}
          <Link
            href="/blog/score-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            score demande
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-plomberie-sanitaire"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel plomberie
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
        title="Filtrez avant de démarrer le fourgon."
        text="Funnel, photos, hypothèses écrites si vous chiffrez sans visite. Free sans carte."
      />
    </>
  );
}
