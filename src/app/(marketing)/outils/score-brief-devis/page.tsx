import type { Metadata } from "next";
import Link from "next/link";
import { BriefScoreCalculator } from "@/components/marketing/brief-score-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Score brief devis (0–100)",
  description:
    "Évaluez la qualité d’un brief avant d’envoyer un devis B2B. Mini-outil gratuit QuoteBuilder, score live 0–100 et recommandations.",
  path: "/outils/score-brief-devis",
});

const FAQ = [
  {
    q: "Ce score est-il un verdict ?",
    a: "Non. Score indicatif pour prioriser le temps de chiffrage, pas un verdict juridique ni financier.",
  },
  {
    q: "Les réponses quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur.",
  },
  {
    q: "Comment lire Hot / Warm / Cold / Parking ?",
    a: "Hot : brief solide, priorisez le chiffrage. Warm : correct mais incomplet, qualifiez avant un long chiffrage. Cold : brief faible, évitez de monopoliser un senior. Parking : trop flou ou hors cible.",
  },
];

export default function ScoreBriefPage() {
  return (
    <>
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Scorez la qualité d’un brief avant le devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Cinq questions pondérées, score live sur 100, et une reco concrète. Utile juste avant de passer 45 minutes
            à chiffrer.{" "}
            <Link href="/blog/score-demande-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
              Lire le guide de scoring
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <BriefScoreCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Ensuite</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Lire aussi :{" "}
          <Link href="/blog/score-demande-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            scorer une demande de devis
          </Link>
          {" · "}
          <Link href="/blog/formulaire-contact-vs-funnel-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            formulaire vs funnel
          </Link>
          {" · "}
          <Link href="/blog/pourquoi-les-devis-meurent-sans-relance" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            relances devis
          </Link>
          {" · "}
          <Link href="/outils/cout-devis-non-relance" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            coût d’un devis non relancé
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta title="Tester QuoteBuilder (parcours + score)" text="Le prospect configure. Vous recevez un dossier. Free sans carte." />
    </>
  );
}
