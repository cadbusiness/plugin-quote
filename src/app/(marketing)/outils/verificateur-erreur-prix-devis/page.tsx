import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurErreurPrixDevisCalculator } from "@/components/marketing/verificateur-erreur-prix-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-erreur-prix-devis";
const TITLE = "Vérificateur d'erreur de prix dans un devis";
const DESCRIPTION = "Erreur de prix dans un devis B2B : total faux, prix unitaire, quantité, ligne oubliée ou mauvaise estimation. Stade du devis, éléments de calcul, confirmation, forfait, clause : douze points contrôlés, l'écart, le prix de référence et le message à envoyer. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurErreurPrixDevisPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Un total qui ne correspond pas aux lignes, un prix unitaire tapé avec un zéro de moins, une quantité fausse, un poste oublié ou un temps mal estimé : indiquez le stade du devis, la nature de l'erreur et les deux montants. Le vérificateur passe douze points en revue (offre et acceptation, articles 1132 à 1136, 1188 à 1192 et 1793 du code civil), calcule l'écart, indique le prix de référence et rédige la clause et le message."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurErreurPrixDevisCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/erreur-prix-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"erreur de prix dans un devis B2B"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/blog/validation-interne-avant-envoi-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"validation interne avant envoi"}</Link>
          {" · "}<Link href={"/blog/prix-vente-coefficient-debourse-sec-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"prix de vente et coefficient"}</Link>
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
