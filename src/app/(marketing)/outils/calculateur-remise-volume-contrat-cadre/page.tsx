import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurRemiseVolumeContratCadreCalculator } from "@/components/marketing/calculateur-remise-volume-contrat-cadre-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-remise-volume-contrat-cadre";
const TITLE = "Calculateur de remise sur volume d'un contrat-cadre : paliers, rappel de prix et ristourne";
const DESCRIPTION = "Remise sur volume d'un contrat-cadre ou d'un bordereau de prix unitaires : saisissez le prix de base, jusqu'à quatre paliers, le mode (par tranche ou global), le volume engagé et le volume réalisé. Le calcul donne le montant dû au palier réellement atteint, le rappel de prix ou l'avoir à émettre, la pénalité éventuelle, le prix moyen et le prochain palier. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurRemiseVolumeContratCadrePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Votre client récurrent a signé un contrat-cadre avec une grille de remises par palier et un volume annoncé. En fin de période, le volume réel n'est presque jamais celui prévu. Saisissez le prix de base, les paliers, le mode de calcul, le volume engagé, le volume réalisé et la remise appliquée sur les factures : le calcul dit ce qui était vraiment dû, s'il faut un rappel de prix ou un avoir, et combien coûte le palier suivant."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurRemiseVolumeContratCadreCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"contrat-cadre et bordereau de prix unitaires"}</Link>
          {" · "}<Link href={"/blog/remise-commerciale-marge-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"remise commerciale et marge"}</Link>
          {" · "}<Link href={"/outils/calculateur-seuil-remise-marge"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de seuil de remise"}</Link>
          {" · "}<Link href={"/outils/simulateur-impact-remise-devis"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"simulateur d'impact d'une remise"}</Link>
          {" · "}<Link href={"/blog/revision-prix-indexation-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"révision de prix et indexation"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
