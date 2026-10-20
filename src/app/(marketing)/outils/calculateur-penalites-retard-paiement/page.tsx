import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurPenalitesRetardPaiementCalculator } from "@/components/marketing/calculateur-penalites-retard-paiement-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-penalites-retard-paiement";

const DESCRIPTION =
  "Pénalités de retard entre professionnels : saisissez la date de la facture, le délai convenu, la date de paiement et le montant dû. Le calcul donne l'échéance, le nombre de jours de retard, les pénalités au taux de chaque semestre (BCE + 10 points ou votre taux contractuel), l'indemnité forfaitaire de 40 € par facture et le total à réclamer. Calcul 100 % local.";

const JSON_LD_DESCRIPTION =
  "Calcule l'échéance d'une facture entre professionnels, les jours de retard, les pénalités au taux de chaque semestre (taux BCE majoré de 10 points ou taux contractuel, avec contrôle du plancher de trois fois le taux de l'intérêt légal), l'indemnité forfaitaire de 40 euros par facture et le total à réclamer. Calcul local.";

const INTRO =
  "Entre professionnels, une facture payée après son échéance fait courir des pénalités de retard, sans rappel, et une indemnité forfaitaire de 40 € par facture. Renseignez la facture, le délai convenu et la date de paiement : le calcul donne l'échéance, les jours de retard, les pénalités au taux de chaque semestre et le total à réclamer.";

const NOTE =
  "Le calcul ne remplace pas un conseil juridique. Vérifiez la version en vigueur de l'article L441-10 du Code de commerce, qui change au 1er janvier 2027.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de pénalités de retard de paiement (B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurPenalitesRetardPaiementPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de pénalités de retard de paiement (B2B)",
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
            Calculateur de pénalités de retard de paiement (B2B)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurPenalitesRetardPaiementCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/conditions-paiement-penalites-retard-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Conditions de paiement dans un devis B2B
          </Link>
          {" · "}
          <Link
            href="/blog/mentions-obligatoires-devis-france"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Mentions obligatoires d&apos;un devis
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
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos dates et vos hypothèses, pas un avis
          juridique ni comptable.
        </p>
      </section>
    </>
  );
}
