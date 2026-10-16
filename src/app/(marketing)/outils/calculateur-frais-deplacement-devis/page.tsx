import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurFraisDeplacementDevisCalculator } from "@/components/marketing/calculateur-frais-deplacement-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-frais-deplacement-devis";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur des frais de déplacement par zone",
  description:
    "Frais de déplacement d'un devis : saisissez le coût de votre véhicule au kilomètre, l'équipe, le coût horaire, la vitesse moyenne, les allers-retours par chantier, trois zones d'intervention et un chantier type. Le calcul donne le coût du trajet par zone, la part de la marge, le forfait à afficher et le montant minimum de commande. Calcul 100 % local.",
  path: PATH,
});

export default function CalculateurFraisDeplacementDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur des frais de déplacement par zone",
    url: `${SITE_URL}${PATH}`,
    description:
      "Calcule le coût d'un déplacement vers un chantier (véhicule, temps d'équipe, péages, nombre d'allers-retours) pour trois zones d'intervention, la part de la marge d'un chantier type qu'il représente, le forfait de déplacement à afficher, le montant minimum de commande et la distance à partir de laquelle le trajet mange la marge. Calcul local.",
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
            Calculateur des frais de déplacement par zone
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Le trajet est la ligne qu&apos;on oublie dans un devis. Renseignez ce que vous coûte un aller-retour et vos
            zones d&apos;intervention : le calcul donne, pour chaque zone, le coût du déplacement sur un chantier, la
            part de la marge qu&apos;il prend, le forfait à afficher, et le montant de commande à partir duquel le
            trajet reste supportable.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurFraisDeplacementDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">
          Le forfait « au-delà de la part absorbée » facture seulement ce que la marge ne supporte pas. Le « coût
          complet » facture tout le trajet. Les montants sont arrondis à la dizaine d&apos;euros supérieure.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/zone-intervention-frais-deplacement-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Zone d&apos;intervention et frais de déplacement dans un devis
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/catalogue"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Le catalogue QuoteBuilder
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
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un avis comptable.
        </p>
      </section>
    </>
  );
}
