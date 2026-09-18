import type { Metadata } from "next";
import Link from "next/link";
import { CoutBriefIncompletCalculator } from "@/components/marketing/cout-brief-incomplet-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût d’un brief devis incomplet",
  description:
    "Estimez le coût mensuel des briefs de devis incomplets : aller-retour, heures perdues, coût temps, et CA potentiel perdu si des dossiers meurent faute de brief. Calcul local dans le navigateur.",
  path: "/outils/estimateur-cout-brief-incomplet",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il une comptabilité du temps commercial ?",
    a: "Non. C’est un ordre de grandeur : volume × % d’incomplets × minutes d’aller-retour × coût horaire, plus un CA optionnel si des dossiers meurent. Il sert à prioriser la qualification, pas à budgéter une DAF.",
  },
  {
    q: "Que compter dans les minutes perdues ?",
    a: "Mails, rappels et reprises de chiffrage liés à un brief flou (dimensions manquantes, budget absent, photos oubliées). Pas le temps de chiffrage « normal » d’un dossier déjà cadré.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça à la qualification avant chiffrage ?",
    a: "Si le coût temps ou le CA perdu est élevé, posez un brief minimum obligatoire avant d’ouvrir le chiffrage. Lire qualifier une demande avant chiffrage, puis le score brief.",
  },
];

export default function EstimateurCoutBriefIncompletPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût brief devis incomplet B2B",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures perdues, coût temps et CA potentiel perdu liés aux briefs de devis incomplets.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-brief-incomplet`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur du coût d’un brief devis incomplet
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Mesurez ce que coûtent chaque mois les briefs incomplets : aller-retour, heures perdues,
            coût temps chargé, et éventuellement le CA perdu quand des dossiers meurent faute de
            brief. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/qualifier-demande-devis-avant-chiffrage"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Qualifier une demande avant chiffrage
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutBriefIncompletCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les briefs incomplets, c’est volume × %. Les heures, c’est ce volume × minutes
          d’aller-retour. Le coût temps multiplie par le taux horaire chargé. Le CA perdu n’apparaît
          que si vous renseignez un % de dossiers morts et un panier.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/qualifier-demande-devis-avant-chiffrage"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            qualifier avant chiffrage
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-temps-chiffrage-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            estimateur temps de chiffrage
          </Link>
          {" · "}
          <Link
            href="/outils/score-brief-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            score brief devis
          </Link>
          {" · "}
          <Link
            href="/blog/options-variantes-alternatives-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            options et variantes sur un devis
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez du brief flou au dossier chiffrable."
        text="Questions bloquantes, score Hot / Warm / Cold, une version active. Free sans carte."
      />
    </>
  );
}
