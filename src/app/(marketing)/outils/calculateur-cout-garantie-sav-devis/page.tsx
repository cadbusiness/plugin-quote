import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurCoutGarantieSavDevisCalculator } from "@/components/marketing/calculateur-cout-garantie-sav-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-cout-garantie-sav-devis";

const DESCRIPTION =
  "Coût de la garantie dans un devis B2B : saisissez le prix, la marge, la durée de garantie, le taux d'intervention et le coût d'une intervention. Le calcul donne la provision par vente, sa part du prix et de la marge, une comparaison par durée, le prix d'une année supplémentaire et une ligne de garantie pour le devis. Calcul local, sans compte.";

const JSON_LD_DESCRIPTION =
  "Calcule le coût d'une garantie pièces et main-d'œuvre sur un devis B2B : provision par vente, part du prix et de la marge, prix d'une année de plus et ligne de garantie. Calcul local.";

const INTRO =
  "Une garantie « pièces et main-d'œuvre » a un coût, même quand rien ne casse sur un dossier précis. Sur l'ensemble de vos ventes, une partie des équipements demandera une intervention. Saisissez vos chiffres : le calcul donne ce qu'il faut prévoir par vente, ce que ça pèse sur votre marge, et le prix d'une extension.";

const NOTE =
  "Le calcul est une moyenne sur un ensemble de ventes : sur un dossier donné, il y aura zéro intervention, ou plusieurs. La garantie contractuelle s'ajoute aux garanties légales, dont la garantie des vices cachés des articles 1641 et suivants du Code civil, qui s'applique aussi entre professionnels. Ce n'est pas un conseil comptable ni juridique.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de coût de garantie et de SAV (devis B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurCoutGarantieSavDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de coût de garantie et de SAV (devis B2B)",
    url: `${SITE_URL}${PATH}`,
    description: JSON_LD_DESCRIPTION,
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
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur de coût de garantie et de SAV (devis B2B)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurCoutGarantieSavDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/garantie-vices-caches-sav-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Garantie et SAV dans un devis B2B
          </Link>
          {" · "}
          <Link
            href="/blog/retenue-garantie-caution-devis-travaux-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Retenue de garantie dans un devis de travaux
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-seuil-remise-marge"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Calculateur de seuil de remise
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            voir la démo
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un conseil comptable ni
          juridique.
        </p>
      </section>
    </>
  );
}
