import type { Metadata } from "next";
import Link from "next/link";
import { ComparateurCgvConditionsAchatClientCalculator } from "@/components/marketing/comparateur-cgv-conditions-achat-client-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/comparateur-cgv-conditions-achat-client";
const TITLE = "Comparateur CGV et conditions d'achat du client";
const DESCRIPTION = "Vos conditions générales de vente contre les conditions générales d'achat du client : pour chaque clause (paiement, pénalités, réserve de propriété, responsabilité, retard, tribunal, annulation, révision), l'outil dit ce qui s'applique selon l'article 1119 du code civil, ce qui est neutralisé, et prépare le message pour fixer les points dans le devis signé. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function ComparateurCgvConditionsAchatClientPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Votre devis renvoie à vos conditions générales de vente, le bon de commande du client à ses conditions générales d'achat. Indiquez comment chaque texte a été transmis et ce qu'il prévoit, clause par clause. L'outil dit ce qui s'applique, ce qui tombe, et rédige le message pour fixer les points importants dans le devis signé."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <ComparateurCgvConditionsAchatClientCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/cgv-conditions-achat-client-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"CGV contre conditions d'achat du client"}</Link>
          {" · "}<Link href={"/blog/clause-reserve-propriete-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"la clause de réserve de propriété"}</Link>
          {" · "}<Link href={"/blog/conditions-paiement-penalites-retard-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"conditions de paiement et pénalités de retard"}</Link>
          {" · "}<Link href={"/outils/calculateur-penalites-retard-paiement"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de pénalités de retard de paiement"}</Link>
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
