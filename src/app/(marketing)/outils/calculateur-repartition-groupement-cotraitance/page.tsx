import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurRepartitionGroupementCotraitanceCalculator } from "@/components/marketing/calculateur-repartition-groupement-cotraitance-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-repartition-groupement-cotraitance";
const TITLE = "Calculateur de répartition d'un groupement de cotraitants";
const DESCRIPTION = "Plusieurs entreprises, un seul devis : forme du groupement, solidarité, pouvoirs du mandataire, parts de chaque membre, frais communs, rémunération du mandataire et exposition si un membre fait défaut. Douze points contrôlés, clause et message prêts. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurRepartitionGroupementCotraitancePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous répondez à plusieurs entreprises à une même demande de devis, ou vous recevez un devis présenté par un groupement. Indiquez la forme du groupement, ce qui est écrit dans le devis, les parts de chaque membre, les frais communs, la rémunération du mandataire et un cas de défaillance. L'outil passe douze points en revue (articles 1199, 1309, 1310, 1313, 1317 à 1319, 1984 à 1993 du code civil, R2142-20 et R2142-24 du code de la commande publique pour le vocabulaire), répartit les montants et montre qui peut devoir quoi au client si un membre fait défaut."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurRepartitionGroupementCotraitanceCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/cotraitance-groupement-entreprises-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"cotraitance et groupement d'entreprises"}</Link>
          {" · "}<Link href={"/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"sous-traitance et loi de 1975"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/blog/approbation-client-multi-decideurs-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"devis à plusieurs décideurs"}</Link>
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
