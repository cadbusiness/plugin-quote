import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurSousTraitanceLoi1975Calculator } from "@/components/marketing/verificateur-sous-traitance-loi-1975-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-sous-traitance-loi-1975";
const TITLE = "Vérificateur de sous-traitance (loi du 31 décembre 1975)";
const DESCRIPTION = "Sous-traitance et loi du 31 décembre 1975 : acceptation du sous-traitant, agrément des conditions de paiement, caution ou délégation, action directe ou paiement direct. Douze points contrôlés, la date d'ouverture de l'action directe, le montant visé et les clauses à écrire. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurSousTraitanceLoi1975Page() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Sous-traitant qui veut être payé, entreprise principale qui sous-traite, ou maître de l'ouvrage qui voit arriver une autre entreprise sur son chantier : indiquez la nature du travail, le contrat principal, l'acceptation, la garantie et les montants. Le vérificateur passe douze points en revue, donne le régime probable (action directe, paiement direct ou hors loi), la date d'ouverture de l'action directe et ce que le maître de l'ouvrage peut encore devoir, puis rédige les clauses et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurSousTraitanceLoi1975Calculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"sous-traitance et loi de 1975 dans un devis B2B"}</Link>
          {" · "}<Link href={"/blog/garantie-paiement-1799-1-devis-travaux-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"garantie de paiement des marchés de travaux"}</Link>
          {" · "}<Link href={"/blog/autoliquidation-tva-sous-traitance-btp-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"autoliquidation de TVA en sous-traitance BTP"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-thermolaquage-traitement-surface"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel thermolaquage et traitement de surface"}</Link>
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
