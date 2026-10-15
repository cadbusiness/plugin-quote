import type { Metadata } from "next";
import Link from "next/link";
import { GenerateurEmailConfirmationDemandeDevisGenerator } from "@/components/marketing/generateur-email-confirmation-demande-devis-generator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/generateur-email-confirmation-demande-devis";

export const metadata: Metadata = pageMetadata({
  title: "Générateur d'email de confirmation de demande de devis",
  description:
    "Écrivez l'accusé de réception de vos demandes de devis : délai, prochaine étape, lien de suivi, contact et signature. L'outil produit l'objet et le texte, avec les variables QuoteBuilder ou des repères neutres, et signale les promesses incohérentes. Calcul 100 % local.",
  path: PATH,
});

export default function GenerateurEmailConfirmationDemandeDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Générateur d'email de confirmation de demande de devis",
    url: `${SITE_URL}${PATH}`,
    description:
      "Écrit l'objet et le texte de l'accusé de réception d'une demande de devis : délai, prochaine étape, lien de suivi, contact, signature, avec les variables QuoteBuilder ou des repères neutres, et signale les délais incohérents. Calcul local.",
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
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Générateur d&apos;email de confirmation de demande de devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Le premier message que reçoit un client après sa demande dit trois choses : la demande est arrivée, voici
            ce qui se passe ensuite, voici comment compléter. Renseignez votre délai, votre prochaine étape et vos
            coordonnées : l&apos;outil écrit l&apos;objet et le texte, puis vérifie que le délai promis tient la route.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-6">
        <GenerateurEmailConfirmationDemandeDevisGenerator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <p className="text-[13px] leading-6 text-mk-faint">
          Calcul local, aucune donnée envoyée. Texte indicatif à relire avec vos mots. Pour le contexte :{" "}
          <Link
            href="/blog/email-confirmation-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Email de confirmation d&apos;une demande de devis B2B
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/autopilote"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            L&apos;Autopilote QuoteBuilder
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            voir la démo
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
      </section>

      <MarketingCta
        title="Envoyer cette confirmation à chaque demande."
        text="Compte Free sans carte. Le texte se colle dans Paramètres, rubrique Emails. Envoyez-vous une demande de test avant de publier."
      />
    </>
  );
}
