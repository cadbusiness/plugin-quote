import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurPreavisReconductionTaciteCalculator } from "@/components/marketing/calculateur-preavis-reconduction-tacite-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-preavis-reconduction-tacite";

const DESCRIPTION =
  "Contrat de prestation récurrente reconduit tacitement : saisissez la date de début, la durée initiale, le mode de reconduction, le préavis et le montant mensuel. Le calcul donne la fin de la période en cours, la date limite pour dénoncer, la fin effective si vous envoyez le courrier à une date donnée, le montant encore engagé et une clause à adapter. Calcul local, sans compte.";

const JSON_LD_DESCRIPTION =
  "Date limite pour dénoncer un contrat reconduit tacitement, fin effective et montant encore engagé. Calcul local, sans compte.";

const INTRO =
  "Un contrat d'entretien, de maintenance ou de nettoyage signé pour un an et « reconduit tacitement » repart pour une période entière si personne ne le dénonce à temps. Saisissez les dates et le préavis prévus au contrat : le calcul donne la date limite pour envoyer le courrier, la date à laquelle le contrat prend réellement fin et ce qui reste à payer d'ici là.";

const NOTE =
  "Le calcul ne remplace pas un conseil juridique. Relisez la clause pour savoir si le préavis court depuis l'envoi ou depuis la réception. Entre professionnels, la loi Chatel ne s'applique pas. La rupture brutale d'une relation commerciale établie est visée par l'article L442-1 II du Code de commerce.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de préavis et de reconduction tacite (contrat B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurPreavisReconductionTacitePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de préavis et de reconduction tacite (contrat B2B)",
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
            Calculateur de préavis et de reconduction tacite (contrat B2B)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurPreavisReconductionTaciteCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/reconduction-tacite-preavis-resiliation-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Reconduction tacite, préavis et résiliation dans un devis B2B
          </Link>
          {" · "}
          <Link
            href="/blog/revision-prix-indexation-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Révision et indexation de prix
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-revision-prix-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Calculateur de révision de prix
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-nettoyage-proprete-entreprise"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Funnel de devis nettoyage et propreté
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
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos saisies, pas un conseil juridique.
        </p>
      </section>
    </>
  );
}
