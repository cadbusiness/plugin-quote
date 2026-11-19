import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurGarantiePaiementMarcheTravauxCalculator } from "@/components/marketing/calculateur-garantie-paiement-marche-travaux-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-garantie-paiement-marche-travaux";
const TITLE = "Calculateur de garantie de paiement d'un marché de travaux privé (article 1799-1)";
const DESCRIPTION = "Garantie de paiement de l'article 1799-1 du Code civil : saisissez le type de client, le financement, le prix du devis accepté, les avenants, les acomptes et les paiements reçus. Le calcul dit si la garantie est due, sous quelle forme, sur quel montant, et à partir de quand vous pouvez suspendre le chantier après mise en demeure. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurGarantiePaiementMarcheTravauxPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Au-delà de 12 000 € HT, le client professionnel qui vous confie des travaux doit garantir le paiement de ce qu'il vous doit : versement direct de son crédit travaux par la banque, ou caution solidaire. Saisissez le client, le financement, le prix du devis accepté, les avenants, les acomptes et les paiements reçus : le calcul dit si la garantie est due, sous quelle forme, sur quel montant, et à partir de quand vous pouvez suspendre le chantier si le client ne la fournit pas."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurGarantiePaiementMarcheTravauxCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/garantie-paiement-1799-1-devis-travaux-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"garantie de paiement de l'article 1799-1 dans un devis de travaux"}</Link>
          {" · "}<Link href={"/blog/retenue-garantie-caution-devis-travaux-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"retenue de garantie et caution dans un devis de travaux"}</Link>
          {" · "}<Link href={"/outils/calculateur-retenue-garantie"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de retenue de garantie"}</Link>
          {" · "}<Link href={"/outils/calculateur-acompte-devis"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur d'acompte de devis"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
