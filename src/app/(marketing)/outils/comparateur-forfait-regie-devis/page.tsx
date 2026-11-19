import type { Metadata } from "next";
import Link from "next/link";
import { ComparateurForfaitRegieDevisCalculator } from "@/components/marketing/comparateur-forfait-regie-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/comparateur-forfait-regie-devis";
const TITLE = "Comparateur forfait ou régie pour un devis B2B";
const DESCRIPTION = "Forfait, régie, régie plafonnée ou forfait par phase : estimation basse, probable et haute, périmètre, inconnues, réserve de risque, marge, point mort, clause et message prêts. Dix points contrôlés. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function ComparateurForfaitRegieDevisPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous chiffrez une prestation de services et vous hésitez entre un prix forfaitaire, la régie, une régie plafonnée ou un forfait par phase. Indiquez trois estimations d'heures, votre taux, votre coût de revient et ce qui est déjà écrit. L'outil compare les prix, la marge, le point mort, contrôle dix points et prépare la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <ComparateurForfaitRegieDevisCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/forfait-regie-temps-passe-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"forfait, régie et temps passé dans un devis B2B"}</Link>
          {" · "}<Link href={"/blog/travaux-supplementaires-avenant-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"travaux supplémentaires et avenant"}</Link>
          {" · "}<Link href={"/blog/devis-payant-etude-prealable-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"devis payant et étude préalable"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-maintenance-industrielle-contrat"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis maintenance industrielle"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
