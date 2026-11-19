import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurAutoliquidationTvaSousTraitanceBtpCalculator } from "@/components/marketing/verificateur-autoliquidation-tva-sous-traitance-btp-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-autoliquidation-tva-sous-traitance-btp";
const TITLE = "Vérificateur d'autoliquidation de TVA en sous-traitance BTP";
const DESCRIPTION = "Sous-traitance BTP : indiquez votre position, le client, la nature des travaux, la fourniture ou la location éventuelle et le montant HT. Le vérificateur dit si l'autoliquidation de l'article 283, 2 nonies du CGI s'applique, le montant à facturer, la TVA à autoliquider, les mentions du devis et de la facture. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurAutoliquidationTvaSousTraitanceBtpPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Sous-traitant du bâtiment ou entreprise principale : indiquez qui facture qui, la nature des travaux, s'il y a une fourniture seule ou une location de matériel, le document qui vous lie et le montant hors taxes. Le vérificateur dit si l'autoliquidation de l'article 283, 2 nonies du CGI s'applique, quel montant facturer, quelle TVA l'entreprise principale doit autoliquider et quelles mentions porter sur le devis et la facture."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurAutoliquidationTvaSousTraitanceBtpCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/autoliquidation-tva-sous-traitance-btp-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"autoliquidation de la TVA en sous-traitance BTP"}</Link>
          {" · "}<Link href={"/blog/tva-ht-ttc-devis-b2b-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"TVA, HT et TTC dans un devis B2B"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/outils/calculateur-tva-devis-ht-ttc"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de TVA d'un devis"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
