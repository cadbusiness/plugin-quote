import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurBonATirerValidationProductionCalculator } from "@/components/marketing/verificateur-bon-a-tirer-validation-production-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-bon-a-tirer-validation-production";
const TITLE = "Vérificateur de bon à tirer (BAT) avant production";
const DESCRIPTION = "BAT, épreuve, échantillon, prototype ou présérie : qui valide, par quel écrit, ce que vaut le silence, ce que la validation fige, tours de corrections, date de livraison en jours ouvrés après validation. Douze points contrôlés, la clause et le message prêts. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurBonATirerValidationProductionPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous faites valider un BAT, une épreuve, un échantillon, un prototype ou une présérie avant de produire, ou c'est vous qui validez. Indiquez qui valide, comment, dans quel délai, ce que la validation fige, les tours de corrections et les dates. L'outil passe douze points en revue, calcule la date de livraison en jours ouvrés et le coût des tours en plus, puis rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurBonATirerValidationProductionCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/bon-a-tirer-bat-validation-avant-production-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"bon à tirer et validation avant production"}</Link>
          {" · "}<Link href={"/blog/delai-livraison-penalites-retard-execution-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"délai de livraison et pénalités"}</Link>
          {" · "}<Link href={"/blog/signature-acceptation-devis-en-ligne-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"signature et acceptation du devis"}</Link>
          {" · "}<Link href={"/blog/travaux-supplementaires-avenant-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"travaux supplémentaires et avenant"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-imprimerie-signaletique"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis imprimerie et signalétique"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
