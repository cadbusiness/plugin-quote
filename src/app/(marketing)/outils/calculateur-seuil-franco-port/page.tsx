import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurSeuilFrancoPortCalculator } from "@/components/marketing/calculateur-seuil-franco-port-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-seuil-franco-port";

const DESCRIPTION =
  "Seuil franco de port : saisissez le coût moyen d'une livraison, votre marge brute, la part de marge que vous acceptez de consacrer au transport et votre panier moyen. Le calcul donne le seuil franco, la part de marge prise par le transport, la participation à facturer sous le seuil et la mention à reprendre dans le devis. Calcul local, sans compte.";

const JSON_LD_DESCRIPTION =
  "Calcule un seuil franco de port B2B à partir de la marge : seuil exact et arrondi, part de marge prise par le transport, participation sous le seuil et mention pour le devis. Calcul local.";

const INTRO =
  "Offrir la livraison à partir d'un certain montant de commande, c'est payer le transport sur votre marge. Un seuil fixé au jugé peut coûter cher sur les petites commandes. Saisissez le coût moyen d'une livraison, votre marge brute et la part de marge que vous acceptez d'y consacrer : le calcul donne le seuil franco et ce qu'il faut facturer en dessous.";

const NOTE =
  "Le calcul ne remplace pas un conseil comptable ou juridique. Franco dit qui paie le transport, pas qui porte les risques. La protestation au transporteur se fait sous trois jours (article L133-3 du Code de commerce). Le traitement des frais de port sur la facture et pour la TVA se valide avec l'expert-comptable.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de seuil franco de port (B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurSeuilFrancoPortPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de seuil franco de port (B2B)",
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
            Calculateur de seuil franco de port (B2B)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurSeuilFrancoPortCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/frais-port-franco-incoterms-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Frais de port, franco et Incoterms dans un devis B2B
          </Link>
          {" · "}
          <Link
            href="/blog/remise-commerciale-marge-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Remise commerciale et marge
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-frais-deplacement-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Calculateur de frais de déplacement
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
