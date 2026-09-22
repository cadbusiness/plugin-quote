import type { Metadata } from "next";
import Link from "next/link";
import { SeuilRemiseMargeCalculator } from "@/components/marketing/seuil-remise-marge-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur seuil de remise et plancher de marge",
  description:
    "Calculez la remise maximale pour rester au-dessus de votre plancher de marge sur un devis B2B. Prix plancher HT/TTC, alerte OK/KO. Calcul 100 % local.",
  path: "/outils/calculateur-seuil-remise-marge",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il une politique tarifaire ?",
    a: "Non. C’est un ordre de grandeur : prix catalogue HT, coût de revient ou marge actuelle, plancher cible, remise envisagée. Il sert à cadrer une discussion d’équipe, pas à valider une grille ou des CGV.",
  },
  {
    q: "Comment la remise max est-elle calculée ?",
    a: "Le prix plancher est le prix HT qui laisse exactement la marge minimale cible, une fois le coût de revient couvert. La remise max est l’écart entre le prix catalogue et ce plancher.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que faire si le statut est KO ?",
    a: "La remise envisagée (ou déjà la marge actuelle) passe sous le plancher. Proposez une variante de périmètre, un phasage, une validité plus courte, ou une validation écrite. Ne rattrapez pas un dossier déjà juste avec une remise plus forte.",
  },
];

export default function CalculateurSeuilRemiseMargePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur seuil de remise et plancher de marge devis B2B",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Calcule la remise maximale pour rester au-dessus d’un plancher de marge, le prix plancher HT/TTC et un statut OK/KO sur un devis B2B.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/calculateur-seuil-remise-marge`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur seuil de remise et plancher de marge
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Indiquez le prix catalogue HT, le coût de revient (ou la marge actuelle) et votre plancher de marge.
            L’outil donne la remise max, le prix plancher HT/TTC, et un statut OK/KO si une remise est déjà en tête.
            Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/remise-commerciale-marge-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Remise commerciale et marge sur devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <SeuilRemiseMargeCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          La marge actuelle, c’est prix catalogue HT moins coût de revient. Le prix plancher est le plus bas prix
          HT qui respecte encore la marge minimale cible. En dessous, le geste sort du cadre, même si le % de
          remise paraît « petit ».
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/remise-commerciale-marge-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            remise commerciale et marge
          </Link>
          {" · "}
          <Link
            href="/outils/simulateur-impact-remise-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            simulateur impact remise
          </Link>
          {" · "}
          <Link
            href="/blog/options-variantes-alternatives-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            options et variantes
          </Link>
          {" · "}
          <Link
            href="/blog/acomptes-echeances-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            acomptes et échéances
          </Link>
          .
        </p>
        <p className="mt-4">
          <Link
            href="/signup?plan=free"
            className="inline-flex rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
          >
            Essayer QuoteBuilder gratuitement
          </Link>
        </p>
        <p className="mt-6 text-xs leading-5 text-mk-faint">
          Calcul indicatif, pas un conseil financier.
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez de la remise au feeling au plancher écrit."
        text="Devis, options, version, suivi. Free sans carte."
      />
    </>
  );
}
