import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurClauseExclusiviteCalculator } from "@/components/marketing/verificateur-clause-exclusivite-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-clause-exclusivite";
const H1 = "Vérificateur de clause d'exclusivité dans un devis ou un contrat d'approvisionnement";
const TITLE = "Vérificateur de clause d'exclusivité dans un devis ou un contrat d'approvisionnement (durée, périmètre, contreparties)";
const DESCRIPTION = "Achat exclusif, fourniture exclusive ou engagement réciproque : vérifiez la durée (plafond de dix ans de l'article L330-1, seuil de cinq ans du règlement 2022/720), les contrats successifs, le périmètre, les parts de marché, l'après-contrat, la contrepartie, la sortie et l'information précontractuelle. Clause, message et récapitulatif à copier. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurClauseExclusivitePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous proposez une exclusivité dans votre devis, ou votre client vous en demande une. Décrivez la clause, le marché et ce que chacun obtient en échange. L'outil calcule les dates utiles (fin prévue, plafond de dix ans, seuil de cinq ans), vérifie dix points, puis prépare une clause corrigée, un message pour l'autre partie et un récapitulatif pour le dossier."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurClauseExclusiviteCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. La franchise en détail, les clauses d'exclusivité des salariés, les marchés publics et le droit étranger ne sont pas traités. Les parts de marché sont des estimations. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/clause-exclusivite-devis-contrat-approvisionnement-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause d'exclusivité dans un devis B2B"}</Link>
          {" · "}<Link href="/blog/rupture-brutale-relations-commerciales-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"rupture brutale des relations commerciales"}</Link>
          {" · "}<Link href="/blog/cgv-conditions-achat-client-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"CGV et conditions d'achat du client"}</Link>
          {" · "}<Link href="/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"contrat-cadre et bordereau de prix"}</Link>
          {" · "}<Link href="/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"outillage spécifique et amortissement"}</Link>
          {" · "}<Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo rayonnage"}</Link>
          {" · "}<Link href="/tarifs" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"tarifs"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
