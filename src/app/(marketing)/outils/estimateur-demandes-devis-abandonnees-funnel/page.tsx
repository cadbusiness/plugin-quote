import type { Metadata } from "next";
import Link from "next/link";
import { DemandesDevisAbandonneesFunnelCalculator } from "@/components/marketing/demandes-devis-abandonnees-funnel-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur des demandes de devis abandonnées en cours de funnel",
  description:
    "Estimez combien de demandes de devis s'arrêtent avant l'envoi, combien sont relançables parce qu'un email a été laissé, et ce qu'une relance de reprise peut rapporter. Plafond et estimation réaliste, effet d'une meilleure capture d'email. Vos chiffres, calcul 100 % local.",
  path: "/outils/estimateur-demandes-devis-abandonnees-funnel",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Parcours, pourcentages et panier restent dans votre navigateur. Rien n'est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le chiffre d'affaires indicatif ?",
    a: "Les abandons = parcours commencés × le % abandonné avant l'envoi. Les relançables = ces abandons × le % qui a laissé un email. Les reprises = relançables × votre % de reprise. Les devis gagnés = reprises × votre % Gagné. Le chiffre d'affaires = ces devis × le panier moyen. Sur 12 mois, ce montant × 12. C'est indicatif, sur vos hypothèses, pas un conseil financier ni un benchmark.",
  },
  {
    q: "Que signifie le plafond théorique ?",
    a: "Relançables × panier moyen. Il suppose que chaque prospect relancé reprend et signe, ce qui n'arrive jamais. Lisez-le comme une borne haute, pas comme une prévision.",
  },
  {
    q: "Que fait QuoteBuilder quand un parcours s'arrête ?",
    a: "Le bandeau de sauvegarde (prénom, email) apparaît à partir de la deuxième étape. Le parcours abandon par défaut relance après une heure puis vingt-quatre heures d'inactivité, avec un lien de reprise. La relance s'arrête si la demande est envoyée. Une session abandonnée n'a ni score ni statut.",
  },
];

export default function EstimateurDemandesDevisAbandonneesFunnelPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur des demandes de devis abandonnées",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime les demandes de devis B2B abandonnées avant l'envoi, la part relançable grâce à l'email laissé, les demandes reprises, les devis gagnés et le chiffre d'affaires associé, comparé au plafond théorique. Calcul local sur vos hypothèses.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-demandes-devis-abandonnees-funnel`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur des demandes de devis abandonnées
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Parcours commencés, part qui s&apos;arrête avant l&apos;envoi, part de ces abandons qui a laissé un email,
            puis vos hypothèses de reprise, de signature et de panier. L&apos;outil estime les demandes relançables, les
            reprises, les devis gagnés et le chiffre d&apos;affaires, et le compare au plafond théorique. Ce sont vos
            hypothèses, pas un benchmark. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/demande-devis-abandonnee-funnel-reprise"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Demandes de devis abandonnées
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <DemandesDevisAbandonneesFunnelCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les demandes abandonnées = parcours commencés / mois × le pourcentage abandonné avant l&apos;envoi. Les
          relançables = ces abandons × le pourcentage qui a laissé un email. Les parcours sans email ne peuvent pas être
          relancés. Les reprises = relançables × votre hypothèse de reprise. Les devis gagnés = reprises × votre taux
          Gagné. Le chiffre d&apos;affaires indicatif = ces devis × le panier moyen. Sur 12 mois, ce montant × 12. Ordre
          de grandeur pour une discussion d&apos;équipe, pas un conseil financier.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le plafond théorique = relançables × panier moyen. Il suppose que chaque prospect relancé reprend et signe.
          C&apos;est une borne haute, pas une prévision. Le gain de capture d&apos;email teste un pourcentage plus élevé
          d&apos;abandons avec email, plafonné à 100 %, avec les mêmes taux de reprise et de signature.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Côté QuoteBuilder, le bandeau de sauvegarde (prénom, email) apparaît à partir de la deuxième étape. Le parcours
          abandon par défaut relance après une heure puis vingt-quatre heures d&apos;inactivité, avec un lien de reprise.
          La relance s&apos;arrête si la demande est envoyée. Une session abandonnée n&apos;a ni score ni statut.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            compte Free
          </Link>
          {" · "}
          <Link
            href="/blog/demande-devis-abandonnee-funnel-reprise"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            demandes de devis abandonnées
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-emballage-conditionnement"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel devis emballage
          </Link>
          {" · "}
          <Link
            href="/blog/pourquoi-les-devis-meurent-sans-relance"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            pourquoi les devis meurent sans relance
          </Link>
          {" · "}
          <Link
            href="/outils/generateur-sequence-relances"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            générateur de séquence de relances
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/autopilote"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Autopilote
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
        title="Relancer les parcours laissés en plan."
        text="Bandeau de sauvegarde à partir de la deuxième étape, parcours abandon après 1 h puis 24 h, lien de reprise. Compte Free sans carte. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
