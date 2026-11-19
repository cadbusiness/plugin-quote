import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurEcheanceFacturationElectroniqueCalculator } from "@/components/marketing/calculateur-echeance-facturation-electronique-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-echeance-facturation-electronique";
const TITLE = "Calculateur d'échéance de facturation électronique (TPE, PME, ETI)";
const DESCRIPTION = "Facturation électronique : saisissez votre effectif, votre chiffre d'affaires, votre bilan et votre clientèle. Le calcul donne votre catégorie (micro, PME, ETI, grande entreprise), vos dates de réception et d'émission, le e-reporting qui vous concerne, les nouvelles mentions et l'amende théorique. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurEcheanceFacturationElectroniquePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Depuis le 1er septembre 2026, toutes les entreprises assujetties à la TVA en France doivent pouvoir recevoir des factures électroniques. L'obligation d'émettre arrive le 1er septembre 2026 pour les grandes entreprises et les ETI, le 1er septembre 2027 pour les PME et les micro-entreprises. Saisissez votre effectif, votre chiffre d'affaires, votre total de bilan et votre type de clientèle : le calcul donne votre catégorie, vos dates, ce qui est déjà en retard et l'amende théorique si rien ne bouge."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurEcheanceFacturationElectroniqueCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/facturation-electronique-2026-devis-b2b-tpe-pme"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"facturation électronique 2026, du devis à la facture"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/outils/calculateur-tva-devis-ht-ttc"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de TVA HT et TTC"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
