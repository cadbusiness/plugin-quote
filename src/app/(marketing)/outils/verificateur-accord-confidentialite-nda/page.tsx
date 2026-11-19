import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurAccordConfidentialiteNdaCalculator } from "@/components/marketing/verificateur-accord-confidentialite-nda-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-accord-confidentialite-nda";
const TITLE = "Vérificateur d'accord de confidentialité (NDA) avant devis";
const DESCRIPTION = "Accord de confidentialité avant un devis B2B : indiquez quand il est signé, ce qu'il protège, ses exclusions, sa finalité, sa durée et sa sanction. Le vérificateur passe quinze points en revue, calcule la date de fin de l'obligation et rédige les clauses et le message. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurAccordConfidentialiteNdaPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Entreprise qui doit envoyer ses plans, ses fichiers ou un prototype pour obtenir un devis, ou fournisseur à qui l'on demande de signer un accord avant de chiffrer : décrivez l'accord. Le vérificateur passe quinze points en revue, calcule la date de fin de l'obligation et rédige les clauses et le message à envoyer."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurAccordConfidentialiteNdaCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/accord-confidentialite-nda-avant-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"accord de confidentialité avant un devis B2B"}</Link>
          {" · "}<Link href={"/blog/pieces-jointes-plans-photos-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"pièces jointes, plans et photos dans une demande de devis"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-impression-3d-prototypage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis impression 3D et prototypage"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-usinage-sous-traitance-pieces"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis usinage et sous-traitance"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
