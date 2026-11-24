import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurReductionPrixExecutionImparfaiteCalculator } from "@/components/marketing/calculateur-reduction-prix-execution-imparfaite-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-reduction-prix-execution-imparfaite";
const H1 = "Calculateur de réduction du prix pour exécution imparfaite (article 1223)";
const TITLE = "Calculateur de réduction du prix pour exécution imparfaite (article 1223)";
const DESCRIPTION = "Votre client trouve un défaut et annonce qu'il paiera moins. Calculez la réduction proportionnelle (éléments touchés et perte de valeur), l'écart avec sa demande, le reste à payer et le coût d'une reprise, puis contrôlez dix points de l'article 1223 du code civil. Clause, courrier et récapitulatif à copier. Calcul local.";
const LEAD = "Votre client a trouvé un défaut et annonce qu'il réduit votre facture. Indiquez le prix, ce qui est déjà payé, le nombre d'éléments livrés et touchés, la perte de valeur que vous retenez et ce que le client demande. L'outil calcule la réduction proportionnelle, l'écart avec la demande, le reste à payer et le coût d'une reprise, contrôle dix points de l'article 1223 du code civil, puis vous donne la clause, le courrier et le récapitulatif.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurReductionPrixExecutionImparfaitePage() {
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
        <CalculateurReductionPrixExecutionImparfaiteCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">
          {"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. Les ventes aux consommateurs, les marchés publics, le droit étranger, les vices cachés (article 1644) et les garanties de la construction (décennale, biennale), la procédure collective du client et le traitement fiscal de l'avoir ne sont pas traités. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/reduction-prix-execution-imparfaite-article-1223-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            réduction du prix pour exécution imparfaite
          </Link>
          {" · "}
          <Link href="/blog/exception-inexecution-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            {"exception d'inexécution"}
          </Link>
          {" · "}
          <Link href="/blog/reception-travaux-proces-verbal-reserves-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            réception des travaux et procès-verbal de réserves
          </Link>
          {" · "}
          <Link href="/blog/compensation-creances-deduction-facture-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            compensation et déduction sur facture
          </Link>
          {" · "}
          <Link href="/outils/verificateur-exception-inexecution" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            {"vérificateur d'exception d'inexécution"}
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
