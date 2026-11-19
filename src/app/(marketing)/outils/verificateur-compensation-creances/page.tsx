import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurCompensationCreancesCalculator } from "@/components/marketing/verificateur-compensation-creances-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-compensation-creances";
const TITLE = "Vérificateur de compensation de créances";
const DESCRIPTION = "Compensation de créances dans un devis B2B : facture payée moins des pénalités, avoir, remise ou dommages. Réciprocité, certitude, liquidité, exigibilité, clause, connexité, L441-17, procédure collective, affacturage : douze points contrôlés, montant compensé et reste exigible. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurCompensationCreancesPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Fournisseur dont le client a payé une facture « moins » une somme, ou client qui veut déduire ce que le fournisseur lui doit : indiquez la somme opposée, la voie (légale, convenue ou judiciaire) et la situation. Le vérificateur passe douze points en revue (articles 1347 à 1348-2 du code civil), calcule ce qui peut être compensé et ce qui reste exigible, puis rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurCompensationCreancesCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/compensation-creances-deduction-facture-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"compensation de créances et déductions sur facture"}</Link>
          {" · "}<Link href={"/blog/conditions-paiement-penalites-retard-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"conditions de paiement et pénalités de retard"}</Link>
          {" · "}<Link href={"/blog/delai-livraison-penalites-retard-execution-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"délai de livraison et pénalités"}</Link>
          {" · "}<Link href={"/blog/exception-inexecution-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"exception d'inexécution"}</Link>
          {" · "}<Link href={"/outils/checklist-mentions-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"checklist des mentions d'un devis"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
