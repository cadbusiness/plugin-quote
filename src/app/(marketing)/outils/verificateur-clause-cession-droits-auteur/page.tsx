import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurClauseCessionDroitsAuteurCalculator } from "@/components/marketing/verificateur-clause-cession-droits-auteur-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-clause-cession-droits-auteur";
const TITLE = "Vérificateur de clause de cession de droits d'auteur";
const DESCRIPTION = "Photos, vidéos, graphisme commandés à un prestataire : vérifiez en 14 points la clause de cession de droits d'auteur de votre devis (écrit, droits nommés, supports, destination, territoire, durée, rémunération, nom de l'auteur, œuvres futures, tiers, droit à l'image). L'outil rédige la clause avec les trous à combler et le message à envoyer. Calcul local, sans compte.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurClauseCessionDroitsAuteurPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Vous commandez des photos, une vidéo ou un logo, ou vous les vendez. Payer la prestation ne transfère pas les droits : il faut une clause de cession écrite et précise. Répondez aux questions, l'outil vérifie la clause point par point, la rédige avec les trous à combler et prépare le message pour l'autre partie."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurClauseCessionDroitsAuteurCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/cession-droits-auteur-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"la cession de droits d'auteur dans un devis B2B"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-photographe-video-entreprise"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis photo et vidéo d'entreprise"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"les mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/outils/checklist-mentions-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"checklist des mentions d'un devis"}</Link>
          {" · "}<Link href={"/outils/estimateur-cout-aller-retours-brief-photos"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"estimateur du coût des allers-retours de brief"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
