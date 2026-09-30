import type { Metadata } from "next";
import Link from "next/link";
import { TvaDevisHtTtcCalculator } from "@/components/marketing/tva-devis-ht-ttc-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur TVA devis HT / TTC",
  description:
    "Passez d’un montant HT au TTC (ou l’inverse) sur un devis B2B : taux 20 %, 10 %, 5,5 %, 2,1 %, 0 % ou perso, jusqu’à 3 lignes. Calcul local, indicatif, pas un conseil fiscal.",
  path: "/outils/calculateur-tva-devis-ht-ttc",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un expert-comptable ?",
    a: "Non. C’est une arithmétique HT, TVA et TTC pour comprendre un devis. Le taux applicable dépend de votre situation. Ce calculateur applique le taux que vous saisissez : il ne choisit pas le taux légal et ne gère pas l’autoliquidation.",
  },
  {
    q: "Comment passer du HT au TTC ?",
    a: "TTC = HT × (1 + taux). À 20 %, 10 000 € HT donnent 2 000 € de TVA et 12 000 € TTC. L’inverse : HT = TTC ÷ (1 + taux).",
  },
  {
    q: "Que faire avec plusieurs taux sur le même devis ?",
    a: "Passez en mode plusieurs lignes (jusqu’à 3). Le total HT, la TVA ventilée par taux et le total TTC s’affichent dans ce calculateur. Sur un devis, la bonne pratique générale est de garder le taux sur chaque ligne et le détail en bas de page.",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Montants et taux restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
];

export default function CalculateurTvaDevisHtTtcPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur TVA devis HT / TTC",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Calcule HT, TVA et TTC sur un devis B2B : conversion HT/TTC, taux courants, lignes multi-taux. Indicatif, 100 % local.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/calculateur-tva-devis-ht-ttc`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur TVA devis HT / TTC
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Passez d’un montant HT au TTC, ou l’inverse. Choisissez un taux courant ou un taux perso, ou
            simulez jusqu’à 3 lignes à taux différents. Totaux HT, TVA et TTC. Calcul 100 % dans votre
            navigateur, indicatif, pas un conseil fiscal.{" "}
            <Link
              href="/blog/tva-ht-ttc-devis-b2b-france"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              HT, TTC et TVA sur un devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <TvaDevisHtTtcCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          En mode HT vers TTC, la TVA est le HT multiplié par le taux, et le TTC est la somme. En mode
          TTC vers HT, on divise par (1 + taux). En mode plusieurs lignes, chaque montant est saisi en
          HT ; une ligne à 0 est ignorée. Si deux taux coexistent, la ventilation s’affiche pour éviter
          un total TVA opaque.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/tva-ht-ttc-devis-b2b-france"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            afficher HT, TVA et TTC
          </Link>
          {" · "}
          <Link
            href="/blog/mentions-obligatoires-devis-france"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            mentions obligatoires
          </Link>
          {" · "}
          <Link
            href="/blog/acomptes-echeances-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            acomptes et échéances
          </Link>
          {" · "}
          <Link
            href="/outils/checklist-mentions-devis-france"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            checklist mentions
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-acompte-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            calculateur d’acompte
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Espace prospect, relecteurs et PDF."
        text="Le prospect a son lien. Chaque relecteur reçoit le sien, valable 30 jours, vers la même page. La fiche et le PDF montrent une fourchette indicative, en euros entiers. Essai gratuit, sans carte."
      />
    </>
  );
}
