import type { Metadata } from "next";
import Link from "next/link";
import { CoutParClientGoogleAdsDevisCalculator } from "@/components/marketing/cout-par-client-google-ads-devis-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de coût par devis et par client Google Ads",
  description:
    "Calculez ce que coûte une demande de devis et un client signé avec Google Ads, et le maximum à payer par client, par devis et par clic à partir de votre marge. Délai de signature, fenêtre de 90 jours, petits volumes. Calcul 100 % local.",
  path: "/outils/calculateur-cout-par-client-google-ads-devis",
});

export default function CalculateurCoutParClientGoogleAdsDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de coût par devis et par client Google Ads",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Calcule le coût d'une demande de devis et d'un client signé à partir du budget Google Ads, du coût par clic, de deux taux de transformation, du panier, de la marge et du délai de signature. Plafond à l'équilibre. Calcul local dans le navigateur.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/calculateur-cout-par-client-google-ads-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Calculateur de coût par devis et par client Google Ads
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Sept hypothèses : votre budget, votre coût par clic, vos deux taux de transformation, votre panier moyen,
            votre marge et votre délai de signature. Le calcul dit ce que coûte une demande, ce que coûte un client
            signé, et jusqu&apos;où vous pouvez payer.{" "}
            <Link
              href="/blog/google-ads-demande-devis-b2b-cout-par-client"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Google Ads et demande de devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutParClientGoogleAdsDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pour lire vos chiffres</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Un devis coûte, c&apos;est le budget du mois divisé par les demandes. Un client coûte, c&apos;est le même
          budget divisé par les dossiers passés au statut Gagné. Le plafond part de la marge brute d&apos;une affaire
          signée : coût par client à l&apos;équilibre, puis coût par devis et coût par clic selon vos deux taux.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          À l&apos;équilibre, la marge de la première affaire paie juste la publicité. Gardez de la place pour le temps
          passé à chiffrer les demandes perdues. Les conseils du calculateur signalent une signature au-delà de 90
          jours après le clic, une période de lecture trop courte, moins de 3 clients dans le mois, ou un coût par clic
          au-dessus du maximum.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Dans QuoteBuilder, l&apos;onglet Campagnes des Statistiques affiche Dépensé, Devis des pubs, Un devis coûte et
          Un client coûte, une fois le compte Google Ads branché par un administrateur. Le tableau détaille campagne,
          source, funnel, devis, gagnés, coût d&apos;un devis et coût d&apos;un client.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/google-ads-demande-devis-b2b-cout-par-client"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Google Ads et demande de devis B2B
          </Link>
          {" · "}
          <Link href="/fonctionnalites/ads" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Google Ads dans QuoteBuilder
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>

      <MarketingCta
        title="Lire le coût par client dans l'onglet Campagnes."
        text="Compte Free sans carte. Un administrateur connecte Google Ads depuis Acquisition. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
