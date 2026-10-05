import type { Metadata } from "next";
import Link from "next/link";
import { RequalificationChatVsFormulaireDevisCalculator } from "@/components/marketing/requalification-chat-vs-formulaire-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur requalification chat vs formulaire pour les demandes de devis",
  description:
    "Estimez le temps et le coût de requalification des demandes de devis selon leur canal : funnel en chat IA ou formulaire par étapes. Dossiers à reprendre, heures, coût mensuel et écart attribuable au chat. Vos chiffres, calcul 100 % local.",
  path: "/outils/estimateur-requalification-chat-vs-formulaire-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, pourcentages, minutes et taux restent dans votre navigateur. Rien n'est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le total indicatif ?",
    a: "Les dossiers chat = demandes × le % qui arrive par le chat. Les dossiers formulaire = le reste. Les dossiers à requalifier = ces volumes × le % de requalification du canal. Les heures = ces dossiers × minutes / 60. Le coût = ces heures × le taux horaire. Le total mensuel additionne les deux canaux. Sur 12 mois, ce total × 12. L'écart attribuable au chat = dossiers chat × (% de requalification chat moins % de requalification formulaire), converti en heures puis en euros. C'est indicatif, sur vos hypothèses, pas un conseil financier ni un benchmark.",
  },
  {
    q: "Pourquoi l'écart peut-il être négatif ?",
    a: "Si le pourcentage de requalification du chat est inférieur à celui du formulaire, l'écart est négatif : sur ces hypothèses, le chat demande moins de reprises que le formulaire.",
  },
  {
    q: "Le score change-t-il selon le canal ?",
    a: "Non. Le score Hot / Warm / Cold suit la même formule fixe, calculée à la soumission, quel que soit le canal. Pour une même clé, la réponse de formulaire prime sur la valeur extraite du chat. La conversation n'est pas reprise sur la fiche devis : seules les réponses structurées et le besoin y figurent.",
  },
  {
    q: "L'outil invente-t-il un benchmark ou une TVA ?",
    a: "Non. Toutes les valeurs sont les vôtres. Le résultat est une fourchette indicative min-max, sans TVA, pas un conseil financier.",
  },
];

export default function EstimateurRequalificationChatVsFormulaireDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur requalification chat vs formulaire",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime le temps et le coût de requalification des demandes de devis B2B selon leur canal (chat IA ou formulaire par étapes) et l'écart attribuable au chat. Calcul local sur vos hypothèses.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-requalification-chat-vs-formulaire-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur requalification chat vs formulaire
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de demandes, part qui arrive par le chat, part des dossiers à requalifier selon
            le canal, minutes et taux horaire. L&apos;outil estime les dossiers à reprendre, les
            heures, le coût mensuel et l&apos;écart attribuable au chat. Ce sont vos hypothèses, pas
            un benchmark. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/funnel-devis-chat-ia-vs-formulaire-etapes-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Chat IA ou formulaire par étapes
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <RequalificationChatVsFormulaireDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les dossiers chat = demandes / mois × le pourcentage chat. Les dossiers formulaire = le
          reste. Les dossiers à requalifier = ces volumes × le pourcentage de requalification du
          canal. Les heures = ces dossiers × minutes ÷ 60. Le coût = ces heures × le taux horaire
          chargé. Le total mensuel additionne les deux canaux. Sur 12 mois, ce total × 12.
          L&apos;écart attribuable au chat = dossiers chat × (% de requalification chat moins % de requalification formulaire), puis en heures et en euros. Il peut être négatif. Ordre de grandeur pour une
          discussion d&apos;équipe, pas un conseil financier.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le score Hot, Warm ou Cold suit la même formule fixe quel que soit le canal, calculée à
          la soumission. Pour une même clé, la réponse de formulaire prime sur la valeur extraite du
          chat. La conversation n&apos;est pas reprise sur la fiche devis. Le prix reste une
          fourchette indicative min-max, sans TVA.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/signup?plan=free"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            compte Free
          </Link>
          {" · "}
          <Link
            href="/blog/funnel-devis-chat-ia-vs-formulaire-etapes-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            chat IA ou formulaire par étapes
          </Link>
          {" · "}
          <Link
            href="/blog/qualifier-demande-devis-avant-chiffrage"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            qualifier une demande avant chiffrage
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-cout-emails-clarification-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            coût des emails de clarification
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-cout-brief-incomplet"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            coût d&apos;un brief incomplet
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/funnel"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel
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
        title="Même formule de score, quel que soit le canal."
        text="Formulaire par étapes ou chat IA : les réponses structurées alimentent le dossier. Pour une même clé, la réponse de formulaire prime. Free sans carte. La démo rayonnage montre un formulaire par étapes."
      />
    </>
  );
}
