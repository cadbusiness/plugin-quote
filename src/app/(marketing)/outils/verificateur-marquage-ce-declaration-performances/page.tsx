import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurMarquageCeDeclarationPerformancesCalculator } from "@/components/marketing/verificateur-marquage-ce-declaration-performances-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-marquage-ce-declaration-performances";
const H1 = "Vérificateur de marquage CE et de déclaration des performances d'un produit de construction";
const TITLE = "Vérificateur de marquage CE et de déclaration des performances d'un produit de construction";
const DESCRIPTION = "Fenêtre, porte, vitrage, structure acier ou portail que vous fabriquez, importez, revendez ou posez : vérifiez si la déclaration des performances et le marquage CE sont obligatoires (règlement UE 305/2011, articles 4 à 9), si la dérogation du sur-mesure de l'article 5 s'applique, si un organisme notifié doit intervenir, comment remettre la déclaration au client et ce que le devis peut annoncer comme performances. Mention de devis, courrier et récapitulatif à copier. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurMarquageCeDeclarationPerformancesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: H1,
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
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">{H1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous fabriquez, importez, revendez ou posez des fenêtres, des portes, des vitrages, des éléments de structure ou des portails, et le client, l'architecte ou le contrôleur vous demande « la DoP » ou « le marquage CE ». Décrivez votre rôle, le produit et ce que vous remettez déjà. L'outil dit si la déclaration des performances et le marquage CE sont obligatoires, si la dérogation du sur-mesure peut jouer, si un organisme notifié doit intervenir, ce que votre devis peut annoncer comme performances, et vous donne la mention à écrire dans le devis et le courrier qui accompagne la déclaration."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurMarquageCeDeclarationPerformancesCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Résultat indicatif, fondé sur vos réponses, pas un conseil juridique. Non traités : sanctions, règles nationales d'usage (DTU, réglementation thermique, incendie), marchés publics, passeport numérique du règlement 2024/3110, produits usagés, droit hors Union européenne. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/marquage-ce-declaration-performances-produits-construction-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">marquage CE et déclaration des performances dans un devis</Link>
          {" · "}<Link href="/secteurs/funnel-devis-vitrerie-miroiterie" className="font-medium text-mk-accent underline-offset-2 hover:underline">funnel de devis vitrerie et miroiterie</Link>
          {" · "}<Link href="/blog/garantie-vices-caches-sav-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">garantie des vices cachés</Link>
          {" · "}<Link href="/blog/attestation-assurance-decennale-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"attestation d'assurance décennale"}</Link>
          {" · "}<Link href="/outils/verificateur-attestation-assurance-decennale" className="font-medium text-mk-accent underline-offset-2 hover:underline">{"vérificateur d'attestation décennale"}</Link>
          {" · "}<Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">Créer un compte Free</Link>
          {" · "}<Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">démo rayonnage</Link>
          {" · "}<Link href="/tarifs" className="font-medium text-mk-accent underline-offset-2 hover:underline">tarifs</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
