import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurClauseResolutoireCalculator } from "@/components/marketing/verificateur-clause-resolutoire-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-clause-resolutoire";
const TITLE = "Vérificateur de clause résolutoire";
const DESCRIPTION = "Clause résolutoire, résolution unilatérale (article 1226) ou résolution judiciaire dans un devis B2B : indiquez le type de clause, le manquement, la mise en demeure et l'acceptation des CGV. Le vérificateur passe douze points en revue, calcule la date de régularisation et rédige la clause. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurClauseResolutoirePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Prestataire qui rédige ses conditions, ou client qui relit un devis avant de signer : indiquez le type de sortie du contrat, le manquement, la mise en demeure et l'acceptation des CGV. Le vérificateur passe douze points en revue, calcule la date de fin du délai de régularisation, puis rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurClauseResolutoireCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/clause-resolutoire-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause résolutoire dans un devis B2B"}</Link>
          {" · "}<Link href={"/blog/force-majeure-imprevision-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"force majeure et imprévision"}</Link>
          {" · "}<Link href={"/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"annulation, arrhes et dédit"}</Link>
          {" · "}<Link href={"/blog/cgv-conditions-achat-client-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"CGV et conditions d'achat"}</Link>
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
