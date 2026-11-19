import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurDeclarationCreanceProcedureCollectiveCalculator } from "@/components/marketing/calculateur-declaration-creance-procedure-collective-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-declaration-creance-procedure-collective";
const TITLE = "Calculateur de déclaration de créance en procédure collective";
const DESCRIPTION = "Votre client est en sauvegarde, en redressement ou en liquidation judiciaire ? Date limite de déclaration depuis la publication au BODACC, montant à déclarer, contrat en cours, réserve de propriété, relevé de forclusion, déclaration type et récapitulatif. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurDeclarationCreanceProcedureCollectivePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Votre client vient d'être placé en sauvegarde, en redressement ou en liquidation judiciaire alors qu'un devis est en cours ou qu'une facture reste due. Indiquez la procédure, les dates du jugement et de sa publication au BODACC, ce qui a été livré et payé, et où en est le contrat. L'outil calcule la date limite de déclaration, le montant à déclarer, les autres délais à surveiller, et prépare la déclaration."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurDeclarationCreanceProcedureCollectiveCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/client-procedure-collective-declaration-creance-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"client en redressement ou liquidation judiciaire"}</Link>
          {" · "}<Link href={"/blog/clause-reserve-propriete-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause de réserve de propriété"}</Link>
          {" · "}<Link href={"/blog/acomptes-echeances-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"acomptes et échéances"}</Link>
          {" · "}<Link href={"/blog/conditions-paiement-penalites-retard-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"conditions de paiement et pénalités"}</Link>
          {" · "}<Link href={"/blog/compensation-creances-deduction-facture-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"compensation de créances"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-usinage-sous-traitance-pieces"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis usinage et sous-traitance"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          {" · "}<Link href={"/tarifs"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"tarifs"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
