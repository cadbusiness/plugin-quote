import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurClauseLimitationResponsabiliteCalculator } from "@/components/marketing/verificateur-clause-limitation-responsabilite-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-clause-limitation-responsabilite";
const TITLE = "Vérificateur de clause de limitation de responsabilité";
const DESCRIPTION = "Clause de limitation de responsabilité dans un devis B2B : indiquez le prix, le plafond, les préjudices exclus, la façon dont la clause a été acceptée et un sinistre type. Le vérificateur passe douze points en revue, chiffre ce que la clause laisse payer et rédige la clause. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurClauseLimitationResponsabilitePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Prestataire qui rédige ses conditions, ou client qui les relit avant de signer : indiquez le prix du devis, le plafond, les préjudices exclus, la façon dont la clause a été acceptée et un sinistre type. Le vérificateur passe douze points en revue, chiffre ce que la clause laisse réellement payer et rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurClauseLimitationResponsabiliteCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/clause-limitation-responsabilite-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause de limitation de responsabilité dans un devis B2B"}</Link>
          {" · "}<Link href={"/blog/garantie-vices-caches-sav-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"garantie des vices cachés et SAV"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/outils/checklist-mentions-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"checklist des mentions d'un devis"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
