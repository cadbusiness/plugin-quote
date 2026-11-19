import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurPlanPreventionEntrepriseExterieureCalculator } from "@/components/marketing/verificateur-plan-prevention-entreprise-exterieure-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-plan-prevention-entreprise-exterieure";
const TITLE = "Vérificateur de plan de prévention pour entreprise extérieure";
const DESCRIPTION = "Intervention chez un client : inspection commune, plan de prévention écrit à 400 heures sous-traitants compris ou pour un travail dangereux, protocole de sécurité, sous-traitants, amiante, temps d'accueil à chiffrer. Douze points contrôlés, la clause et le message prêts. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurPlanPreventionEntrepriseExterieurePage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous allez travailler chez un client, dans son usine, son entrepôt ou son magasin, ou vous accueillez un prestataire. Indiquez les heures prévues, sous-traitants compris, les travaux, les dates et ce qui est déjà fait. L'outil passe douze points en revue (articles R4511-1 à R4515-11 du code du travail, arrêté du 19 mars 1993), dit si le plan de prévention doit être écrit, chiffre le temps de prévention et rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurPlanPreventionEntrepriseExterieureCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/plan-prevention-entreprise-exterieure-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"plan de prévention et entreprise extérieure"}</Link>
          {" · "}<Link href={"/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"sous-traitance et loi de 1975"}</Link>
          {" · "}<Link href={"/blog/obligation-vigilance-attestation-urssaf-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"obligation de vigilance"}</Link>
          {" · "}<Link href={"/blog/travaux-supplementaires-avenant-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"travaux supplémentaires et avenant"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-porte-industrielle-quai-chargement"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis portes industrielles et quais"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
