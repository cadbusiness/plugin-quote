import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurInteretsMoratoiresMarchePublicCalculator } from "@/components/marketing/calculateur-interets-moratoires-marche-public-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-interets-moratoires-marche-public";
const TITLE = "Calculateur d'intérêts moratoires pour un marché public";
const DESCRIPTION = "Facture payée en retard par un acheteur public : échéance de 30, 50 ou 60 jours, point de départ, interruption, jours de retard, intérêts moratoires au taux BCE plus huit points, indemnité de 40 €, clause du prochain devis et message à l'acheteur. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurInteretsMoratoiresMarchePublicPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: TITLE,
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
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">{TITLE}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Votre client est une collectivité, un établissement public, un hôpital ou une entreprise publique, et il a payé votre facture en retard. Indiquez l'acheteur, le marché, la facture et les dates. L'outil calcule l'échéance du paiement, les jours de retard, les intérêts moratoires et l'indemnité forfaitaire de 40 €, vérifie dix points, et prépare la clause du prochain devis et le message à envoyer à l'acheteur."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurInteretsMoratoiresMarchePublicCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/devis-acheteur-public-marche-sans-publicite-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"devis pour un acheteur public"}</Link>
          {" · "}<Link href={"/blog/conditions-paiement-penalites-retard-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"conditions de paiement et pénalités de retard"}</Link>
          {" · "}<Link href={"/blog/retenue-garantie-caution-devis-travaux-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"retenue de garantie"}</Link>
          {" · "}<Link href={"/blog/acomptes-echeances-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"acomptes et échéances"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-sol-industriel-resine-marquage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis sol industriel et marquage au sol"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          {" · "}<Link href={"/tarifs"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"tarifs"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
