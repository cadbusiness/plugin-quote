import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurMatiereFournieRebutResponsabiliteCalculator } from "@/components/marketing/calculateur-matiere-fournie-rebut-responsabilite-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-matiere-fournie-rebut-responsabilite";
const H1 = "Calculateur de matière fournie par le client : besoin, rebut toléré et responsabilité";
const TITLE = "Calculateur de matière fournie par le client : besoin, rebut toléré et responsabilité";
const DESCRIPTION =
  "Le client vous fournit la matière ou les pièces : calculez la quantité à demander (chutes, rebut toléré, mise en route), l'écart avec ce qui est livré, le rebut au-dessus de la tolérance et sa valeur, qui le supporte (articles 1788 à 1790), et la valeur de matière confiée face à votre plafond et à votre assurance. Clause, courrier et récapitulatif à copier. Calcul local.";
const LEAD =
  "Le client vous livre la matière ou les composants, vous apportez le travail. Indiquez la série, la consommation prévue, ce qui a été livré et ce que dit votre devis. L'outil calcule la quantité à demander, l'écart avec la livraison, le rebut au-dessus de la tolérance et sa valeur, dit qui le supporte, compare la matière confiée à votre plafond et à votre assurance, puis vous donne la clause, le courrier et le récapitulatif.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurMatiereFournieRebutResponsabilitePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{LEAD}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurMatiereFournieRebutResponsabiliteCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">
          {"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. Les ventes aux consommateurs, les matières dangereuses ou réglementées, les métaux précieux, les marchés publics, le droit étranger, la TVA du travail à façon et la procédure collective du client ne sont pas traités. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/matiere-fournie-par-le-client-rebut-perte-responsabilite-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            matière fournie par le client, rebut et responsabilité
          </Link>
          {" · "}
          <Link href="/blog/clause-limitation-responsabilite-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            clause limitative de responsabilité
          </Link>
          {" · "}
          <Link href="/blog/commande-non-retiree-frais-stockage-mise-en-demeure-client-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            commande non retirée, frais de stockage et mise en demeure
          </Link>
          {" · "}
          <Link href="/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            outillage spécifique, propriété et amortissement
          </Link>
          {" · "}
          <Link href="/outils/verificateur-clause-limitation-responsabilite" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            vérificateur de clause limitative de responsabilité
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Créer un compte Free
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          {" · "}
          <Link href="/tarifs" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            tarifs
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
