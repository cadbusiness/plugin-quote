import type { Metadata } from "next";
import Link from "next/link";
import { ChargeRelancesManuellesVsAutopiloteCalculator } from "@/components/marketing/charge-relances-manuelles-vs-autopilote-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/estimateur-charge-relances-manuelles-vs-autopilote";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur de charge : relances manuelles ou Autopilote",
  description:
    "Estimez le temps et le chiffre d'affaires que coûtent les confirmations, rappels internes et relances de devis faits à la main, face à un parcours automatique. Heures par mois, affaires perdues, mise en place amortie. Calcul 100 % local.",
  path: PATH,
});

export default function EstimateurChargeRelancesManuellesVsAutopilotePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur de charge : relances manuelles ou Autopilote",
    url: `${SITE_URL}${PATH}`,
    description:
      "Estime le temps et le chiffre d'affaires que coûtent les confirmations, rappels internes et relances de devis faits à la main, face à un parcours automatique. Calcul local.",
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
            Estimateur de charge : relances manuelles ou Autopilote
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Neuf hypothèses : votre volume de demandes, les touches que vous faites à la main, leur durée, votre taux
            horaire, la part des demandes où une touche saute, votre panier et vos taux de signature. Le calcul dit ce
            que coûte le suivi à la main chaque mois, et ce qu&apos;un parcours automatique vous évite une fois en
            place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <ChargeRelancesManuellesVsAutopiloteCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pour lire vos chiffres</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Touches à faire par mois : demandes multipliées par les touches à la main. Heures passées : ces touches
          multipliées par les minutes, divisées par 60. Le coût de ce temps est ces heures multipliées par le coût
          horaire.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les demandes sans suite complète sont celles où au moins une touche prévue saute. Les affaires perdues
          appliquent l&apos;écart entre les deux taux de signature, jamais en dessous de zéro, à ces demandes. Le
          chiffre d&apos;affaires manqué multiplie ces affaires par le panier.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          La mise en place est amortie sur 12 mois. Le coût mensuel évité additionne le temps et le chiffre
          d&apos;affaires manqué, puis retire cette mise en place. Les heures nettes rendues ne descendent pas sous
          zéro.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le calcul suppose que le parcours remplace les touches écrites une fois en place, et qu&apos;il les envoie
          toutes. Les appels et les visites restent à compter à part.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/autopilote-workflows-relance-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Autopilote et workflows de relance
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/autopilote"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            l&apos;Autopilote dans QuoteBuilder
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
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>

      <MarketingCta
        title="Relire les deux parcours avant la première demande."
        text="Compte Free sans carte. Le Parcours demande et le Parcours abandon sont installés à la création. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
