import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurRoiSalonProfessionnelDevisCalculator } from "@/components/marketing/calculateur-roi-salon-professionnel-devis-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-roi-salon-professionnel-devis";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur ROI salon professionnel",
  description:
    "Salon professionnel B2B : saisissez le coût du stand, des déplacements, des supports et des journées d'équipe, les contacts recueillis, la part qui devient une demande de devis, le taux de signature, le panier et la marge. Le calcul donne le coût par demande et par client, le résultat, le ROI et le seuil de rentabilité. Calcul 100 % local.",
  path: PATH,
});

export default function CalculateurRoiSalonProfessionnelDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur ROI salon professionnel",
    url: `${SITE_URL}${PATH}`,
    description:
      "Calcule le coût d'un salon professionnel (stand, déplacements, supports, temps d'équipe), le coût par contact, par demande de devis et par client, le résultat en marge brute, le ROI et le seuil de rentabilité, en comparant deux taux de transformation des contacts en demandes. Calcul local.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: { "@type": "Organization", name: "QuoteBuilder", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur ROI salon professionnel
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Un salon se juge sur les demandes de devis et les clients qu&apos;il produit, pas sur le nombre de badges
            scannés. Renseignez vos coûts et vos hypothèses : le calcul donne le coût par contact, par demande et par
            client, le résultat en marge brute, et compare la part de contacts transformés en demande aujourd&apos;hui
            avec celle que vous visez en prenant la demande sur le stand.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurRoiSalonProfessionnelDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pour lire le résultat</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le résultat du salon, c&apos;est la marge brute des commandes signées moins les coûts du salon. Il ne compte
          pas la valeur des clients qui reviendront plus tard, ni la notoriété. Il dit seulement si les commandes de
          ce salon le remboursent.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Toutes les valeurs par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/salon-professionnel-demandes-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Salon professionnel : transformer les contacts en demandes de devis
          </Link>
          {" · "}
          <Link href="/fonctionnalites/stats" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Les statistiques QuoteBuilder
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            voir la démo
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un avis comptable.
        </p>
      </section>

      <MarketingCta
        title="Préparer le funnel du stand."
        text="Compte Free sans carte. QuoteBuilder ne scanne pas les badges et ne génère pas de QR code : il reçoit les demandes envoyées depuis le lien public du funnel, avec les paramètres utm que vous ajoutez vous-même."
      />
    </>
  );
}
