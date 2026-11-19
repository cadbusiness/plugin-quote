import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurReceptionTravauxReservesCalculator } from "@/components/marketing/verificateur-reception-travaux-reserves-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-reception-travaux-reserves";
const TITLE = "Vérificateur de réception des travaux et des réserves";
const DESCRIPTION = "Procès-verbal de réception, réserves, délai de levée, garantie de parfait achèvement, bon fonctionnement, décennale et retenue de garantie : douze points contrôlés, les dates calculées, la clause et le message prêts. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurReceptionTravauxReservesPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vos travaux sont finis, ou presque. Le client doit les recevoir, avec ou sans réserves, et tout part de cette date : la garantie de parfait achèvement, le bon fonctionnement, la décennale, la libération de la retenue de garantie. Indiquez la forme de la réception, les réserves, le délai de levée et la retenue. L'outil passe douze points en revue (articles 1788, 1792 à 1792-7 du code civil, loi n° 71-584 du 16 juillet 1971), calcule les dates et rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurReceptionTravauxReservesCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/reception-travaux-proces-verbal-reserves-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"réception des travaux, procès-verbal et réserves"}</Link>
          {" · "}<Link href={"/blog/retenue-garantie-caution-devis-travaux-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"retenue de garantie et caution"}</Link>
          {" · "}<Link href={"/blog/attestation-assurance-decennale-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"attestation d'assurance décennale"}</Link>
          {" · "}<Link href={"/blog/travaux-supplementaires-avenant-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"travaux supplémentaires et avenant"}</Link>
          {" · "}<Link href={"/outils/calculateur-retenue-garantie"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de retenue de garantie"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
