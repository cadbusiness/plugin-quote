import type { Metadata } from "next";
import Link from "next/link";
import { PipelineValueCalculator } from "@/components/marketing/pipeline-value-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur de valeur de pipeline devis",
  description:
    "Chiffrez le pipeline brut, le CA actuel, le CA cible et l’écart annuel. Option mix Hot / Warm / Cold. Outil gratuit QuoteBuilder.",
  path: "/outils/estimateur-valeur-pipeline-devis",
});

const FAQ = [
  {
    q: "Le calcul est-il une prévision de CA ?",
    a: "Non. C’est une arithmétique simple : devis ouverts × panier × taux. L’écart rend visible un trou. Il ne promet pas que le scoring ou les relances atteindront le taux cible tout seuls.",
  },
  {
    q: "Que signifie le CA pondéré Hot / Warm / Cold ?",
    a: "Si vous activez le mix, chaque seau pèse sa part du pipeline multipliée par son taux de close. Utile quand un Hot convertit nettement mieux qu’un Cold, et que le taux unique écrase cette différence.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça au scoring et aux relances ?",
    a: "Le taux cible suppose un brief scoré et des relances vraiment envoyées. Lire le guide de scoring, puis le coût d’un devis non relancé, pour relier le chiffre à un process.",
  },
];

export default function EstimateurPipelinePage() {
  return (
    <>
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Valeur d’un pipeline de devis.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Devis ouverts × panier = pipeline brut. Deux taux (actuel et cible) donnent l’écart. Optionnel : pondérer
            Hot / Warm / Cold.{" "}
            <Link href="/blog/score-demande-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
              Lire le guide de scoring
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <PipelineValueCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le pipeline brut est le stock, pas le CA. Le CA actuel applique votre taux réel. Le CA cible est ce que vous
          jugez tenable si les Hot sont traités et les relances partent. L’écart × 12 annualise l’hypothèse, sans
          saisonnalité.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite, il faut scorer et relancer. Un{" "}
          <Link href="/blog/score-demande-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            score de demande
          </Link>{" "}
          et le{" "}
          <Link href="/outils/cout-devis-non-relance" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            coût d’un devis non relancé
          </Link>{" "}
          relient le chiffre à un process. Compte{" "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Free
          </Link>{" "}
          pour voir le pipeline réel.
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez du chiffre au dossier."
        text="Funnel à l’entrée. Score et relances ensuite. Free sans carte."
      />
    </>
  );
}
