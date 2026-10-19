import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurRevisionPrixDevisCalculator } from "@/components/marketing/calculateur-revision-prix-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-revision-prix-devis";

const DESCRIPTION =
  "Révision de prix d'un devis : saisissez le prix initial, la partie fixe, jusqu'à trois indices avec leur poids et leurs valeurs de départ et d'arrivée, un seuil de déclenchement et un plafond. Le calcul donne le coefficient, le prix révisé, l'effet de chaque indice, ce que la partie fixe et le plafond laissent à votre charge, et votre marge avec et sans clause. Calcul 100 % local.";

const JSON_LD_DESCRIPTION =
  "Calcule la révision du prix d'un devis selon une formule à partie fixe et jusqu'à trois indices pondérés : coefficient, prix révisé, effet de chaque indice, effet d'un seuil de déclenchement et d'un plafond, et marge avec et sans clause. Calcul local.";

const INTRO =
  "Une clause de révision dit comment le prix d'un devis suit vos coûts entre la date du devis et l'exécution. Renseignez le prix, la partie fixe et les indices de votre formule : le calcul donne le coefficient, le prix révisé, ce que chaque indice change, ce que la partie fixe et le plafond laissent à votre charge, et votre marge avec et sans clause.";

const NOTE =
  "La formule est P = P0 × (partie fixe + partie variable × Σ poids × I1/I0). Prenez les valeurs définitives des indices aux mois que fixe la clause : départ au mois du devis, arrivée au mois de la livraison, de la pose ou de la facture.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de révision de prix",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurRevisionPrixDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de révision de prix",
    url: `${SITE_URL}${PATH}`,
    description: JSON_LD_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: { "@type": "Organization", name: "QuoteBuilder", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur de révision de prix
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurRevisionPrixDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/revision-prix-indexation-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Révision de prix dans un devis B2B : choisir l&apos;indice, écrire la formule et l&apos;annoncer dès la
            demande
          </Link>
          {" · "}
          <Link href="/fonctionnalites/catalogue" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Le catalogue QuoteBuilder
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            voir la démo
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un avis juridique ni
          comptable.
        </p>
      </section>
    </>
  );
}
