import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurTvaClientEtrangerDevisCalculator } from "@/components/marketing/verificateur-tva-client-etranger-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-tva-client-etranger-devis";
const TITLE = "Vérificateur TVA client étranger pour un devis B2B";
const DESCRIPTION = "Client dans un autre pays de l'Union européenne ou hors UE : TVA française ou non, exonération intracommunautaire, export, autoliquidation, numéro de TVA, preuves de transport, état récapitulatif, mentions de facture et passage au CIBS en 2027. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurTvaClientEtrangerDevisPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Votre client est installé dans un autre pays de l'Union européenne ou hors de l'Union, ou les biens partent à l'étranger. Indiquez ce que vous vendez, où vont les biens, qui est le client, son numéro de TVA, le transport et vos preuves. L'outil indique le régime qui ressort de vos réponses, la TVA française à facturer ou celle qui est en jeu, les mentions de facture, la clause à mettre dans le devis et le message à envoyer au client."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurTvaClientEtrangerDevisCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/tva-client-etranger-ue-export-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"TVA d'un devis pour un client étranger"}</Link>
          {" · "}<Link href={"/blog/tva-ht-ttc-devis-b2b-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"TVA, HT et TTC sur un devis B2B"}</Link>
          {" · "}<Link href={"/blog/frais-port-franco-incoterms-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"frais de port, franco et Incoterms"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-usinage-sous-traitance-pieces"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis usinage et sous-traitance de pièces"}</Link>
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
