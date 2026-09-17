import type { Metadata } from "next";
import Link from "next/link";
import { DiscountImpactCalculator } from "@/components/marketing/discount-impact-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Simulateur impact remise devis",
  description:
    "Calculez l’impact d’une remise sur la marge d’un devis : marge € et % avant/après, impact annuel, tip concret. Calcul 100 % dans le navigateur.",
  path: "/outils/simulateur-impact-remise-devis",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il une compta ou un devis versionné ?",
    a: "Non. C’est un ordre de grandeur : CA HT, coût, remise, volume, optionnellement le taux d’acceptation. Il sert à voir si une remise « pour gagner le deal » tient, pas à produire une facture.",
  },
  {
    q: "Que se passe-t-il si j’augmente le taux d’acceptation ?",
    a: "L’outil compare la marge attendue sans remise (moins de deals gagnés) et avec remise (plus de deals, moins de marge unitaire). Si le taux après est 0, seul l’impact simple volume × perte unitaire est affiché.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça aux versions de devis ?",
    a: "Une remise orale non versionnée est une dette. Tracez-la en v2, puis relancez sur la version active. Lire versions et historique des devis B2B.",
  },
];

export default function SimulateurImpactRemisePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simulateur impact remise devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Simule l’impact d’une remise commerciale sur la marge d’un devis et l’effet annuel estimé.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/simulateur-impact-remise-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Simulateur d’impact remise devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Voyez ce qu’une remise « pour gagner le deal » fait à la marge (€ et %), et l’effet annuel
            si vous la répétez. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/versions-historique-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Versions et historique des devis
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <DiscountImpactCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          La marge avant, c’est CA HT − coût. Après remise, le CA baisse, le coût reste. L’impact annuel
          croise cette perte unitaire avec le volume, et éventuellement le gain d’acceptation.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/versions-historique-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            versions et historique
          </Link>
          {" · "}
          <Link
            href="/blog/centraliser-demandes-devis-multi-canaux"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            centraliser les demandes
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-stores-fermetures"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel stores et fermetures
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez de la remise orale à la version tracée."
        text="Une version active, un dossier, des relances alignées. Free sans carte."
      />
    </>
  );
}
