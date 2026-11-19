import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurObligationVigilanceSousTraitantCalculator } from "@/components/marketing/verificateur-obligation-vigilance-sous-traitant-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-obligation-vigilance-sous-traitant";
const TITLE = "Vérificateur d'obligation de vigilance : attestation Urssaf et sous-traitant";
const DESCRIPTION = "Obligation de vigilance et attestation Urssaf : indiquez le montant du contrat, les dates et les pièces disponibles. Le vérificateur dit si les vérifications sont obligatoires, ce qui bloque, calcule les renouvellements tous les six mois et rédige le message. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurObligationVigilanceSousTraitantPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Prestataire qui prépare ses documents, ou donneur d'ordre qui les reçoit : indiquez le montant du contrat, les dates, le client et les pièces disponibles. Le vérificateur dit si l'obligation s'applique, ce qui bloque, ce qui reste à compléter, calcule les dates de renouvellement tous les six mois et rédige le message à envoyer."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurObligationVigilanceSousTraitantCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/obligation-vigilance-attestation-urssaf-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"obligation de vigilance et attestation Urssaf"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/outils/checklist-mentions-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"checklist des mentions d'un devis"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-nettoyage-proprete-entreprise"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis nettoyage et propreté"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
