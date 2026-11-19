import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurAmortissementOutillageSpecifiqueCalculator } from "@/components/marketing/calculateur-amortissement-outillage-specifique-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-amortissement-outillage-specifique";
const TITLE = "Calculateur d'amortissement d'un outillage spécifique";
const DESCRIPTION = "Moule, matrice, gabarit ou montage fabriqué pour un seul client : part facturée à part, part amortie dans le prix des pièces, reste à amortir si les commandes s'arrêtent, propriété, garde, assurance et restitution. Douze points contrôlés, clause et message prêts. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurAmortissementOutillageSpecifiquePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous chiffrez un moule, une matrice, un gabarit ou un montage qui ne servira qu'aux pièces d'un client, ou vous recevez un devis qui en contient un. Indiquez le coût de l'outillage, ce qui est facturé à part, la quantité sur laquelle le reste est amorti et le nombre de pièces livrées si les commandes s'arrêtent. L'outil calcule le prix par pièce et le reste à amortir, puis passe douze points en revue : propriété, transfert, garde, assurance, entretien, restitution, rétention, arrêt anticipé et plans (articles 1196, 1583, 1787 à 1789, 1794, 1915, 1917, 1927, 1928, 1932, 1933, 1942 à 1944, 1947, 1948 et 2286 du code civil)."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurAmortissementOutillageSpecifiqueCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"outillage spécifique et moules dans le devis"}</Link>
          {" · "}<Link href={"/blog/clause-reserve-propriete-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause de réserve de propriété"}</Link>
          {" · "}<Link href={"/blog/prix-vente-coefficient-debourse-sec-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"prix de vente et coefficient"}</Link>
          {" · "}<Link href={"/blog/acomptes-echeances-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"acomptes et échéances"}</Link>
          {" · "}<Link href={"/outils/calculateur-coefficient-vente-devis"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur de coefficient de vente"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
