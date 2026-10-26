import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurCoefficientVenteDevisCalculator } from "@/components/marketing/calculateur-coefficient-vente-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-coefficient-vente-devis";

const DESCRIPTION =
  "Coefficient de vente : saisissez votre déboursé sec (achats, heures, coût horaire chargé, autres coûts directs), vos frais généraux et le bénéfice visé. Le calcul donne le prix de vente HT, le coefficient, le taux de marque et le taux de marge, le prix plancher et le bénéfice réel d'un prix envisagé. Calcul local, sans compte.";

const JSON_LD_DESCRIPTION =
  "Calcule le coefficient de vente et le prix de vente HT d'un devis B2B à partir du déboursé sec, des frais généraux et du bénéfice visé. Prix plancher, taux de marque, taux de marge et bénéfice réel d'un prix envisagé. Calcul local.";

const INTRO =
  "Un prix de devis se construit à partir de ce que le chantier ou la commande vous coûte directement, le déboursé sec. On y ajoute la part des frais généraux et le bénéfice visé, et l'on obtient un coefficient de vente. Saisissez vos coûts et vos taux : le calcul donne le prix de vente HT, le coefficient, le taux de marque et le taux de marge, le prix plancher et ce que rapporte vraiment le prix que vous envisagez.";

const NOTE =
  "Le calcul ne remplace pas un conseil comptable ou juridique. Les frais généraux et le bénéfice sont exprimés en pourcentage du prix de vente HT. Le taux de marque se lit sur le prix, le taux de marge sur le coût. La revente en l'état sous le prix d'achat effectif est interdite (article L442-5 du Code de commerce).";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de coefficient de vente et de prix de vente HT (devis B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurCoefficientVenteDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de coefficient de vente et de prix de vente HT (devis B2B)",
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
            Calculateur de coefficient de vente et de prix de vente HT (devis B2B)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurCoefficientVenteDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/prix-vente-coefficient-debourse-sec-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            calculer le prix de vente d&apos;un devis B2B
          </Link>
          {" · "}
          <Link
            href="/blog/remise-commerciale-marge-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            remise commerciale et marge
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-seuil-remise-marge"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            calculateur de seuil de remise
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo funnel rayonnage
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un conseil comptable ni
          juridique. Faites valider votre taux de frais généraux et votre coût horaire par votre expert-comptable.
        </p>
      </section>
    </>
  );
}
