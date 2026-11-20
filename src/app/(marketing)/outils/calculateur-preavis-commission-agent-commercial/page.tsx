import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurPreavisCommissionAgentCommercialCalculator } from "@/components/marketing/calculateur-preavis-commission-agent-commercial-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-preavis-commission-agent-commercial";
const H1 = "Calculateur de préavis, de commission et d'indemnité d'agent commercial";
const TITLE = "Calculateur de préavis, de commission et d'indemnité d'agent commercial (ou d'apporteur d'affaires)";
const DESCRIPTION = "Agent commercial ou apporteur d'affaires : calculez le préavis légal (1 à 3 mois, fin de mois civil), la date de fin du contrat, la commission sur un devis signé pendant ou après le contrat, sa date limite de paiement et de relevé, le repère d'indemnité de fin de contrat, le délai d'un an et la limite de deux ans de la non-concurrence. Clause, lettre et récapitulatif à copier. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurPreavisCommissionAgentCommercialPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: H1,
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
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">{H1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous mettez fin au contrat d'un agent commercial, ou un apporteur vous réclame une commission sur un devis signé. Décrivez la mission, le contrat et le devis. L'outil calcule le préavis légal et la date de fin du contrat, dit si la commission du devis est due et jusqu'à quand la payer, donne un repère d'indemnité, la date limite pour la réclamer et la limite de la non-concurrence, puis prépare une clause, une lettre et un récapitulatif à copier."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurPreavisCommissionAgentCommercialCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. Le repère de deux ou trois années vient de Service Public Entreprendre et n'est pas un barème. Les commerciaux salariés et les VRP, les agents à régime particulier, le droit étranger et le délai raisonnable de l'article L134-7 ne sont pas traités. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/agent-commercial-apporteur-affaires-commission-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"agent commercial ou apporteur d'affaires, commission sur les devis signés"}</Link>
          {" · "}<Link href="/blog/rupture-brutale-relations-commerciales-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">rupture brutale des relations commerciales</Link>
          {" · "}<Link href="/blog/clause-exclusivite-devis-contrat-approvisionnement-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause d'exclusivité"}</Link>
          {" · "}<Link href="/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">pouvoir du signataire</Link>
          {" · "}<Link href="/outils/calculateur-preavis-rupture-brutale" className="font-medium text-mk-accent underline-offset-2 hover:underline">calculateur de préavis de rupture brutale</Link>
          {" · "}<Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">Créer un compte Free</Link>
          {" · "}<Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">démo rayonnage</Link>
          {" · "}<Link href="/tarifs" className="font-medium text-mk-accent underline-offset-2 hover:underline">tarifs</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
