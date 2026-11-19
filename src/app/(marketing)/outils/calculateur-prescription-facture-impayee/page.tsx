import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurPrescriptionFactureImpayeeCalculator } from "@/components/marketing/calculateur-prescription-facture-impayee-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-prescription-facture-impayee";
const TITLE = "Calculateur de prescription d'une facture impayée (devis et factures B2B)";
const DESCRIPTION = "Prescription d'une facture impayée : saisissez la date d'exécution, l'échéance de paiement, le type de client et ce qui s'est passé depuis (relances, paiement partiel, médiation, action en justice). Le calcul donne la date limite pour agir, selon deux points de départ, et les jours restants. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurPrescriptionFactureImpayeePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: TITLE,
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
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
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">{TITLE}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Une facture impayée ne se réclame pas indéfiniment. Entre professionnels, l'action en paiement se prescrit en principe par cinq ans, contre un consommateur par deux ans. Saisissez la date à laquelle la prestation a été exécutée, l'échéance de paiement et ce qui s'est passé depuis : le calcul donne la date limite pour agir, selon les deux points de départ que retiennent les juges, et ce que chaque relance a changé, ou pas."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurPrescriptionFactureImpayeeCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/prescription-facture-impayee-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"prescription d'une facture impayée entre professionnels"}</Link>
          {" · "}<Link href={"/blog/conditions-paiement-penalites-retard-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"conditions de paiement et pénalités de retard"}</Link>
          {" · "}<Link href={"/outils/calculateur-penalites-retard-paiement"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de pénalités de retard de paiement"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
