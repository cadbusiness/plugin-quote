import type { Metadata } from "next";
import Link from "next/link";
import { GenerateurMentionRgpdFormulaireDevisCalculator } from "@/components/marketing/generateur-mention-rgpd-formulaire-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Générateur de mention RGPD pour formulaire de devis",
  description:
    "Générez la mention d'information RGPD de votre formulaire de demande de devis : une version courte à placer près du bouton d'envoi, et un texte complet pour votre page de confidentialité (responsable, finalités, bases légales, durée de conservation, destinataires, droits, CNIL). Calcul 100 % local.",
  path: "/outils/generateur-mention-rgpd-formulaire-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. La raison sociale, l'email et les options restent dans votre navigateur. Rien n'est envoyé à QuoteBuilder.",
  },
  {
    q: "Le texte généré est-il un avis juridique ?",
    a: "Non. C'est un modèle pour une demande de devis courante. Faites-le relire si votre situation sort de l'ordinaire.",
  },
  {
    q: "Où coller la mention courte dans QuoteBuilder ?",
    a: "Dans le sous-titre de l'étape Vos coordonnées, depuis l'éditeur du parcours. Elle s'affiche en texte simple.",
  },
  {
    q: "Que faire si la mention courte dépasse 320 caractères ?",
    a: "Raccourcissez la raison sociale ou retirez l'adresse de la page de confidentialité. Le texte complet reste sur votre page.",
  },
];

export default function GenerateurMentionRgpdFormulaireDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Générateur de mention RGPD pour formulaire de devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Génère une mention courte et un texte complet d'information RGPD pour un formulaire de demande de devis. Calcul local dans le navigateur.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/generateur-mention-rgpd-formulaire-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Générateur de mention RGPD pour formulaire de devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Répondez à quelques questions. L&apos;outil écrit deux textes : une mention courte à placer près du bouton
            d&apos;envoi de votre formulaire de devis, et un texte complet pour votre page de confidentialité. Rien
            n&apos;est envoyé, tout se calcule dans votre navigateur. Ce n&apos;est pas un avis juridique : faites relire
            le résultat si votre situation sort de l&apos;ordinaire.{" "}
            <Link
              href="/blog/rgpd-demande-devis-b2b-consentement-conservation"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              RGPD et demande de devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <GenerateurMentionRgpdFormulaireDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          La mention courte reprend la finalité du devis, le responsable, la durée, et, si vous prospectez, la base
          choisie (case de consentement ou opposition). Au-delà de 320 caractères, un rappel vous invite à la
          raccourcir : un sous-titre de funnel se lit d&apos;un coup d&apos;œil.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le texte complet détaille les finalités, les bases légales (articles 6.1.b, 6.1.a ou 6.1.f selon vos choix),
          les destinataires, la durée et les droits, dont la réclamation auprès de la CNIL. Les rappels listent ce que
          le texte ne fait pas à votre place : email des droits, transfert hors UE, désinscription, cookies.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            compte Free
          </Link>
          {" · "}
          <Link
            href="/blog/rgpd-demande-devis-b2b-consentement-conservation"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            RGPD et demande de devis
          </Link>
          {" · "}
          <Link
            href="/blog/mentions-obligatoires-devis-france"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            mentions obligatoires d&apos;un devis
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-laboratoire-faconnage-cosmetique"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel devis laboratoire et façonnage
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Coller la mention dans l'étape Vos coordonnées."
        text="Compte Free sans carte. Le sous-titre de l'étape affiche la mention courte. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
