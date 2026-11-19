import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurPouvoirSignataireDevisCalculator } from "@/components/marketing/verificateur-pouvoir-signataire-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-pouvoir-signataire-devis";
const TITLE = "Vérificateur du pouvoir du signataire d'un devis B2B";
const DESCRIPTION = "Qui a signé votre devis côté client, et pouvait-il engager la société ? Représentant légal, délégation, plafond, registre, mandat apparent, demande de confirmation de l'article 1158, délai, ratification, clause et message. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurPouvoirSignataireDevisPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Un devis signé ne vaut que si la personne qui l'a signé pouvait engager le client. Indiquez la forme du client, qui a signé, le montant, ce que vous avez vérifié et la confirmation demandée. L'outil indique si le pouvoir du signataire est établi, ce qui manque, la date avant laquelle ne rien lancer, la clause à mettre dans le devis et le message à envoyer au représentant légal."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurPouvoirSignataireDevisCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"qui peut signer un devis côté client"}</Link>
          {" · "}<Link href={"/blog/signature-acceptation-devis-en-ligne-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"signature et acceptation d'un devis en ligne"}</Link>
          {" · "}<Link href={"/blog/approbation-client-multi-decideurs-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"approbation par plusieurs décideurs"}</Link>
          {" · "}<Link href={"/blog/acomptes-echeances-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"acomptes et échéances"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-rayonnage-stockage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis rayonnage et stockage"}</Link>
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
