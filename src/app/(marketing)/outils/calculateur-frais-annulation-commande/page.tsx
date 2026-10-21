import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurFraisAnnulationCommandeCalculator } from "@/components/marketing/calculateur-frais-annulation-commande-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-frais-annulation-commande";

const DESCRIPTION =
  "Commande annulée avant son début : saisissez le montant, la somme versée (acompte ou arrhes), la date de début, la date d'annulation et votre barème. Le calcul donne le palier, l'indemnité, ce qui reste à facturer ou à rembourser, et la compare à vos frais engagés et à votre marge perdue. Calcul 100 % local.";

const JSON_LD_DESCRIPTION =
  "Calcule ce que vous pouvez garder ou réclamer quand une commande B2B est annulée avant son début : palier du barème, indemnité, imputation de l'acompte, arrhes conservées ou restituées au double, comparaison avec les frais engagés et la marge perdue. Calcul local.";

const INTRO =
  "Un client annule une commande signée avant qu'elle commence : une salle réservée, un séminaire, une fabrication, une prestation. Ce que vous pouvez garder dépend de la nature de la somme versée (acompte ou arrhes), de votre barème d'annulation et de la date. Renseignez la commande, l'annulation et votre barème : le calcul donne le palier, l'indemnité, ce qui reste à facturer ou à rembourser, et la compare à ce que l'annulation vous coûte vraiment.";

const NOTE =
  "Le calcul ne remplace pas un conseil juridique. Une clause pénale manifestement excessive peut être réduite par le juge, article 1231-5 du Code civil. Face à un consommateur, une somme versée d'avance sans précision vaut arrhes, article L214-1 du Code de la consommation.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de frais d'annulation (commande B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurFraisAnnulationCommandePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de frais d'annulation (commande B2B)",
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
            {"Calculateur de frais d'annulation (commande B2B)"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurFraisAnnulationCommandeCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            {"Annulation d'une commande B2B : arrhes, acompte, dédit et clause pénale"}
          </Link>
          {" · "}
          <Link
            href="/blog/acomptes-echeances-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Acomptes et échéances
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
