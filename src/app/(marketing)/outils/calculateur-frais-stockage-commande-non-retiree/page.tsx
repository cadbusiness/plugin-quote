import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurFraisStockageCommandeNonRetireeCalculator } from "@/components/marketing/calculateur-frais-stockage-commande-non-retiree-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-frais-stockage-commande-non-retiree";
const H1 = "Calculateur de frais de stockage et de délais pour une commande non retirée";
const TITLE = "Calculateur de frais de stockage et de délais pour une commande non retirée";
const DESCRIPTION = "Votre client ne vient pas chercher sa commande ou repousse la livraison : calculez les frais de stockage courus, la fin du délai de retrait, le transfert des risques après mise en demeure, la date du séquestre (deux mois, article 1345-1), la résolution de l'article 1657 ou la vente d'un objet confié (loi de 1903). Clause, mise en demeure et récapitulatif à copier. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurFraisStockageCommandeNonRetireePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"La commande est fabriquée, emballée, et le client ne vient pas la chercher ou repousse la livraison. Décrivez la commande, ce que dit votre devis et où en est la relance. L'outil calcule les frais de stockage courus, la fin du délai de retrait, dit à qui sont les risques, à partir de quand vous pouvez confier la commande à un gardien ou la faire vendre, et vous donne la clause pour vos prochains devis et la mise en demeure à envoyer."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurFraisStockageCommandeNonRetireeCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. Les ventes aux consommateurs, les véhicules, les bateaux, les marchés publics, le droit étranger et la TVA des frais de stockage ne sont pas traités. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/commande-non-retiree-frais-stockage-mise-en-demeure-client-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">commande non retirée, frais de stockage et mise en demeure</Link>
          {" · "}<Link href="/blog/exception-inexecution-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"exception d'inexécution"}</Link>
          {" · "}<Link href="/blog/clause-reserve-propriete-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">clause de réserve de propriété</Link>
          {" · "}<Link href="/blog/acomptes-echeances-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">acomptes et échéances</Link>
          {" · "}<Link href="/outils/verificateur-clause-resolutoire" className="font-medium text-mk-accent underline-offset-2 hover:underline">vérificateur de clause résolutoire</Link>
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
