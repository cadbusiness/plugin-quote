import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurCessionContratChangementClientCalculator } from "@/components/marketing/verificateur-cession-contrat-changement-client-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-cession-contrat-changement-client";
const H1 = "Vérificateur de cession de contrat et de changement de client (article 1216)";
const TITLE = "Vérificateur de cession de contrat et de changement de client (article 1216)";
const DESCRIPTION =
  "Votre client annonce qu'il a vendu son activité ou passé la commande à une autre société. Indiquez la nature de l'opération, l'état de votre accord, l'écrit de cession, la libération du cédant, le prix, l'acompte et l'avancement : l'outil répartit le solde entre cédant et cessionnaire, contrôle dix points de l'article 1216 du code civil et vous donne une clause, des actions, un courrier et un récapitulatif.";
const LEAD =
  "Votre client annonce que la commande continue avec une autre société. Indiquez ce qui s'est passé, ce que vous avez répondu et les montants. L'outil répartit le solde entre l'ancien et le nouveau client, contrôle dix points et prépare la clause, les actions et le courrier.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurCessionContratChangementClientPage() {
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
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{LEAD}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurCessionContratChangementClientCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">
          {"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. Les contrats régis par un régime propre (bail commercial, travail, assurance), la sous-traitance, la cession de créance, la fiscalité et la TVA ne sont pas traités. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/cession-contrat-changement-client-article-1216-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            cession de contrat et changement de client
          </Link>
          {" · "}
          <Link href="/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            pouvoir du signataire
          </Link>
          {" · "}
          <Link href="/blog/cession-creance-affacturage-dailly-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            cession de créance et affacturage
          </Link>
          {" · "}
          <Link href="/blog/client-procedure-collective-declaration-creance-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            client en procédure collective
          </Link>
          {" · "}
          <Link href="/outils/verificateur-pouvoir-signataire-devis" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            vérificateur du pouvoir du signataire
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Créer un compte Free
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          {" · "}
          <Link href="/tarifs" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            tarifs
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
