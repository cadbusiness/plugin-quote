import type { Metadata } from "next";
import Link from "next/link";
import { CoutHandoffCommercialTechniqueDevisEstimator } from "@/components/marketing/cout-handoff-commercial-technique-devis-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût handoff commercial → technique devis",
  description:
    "Estimez le coût des mauvais handoffs commercial → technique / bureau d'études sur devis B2B : briefs incomplets, re-qualification, devis annulés. Calcul 100 % local.",
  path: "/outils/estimateur-cout-handoff-commercial-technique-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, panier et taux horaire restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "Deux ordres de grandeur : le temps chargé de re-qualification et de reprise sur les mauvais handoffs, et les opportunités si un panier et un pourcentage de devis retravaillés ou annulés faute de brief sont renseignés. Le pourcentage de handoffs évitables avec funnel et photos est indicatif et n’entre pas dans le total en euros.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas les devis concernés en euros. Mauvais handoffs, heures et coût temps restent affichés.",
  },
  {
    q: "QuoteBuilder est-il un chat interne entre commercial et technique ?",
    a: "Non. L’outil mesure le coût d’un brief trop faible au moment du transfert. Le fil prospect reste un chat plat. Il n’y a pas de module de chat interne.",
  },
  {
    q: "Comment relier ça à un funnel ?",
    a: "Le funnel pose les mêmes questions que la checklist de handoff : type de projet, grandeurs, accès, besoin, photos. QuoteBuilder pose un libellé automatique Hot, Warm ou Cold à partir des réponses du formulaire. Il n’est pas configurable. Urgence et zone se trient dans l’équipe. Le statut Gagné ou Perdu est posé par le commercial.",
  },
];

export default function EstimateurCoutHandoffCommercialTechniqueDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût handoff commercial → technique devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime mauvais handoffs commercial vers technique, heures de re-qualification, coût temps et opportunités quand un brief devis B2B est transmis incomplet.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-handoff-commercial-technique-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût handoff commercial → technique
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de devis concernés par un transfert commercial → technique (ou bureau d’études /
            atelier), part de handoffs au brief incomplet, minutes de re-qualification et hypothèses
            de devis retravaillés. L’outil estime les mauvais handoffs, les heures perdues, le coût
            temps, les opportunités et le total indicatif. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/transfert-brief-commercial-technique-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Transfert brief commercial → technique
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutHandoffCommercialTechniqueDevisEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les mauvais handoffs = devis / mois concernés × part de briefs incomplets. Les heures
          perdues = ces handoffs × minutes de re-qualification et de reprise ÷ 60. Le coût temps =
          ces heures × le taux horaire chargé. Si le panier est renseigné, les opportunités = devis
          / mois concernés × part de devis retravaillés ou annulés faute de brief × panier. Le total
          additionne coût temps et opportunités. Le pourcentage de handoffs évitables avec funnel et
          photos reste un ordre de grandeur : il n’entre pas dans le total en euros.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          QuoteBuilder n’est pas un chat interne. Le libellé automatique Hot, Warm ou Cold suit une
          formule fixe à partir des réponses du formulaire. Il n’est pas configurable. Urgence et
          zone se trient dans l’équipe. Le statut Gagné ou Perdu est posé par le commercial.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/transfert-brief-commercial-technique-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            transfert brief commercial → technique
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-metallerie-serrurerie"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel métallerie / serrurerie
          </Link>
          {" · "}
          <Link
            href="/blog/validation-interne-avant-envoi-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            validation interne
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
        title="Transmettez un brief avant d’assigner le technique."
        text="Checklist, funnel, photos. Free sans carte. Pas de chat interne. La démo rayonnage montre le principe."
      />
    </>
  );
}
