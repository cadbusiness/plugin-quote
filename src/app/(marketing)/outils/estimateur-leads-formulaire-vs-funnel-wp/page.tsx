import type { Metadata } from "next";
import Link from "next/link";
import { LeadsFormulaireVsFunnelEstimator } from "@/components/marketing/leads-formulaire-vs-funnel-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur leads formulaire contact vs funnel WordPress",
  description:
    "Estimez heures perdues, demandes mortes et coût d’opportunité quand vos devis WordPress passent par un formulaire contact au lieu d’un funnel / dossier auto. Calcul 100 % local.",
  path: "/outils/estimateur-leads-formulaire-vs-funnel-wp",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux et panier restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure « demandes mortes » ?",
    a: "Un ordre de grandeur : une part des demandes non exploitables sans rappel, plus une part des demandes qui ne reçoivent pas de réponse sous 24 h. Ce n’est pas un taux de perte comptable.",
  },
  {
    q: "Pourquoi le coût d’opportunité disparaît si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas l’écart de réponse en euros. Heures de ressaisie, demandes mortes et score de maturité restent affichés.",
  },
  {
    q: "Comment relier ça à un site WordPress ?",
    a: "Comparez le formulaire contact actuel à un parcours qui crée un devis (origine Site Web). Lire recevoir des demandes WordPress dans QuoteBuilder, formulaire vs funnel, et installer le widget.",
  },
];

export default function EstimateurLeadsFormulaireVsFunnelWpPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur leads formulaire contact vs funnel WordPress",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures perdues, demandes mortes, coût d’opportunité et score de maturité pipeline entre formulaire contact WordPress et funnel / dossier devis auto.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-leads-formulaire-vs-funnel-wp`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur leads : formulaire contact vs funnel WordPress
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de demandes via formulaire contact WP, part déjà exploitable, temps de ressaisie et
            taux de réponse sous 24 h. L’outil estime les heures perdues, les demandes mortes, un coût
            d’opportunité optionnel et un score de maturité pipeline. Calcul 100 % dans votre
            navigateur.{" "}
            <Link
              href="/blog/recevoir-demandes-devis-wordpress-quotebuilder"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Recevoir des demandes de devis WordPress
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <LeadsFormulaireVsFunnelEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les heures perdues = demandes × minutes de ressaisie. Les demandes récupérées = volume ×
          écart entre le taux de réponse sous 24 h actuel et la cible. Les demandes mortes combinent
          la part non exploitable sans rappel et la part sans réponse sous 24 h. Le score (0–100)
          mélange exploitabilité, vitesse de réponse et friction de ressaisie. Si le panier est
          renseigné, le coût d’opportunité applique le taux de conversion indicatif aux demandes
          récupérées.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/recevoir-demandes-devis-wordpress-quotebuilder"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            recevoir des demandes WordPress dans QuoteBuilder
          </Link>
          {" · "}
          <Link
            href="/blog/formulaire-contact-vs-funnel-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            formulaire vs funnel
          </Link>
          {" · "}
          <Link
            href="/blog/installer-widget-devis-wordpress-javascript"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            installer le widget WordPress
          </Link>
          {" · "}
          <Link
            href="/c/demo/rayonnage"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            démo rayonnage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Remplacez le mail contact par un devis créé."
        text="Origine Site Web, lignes catalogue, notif commerciale. Free sans carte."
      />
    </>
  );
}
