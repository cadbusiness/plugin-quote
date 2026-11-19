import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurAvenantTravauxSupplementairesCalculator } from "@/components/marketing/calculateur-avenant-travaux-supplementaires-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-avenant-travaux-supplementaires";
const TITLE = "Calculateur d'avenant et de travaux supplémentaires : ce qui est sécurisé, ce qui est à risque";
const DESCRIPTION = "Travaux supplémentaires sur un devis : saisissez le montant initial, le type de prix (forfait de construction, prix global, prix unitaires) et jusqu'à cinq lignes avec l'accord du client et l'état des travaux. Le calcul sépare le sécurisé, le à régulariser et le à risque, donne le nouveau montant, l'écart en pourcentage et un projet d'avenant à faire signer. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurAvenantTravauxSupplementairesPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Le chantier avance et le client demande « en plus » une cloison, des prises, un renfort. Certains de ces travaux ont un accord écrit et un prix, d'autres ont seulement été dits au téléphone, d'autres encore ont été faits sans que personne ne les commande. Saisissez le montant du devis initial, le type de marché et jusqu'à cinq lignes de travaux supplémentaires : le calcul sépare ce qui est sécurisé de ce qui est à régulariser ou à risque, donne le nouveau montant et l'écart en pourcentage, et prépare un projet d'avenant à faire signer."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurAvenantTravauxSupplementairesCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/travaux-supplementaires-avenant-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"travaux supplémentaires et avenant au devis"}</Link>
          {" · "}<Link href={"/blog/prix-vente-coefficient-debourse-sec-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"prix de vente et déboursé sec"}</Link>
          {" · "}<Link href={"/blog/revision-prix-indexation-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"révision de prix et indexation"}</Link>
          {" · "}<Link href={"/outils/calculateur-acompte-devis"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur d'acompte"}</Link>
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
