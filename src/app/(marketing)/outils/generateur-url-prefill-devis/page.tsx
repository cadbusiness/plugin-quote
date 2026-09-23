import type { Metadata } from "next";
import Link from "next/link";
import { PrefillUrlGenerator } from "@/components/marketing/prefill-url-generator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Générateur d’URL de préremplissage devis",
  description:
    "Construisez une URL de funnel devis préremplie (?besoin=, ?add=, ?product=) et un exemple de shortcode WordPress. Calcul 100 % local, sans envoi de données.",
  path: "/outils/generateur-url-prefill-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. L’URL, la query et le shortcode sont assemblés dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Où coller l’URL générée ?",
    a: "Sur un bouton boutique, une pub, un QR ou un e-mail. Les mêmes paramètres fonctionnent sur /c/:org/:slug et /embed/:org/:slug.",
  },
  {
    q: "Le shortcode doit-il contenir la query ?",
    a: "Pas forcément. Si la page WordPress qui porte le shortcode a déjà ?besoin= ou ?add=, le widget recopie cette query dans l’iframe.",
  },
  {
    q: "Que fait product par rapport à add ?",
    a: "product est un alias d’un token add. Utile quand la boutique génère déjà des liens ?product=. Le match chip gagne sur le match produit.",
  },
];

export default function GenerateurUrlPrefillDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Générateur d’URL de préremplissage devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Construit une URL de funnel devis préremplie (?besoin=, ?add=, ?product=) et un exemple de shortcode WordPress. Calcul 100 % local.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/generateur-url-prefill-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Générateur d’URL de préremplissage devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Assemblez une URL de funnel avec <code>?besoin=</code>, <code>?add=</code> et{" "}
            <code>?product=</code>, plus un exemple de shortcode WordPress. Calcul 100 % dans votre
            navigateur.{" "}
            <Link
              href="/blog/preremplir-devis-url-parametres"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Préremplir un devis via l’URL
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <PrefillUrlGenerator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          <code>besoin</code> sélectionne des chips de gamme (value ou label, casse et accents
          ignorés). <code>add</code> sélectionne une chip, ou ajoute un produit catalogue en quantité
          1 avec une note « Ajouté au devis ». <code>product</code> est un alias d’un token{" "}
          <code>add</code>. Les tokens inconnus sont ignorés. Les valeurs s’unissent à la session en
          cours ; une session déjà soumise ne change pas.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/preremplir-devis-url-parametres"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            préremplir un devis via l’URL
          </Link>
          {" · "}
          <Link
            href="/blog/fiche-produit-b2b-devis-unifie"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            fiche produit B2B unifiée
          </Link>
          {" · "}
          <Link
            href="/blog/installer-widget-devis-wordpress-javascript"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            widget WordPress
          </Link>
          {" · "}
          <Link
            href="/c/quickly/rayonnage?besoin=rayonnages"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            exemple live ?besoin=rayonnages
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Branchez le CTA boutique sur un funnel déjà amorcé."
        text="Chips, produit, shortcode. Free sans carte."
      />
    </>
  );
}
