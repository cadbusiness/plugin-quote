import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurDelaiRetractationHorsEtablissementCalculator } from "@/components/marketing/calculateur-delai-retractation-hors-etablissement-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-delai-retractation-hors-etablissement";
const TITLE = "Calculateur de délai de rétractation hors établissement (contrat entre professionnels)";
const DESCRIPTION = "Contrat signé chez un client professionnel de cinq salariés au plus : vérifiez si le droit de rétractation de 14 jours s'applique (article L221-3 du Code de la consommation), calculez la date de fin avec le report au premier jour ouvrable, la prolongation de 12 mois si l'information manque, le délai de 7 jours sans paiement et la part due pour un service commencé. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurDelaiRetractationHorsEtablissementPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Un devis signé chez le client, pendant la visite de votre commercial, n'est pas toujours définitif. Si le client emploie cinq salariés au plus et que le contrat sort de son activité principale, il dispose de 14 jours pour se rétracter, comme un particulier. Renseignez le contrat : le calcul dit si les trois conditions semblent réunies, donne la date de fin du délai, le report au premier jour ouvrable, la prolongation si l'information a manqué, la date avant laquelle vous ne pouvez rien encaisser et ce que le client vous devrait pour un service déjà commencé."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurDelaiRetractationHorsEtablissementCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/retractation-hors-etablissement-tpe-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"rétractation d'un contrat signé hors établissement avec une TPE"}</Link>
          {" · "}<Link href={"/blog/acomptes-echeances-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"acomptes et échéances d'un devis B2B"}</Link>
          {" · "}<Link href={"/outils/calculateur-acompte-devis"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur d'acompte"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
