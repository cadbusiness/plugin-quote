import type { Metadata } from "next";
import Link from "next/link";
import { AcompteDevisCalculator } from "@/components/marketing/acompte-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur acompte et échéances devis B2B",
  description:
    "Estimez l’acompte TTC, le reste dû et une répartition simple en jalons sur un devis B2B. Impact trésorerie indicatif. Calcul local dans le navigateur.",
  path: "/outils/calculateur-acompte-devis",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un échéancier contractuel ?",
    a: "Non. C’est un ordre de grandeur : HT, TVA, % ou montant fixe, répartition indicative en 1 à 4 jalons. Il sert à cadrer une discussion d’équipe, pas à rédiger des CGV.",
  },
  {
    q: "Sur quelle base calcule-t-on l’acompte ?",
    a: "Sur le total TTC (HT × (1 + TVA)). En mode pourcentage, l’acompte = TTC × %. En mode montant fixe, l’acompte est plafonné au TTC.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça au devis ?",
    a: "Affichez acompte TTC, reste dû et jalons sur le devis, et bloquez le lancement atelier tant que l’acompte n’est pas confirmé. Lire acomptes et échéances sur devis B2B.",
  },
];

export default function CalculateurAcompteDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur acompte et échéances devis B2B",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime acompte TTC, reste dû, répartition en jalons et délai de démarrage indicatif sur un devis B2B.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/calculateur-acompte-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur d’acompte et d’échéances devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Estimez l’acompte TTC, le reste dû, une répartition simple en jalons, et un ordre de
            grandeur d’impact trésorerie si le démarrage attend le paiement. Calcul 100 % dans votre
            navigateur.{" "}
            <Link
              href="/blog/acomptes-echeances-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Acomptes et échéances sur devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <AcompteDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le total TTC part du HT et du taux de TVA. L’acompte est un pourcentage de ce TTC, ou un
          montant fixe plafonné au TTC. Le reste dû est la différence. Les jalons reprennent
          l’acompte en premier, puis répartissent le solde. Le dernier jalon absorbe l’écart de
          centimes.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/acomptes-echeances-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            acomptes et échéances
          </Link>
          {" · "}
          <Link
            href="/blog/signature-acceptation-devis-en-ligne-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            signature / acceptation en ligne
          </Link>
          {" · "}
          <Link
            href="/blog/validite-expiration-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            validité et expiration
          </Link>
          {" · "}
          <Link
            href="/outils/simulateur-cout-devis-expires"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            simulateur coût devis expirés
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez de l’acompte oral au dossier cadré."
        text="Montant, jalons, version acceptée, suivi. Free sans carte."
      />
    </>
  );
}
