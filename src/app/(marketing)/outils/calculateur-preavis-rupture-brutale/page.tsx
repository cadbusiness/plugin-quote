import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurPreavisRuptureBrutaleCalculator } from "@/components/marketing/calculateur-preavis-rupture-brutale-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-preavis-rupture-brutale";
const TITLE = "Calculateur de préavis de rupture brutale";
const DESCRIPTION = "Rupture brutale d'une relation commerciale établie (article L442-1 II du code de commerce) : ancienneté, préavis écrit, dépendance, usages, plafond de dix-huit mois, conditions pendant le préavis. Repère de préavis, préavis manquant, perte de marge estimée, lettre et clause. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurPreavisRuptureBrutalePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Un client récurrent annonce qu'il arrête, ou réduit fortement ses commandes, avec un préavis qui paraît court. Ou c'est vous qui voulez arrêter un partenaire de longue date sans prendre de risque. Indiquez les dates, la place du partenaire dans votre chiffre d'affaires et ce qui a été écrit. Le calculateur passe douze points en revue (article L442-1 II du code de commerce et décisions de la Cour de cassation), donne un repère de préavis, le préavis manquant et la perte de marge estimée, puis rédige la clause et le courrier."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurPreavisRuptureBrutaleCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/rupture-brutale-relations-commerciales-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"rupture brutale d'une relation commerciale établie"}</Link>
          {" · "}<Link href={"/blog/reconduction-tacite-preavis-resiliation-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"reconduction tacite et préavis de résiliation"}</Link>
          {" · "}<Link href={"/outils/calculateur-preavis-reconduction-tacite"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de préavis de reconduction tacite"}</Link>
          {" · "}<Link href={"/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"contrat-cadre et bordereau de prix"}</Link>
          {" · "}<Link href={"/blog/clause-resolutoire-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause résolutoire"}</Link>
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
