import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurCessionCreanceAffacturageCalculator } from "@/components/marketing/verificateur-cession-creance-affacturage-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-cession-creance-affacturage";
const TITLE = "Vérificateur de cession de créance et d'affacturage";
const DESCRIPTION = "Céder une facture B2B, la confier à un factor ou la remettre en Dailly : écrit, clause d'incessibilité, notification au client, avoir et réserves, délai de paiement, net versé et coût ramené à l'année. Douze points contrôlés, clause et message prêts. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurCessionCreanceAffacturagePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous voulez céder une facture née d'un devis accepté, la confier à un factor ou la remettre à votre banque par bordereau Dailly. Ou vous êtes le client et on vous demande de payer quelqu'un d'autre. Indiquez l'opération, la facture, la clause du contrat, l'état de la prestation et les conditions du financement. L'outil passe douze points en revue (articles 1321 à 1326 et 1346-1 à 1346-5 du code civil, L313-23 à L313-29 du code monétaire et financier, L441-10 et L442-3 du code de commerce), calcule le net versé et le coût, et rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurCessionCreanceAffacturageCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/cession-creance-affacturage-dailly-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"cession de créance, affacturage et Dailly"}</Link>
          {" · "}<Link href={"/blog/conditions-paiement-penalites-retard-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"conditions de paiement et pénalités de retard"}</Link>
          {" · "}<Link href={"/blog/compensation-creances-deduction-facture-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"compensation de créances"}</Link>
          {" · "}<Link href={"/blog/acomptes-echeances-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"acomptes et échéances"}</Link>
          {" · "}<Link href={"/outils/calculateur-escompte-paiement-anticipe"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"calculateur d'escompte pour paiement anticipé"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
