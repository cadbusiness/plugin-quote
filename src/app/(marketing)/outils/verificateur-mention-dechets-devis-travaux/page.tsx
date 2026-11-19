import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurMentionDechetsDevisTravauxCalculator } from "@/components/marketing/verificateur-mention-dechets-devis-travaux-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-mention-dechets-devis-travaux";
const TITLE = "Vérificateur de mention déchets pour un devis de travaux";
const DESCRIPTION = "Devis de construction, de rénovation, de démolition ou de jardinage : vérifiez les quatre informations déchets exigées depuis le 1er juillet 2021 (quantité estimée, tri, point de collecte, coût), l'exception du diagnostic PEMD, chiffrez la ligne et copiez-la dans votre devis. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurMentionDechetsDevisTravauxPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Votre devis porte sur des travaux de construction, de rénovation ou de démolition d'un bâtiment, ou sur du jardinage. Depuis le 1er juillet 2021, il doit indiquer la quantité estimée de déchets, le tri prévu, le point de collecte et le coût estimé. Indiquez le chantier, vos quantités et vos prix. L'outil dit si la mention est exigée, chiffre la ligne déchets, vérifie dix points, et prépare la ligne à coller dans le devis et le message au client."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurMentionDechetsDevisTravauxCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/mention-dechets-devis-travaux-bordereau-depot-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mention déchets sur un devis de travaux"}</Link>
          {" · "}<Link href={"/blog/mentions-obligatoires-devis-france"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"mentions obligatoires d'un devis"}</Link>
          {" · "}<Link href={"/blog/prix-vente-coefficient-debourse-sec-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"prix de vente et déboursé sec"}</Link>
          {" · "}<Link href={"/blog/travaux-supplementaires-avenant-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"travaux supplémentaires et avenant"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-decoupe-laser-tolerie-pliage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis découpe laser, tôlerie et pliage"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo funnel rayonnage"}</Link>
          {" · "}<Link href={"/tarifs"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"tarifs"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
