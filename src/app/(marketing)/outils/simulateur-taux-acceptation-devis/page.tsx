import type { Metadata } from "next";
import Link from "next/link";
import { AcceptanceRateCalculator } from "@/components/marketing/acceptance-rate-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Simulateur taux d’acceptation de devis",
  description:
    "Estimez l’impact d’un meilleur taux d’acceptation de devis : devis acceptés, CA potentiel gagné, coût d’attente lié au délai de signature. Calcul local dans le navigateur.",
  path: "/outils/simulateur-taux-acceptation-devis",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un historique de close rate ?",
    a: "Non. C’est un ordre de grandeur : volume envoyé, taux actuel vs cible, panier, délai et marge. Il sert à voir si +3 à +8 points changent le mois, pas à budgéter une DAF.",
  },
  {
    q: "Que mesure le coût d’attente ?",
    a: "Un proxy : le CA des devis non acceptés (volume × panier) multiplié par le délai moyen / 30. Ce n’est pas une charge comptable, c’est la valeur coincée pendant que le devis n’est pas tranché.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça à l’acceptation en ligne ?",
    a: "Le simulateur chiffre l’écart de taux. Le parcours envoi → vue → questions → acceptation explique comment le monter. Lire signature et acceptation de devis en ligne B2B.",
  },
];

export default function SimulateurTauxAcceptationDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simulateur taux d’acceptation de devis B2B",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime devis acceptés, CA potentiel gagné et coût d’attente selon le taux d’acceptation actuel vs cible.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/simulateur-taux-acceptation-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Simulateur de taux d’acceptation de devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Comparez votre taux d’acceptation actuel à une cible réaliste : devis acceptés, CA
            potentiel gagné chaque mois, et coût approximatif de l’attente. Calcul 100 % dans votre
            navigateur.{" "}
            <Link
              href="/blog/signature-acceptation-devis-en-ligne-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Signature et acceptation de devis en ligne
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <AcceptanceRateCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les acceptés, c’est volume × taux. L’écart de taux × panier donne le CA potentiel. La
          marge retranche le coût de revient. Le coût d’attente immobilise le CA non tranché pendant
          le délai moyen.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/signature-acceptation-devis-en-ligne-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            signature et acceptation
          </Link>
          {" · "}
          <Link
            href="/outils/simulateur-roi-logiciel-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            ROI logiciel
          </Link>
          {" · "}
          <Link
            href="/outils/cout-devis-non-relance"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            coût d’un devis non relancé
          </Link>
          {" · "}
          <Link
            href="/blog/pourquoi-les-devis-meurent-sans-relance"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            pourquoi les devis meurent sans relance
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez du taux au dossier accepté."
        text="Une version active, un statut Vu / En questions / Accepté, des relances alignées. Free sans carte."
      />
    </>
  );
}
