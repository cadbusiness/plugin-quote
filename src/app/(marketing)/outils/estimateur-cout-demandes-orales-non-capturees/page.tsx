import type { Metadata } from "next";
import Link from "next/link";
import { CoutDemandesOralesNonCaptureesEstimator } from "@/components/marketing/cout-demandes-orales-non-capturees-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des demandes orales non capturées",
  description:
    "Estimez le coût des demandes devis orales (téléphone, WhatsApp, SMS) non capturées en brief structuré : re-qualification, heures perdues, opportunités. Calcul 100 % local.",
  path: "/outils/estimateur-cout-demandes-orales-non-capturees",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, panier et taux horaire restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "Deux ordres de grandeur : le temps chargé de re-qualification des demandes non capturées, et les opportunités si un panier et un pourcentage de deals perdus faute de brief oral sont renseignés. Le pourcentage d’orales qui auraient dû passer par un funnel est indicatif et n’entre pas dans le total en euros.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas les deals perdus en euros. Demandes non capturées, heures et coût temps restent affichés.",
  },
  {
    q: "QuoteBuilder lit-il WhatsApp ou le téléphone ?",
    a: "Non. Ce n’est pas un client WhatsApp ni un standard téléphonique. L’outil mesure le coût d’une capture orale trop faible avant brief ou funnel.",
  },
  {
    q: "Comment relier ça à un funnel ?",
    a: "Le funnel pose les mêmes questions que le script d’appel : type de projet, accès, grandeurs utiles, besoin. QuoteBuilder pose un libellé automatique Hot, Warm ou Cold à partir des réponses du formulaire. Il n’est pas configurable. Urgence et zone se trient dans l’équipe. Le statut Gagné ou Perdu est posé par le commercial.",
  },
];

export default function EstimateurCoutDemandesOralesNonCaptureesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût des demandes orales non capturées",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime demandes orales non capturées, heures de re-qualification, coût temps et opportunités quand un appel ou WhatsApp n’est pas transformé en brief devis structuré.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-demandes-orales-non-capturees`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des demandes orales non capturées
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de demandes orales (téléphone, WhatsApp, SMS), part non capturée dans un brief
            structuré, minutes de re-qualification et hypothèses de deals perdus. L’outil estime
            les demandes non capturées, les heures perdues, le coût temps, les opportunités et le
            total indicatif. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/telephone-whatsapp-vers-brief-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Téléphone et WhatsApp vers brief devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutDemandesOralesNonCaptureesEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les demandes non capturées = demandes orales / mois × part sans brief structuré. Les
          heures perdues = ces demandes × minutes de re-qualification ÷ 60. Le coût temps = ces
          heures × le taux horaire chargé. Si le panier est renseigné, les opportunités = demandes
          orales / mois × part de deals perdus faute de brief × panier. Le total additionne coût
          temps et opportunités. Le pourcentage d’orales qui auraient dû passer par un funnel reste
          un ordre de grandeur : il n’entre pas dans le total en euros.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          QuoteBuilder n’est pas un client WhatsApp ni un standard téléphonique. Le libellé
          automatique Hot, Warm ou Cold suit une formule fixe à partir des réponses du formulaire.
          Il n’est pas configurable. Urgence et zone se trient dans l’équipe.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/telephone-whatsapp-vers-brief-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            téléphone / WhatsApp vers brief
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-electricite-tertiaire"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel électricité tertiaire
          </Link>
          {" · "}
          <Link
            href="/blog/centraliser-demandes-devis-multi-canaux"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            centraliser multi-canaux
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
        title="Capturez le brief le jour de l’appel."
        text="Script, checklist, funnel ou lien prérempli. Free sans carte. Pas de module WhatsApp."
      />
    </>
  );
}
