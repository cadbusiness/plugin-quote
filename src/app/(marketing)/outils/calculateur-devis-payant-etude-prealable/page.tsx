import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurDevisPayantEtudePrealableCalculator } from "@/components/marketing/calculateur-devis-payant-etude-prealable-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-devis-payant-etude-prealable";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur devis payant et étude préalable",
  description:
    "Faire payer l'étude ou le devis : saisissez vos demandes, votre temps d'étude, votre taux de signature, le prix de l'étude et la part de clients qui l'accepteraient. Le calcul donne le bilan mensuel, avec et sans le temps récupéré, et le taux d'acceptation d'équilibre. Calcul 100 % local.",
  path: PATH,
});

export default function CalculateurDevisPayantEtudePrealablePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur devis payant et étude préalable",
    url: `${SITE_URL}${PATH}`,
    description:
      "Compare une étude préalable gratuite et une étude payante, déduite ou non de la commande : études facturées, temps récupéré, contrats gagnés ou perdus, bilan mensuel et taux d'acceptation d'équilibre. Calcul local.",
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
            Calculateur devis payant et étude préalable
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Faire payer l&apos;étude, la visite ou le relevé filtre les demandes sans projet réel, mais fait aussi
            partir quelques clients sérieux. Renseignez vos hypothèses : le calcul compare votre situation actuelle,
            où l&apos;étude est gratuite, avec une étude payante, et dit si les études facturées et le temps récupéré
            valent plus que la marge des contrats perdus.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurDevisPayantEtudePrealableCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pour lire vos chiffres</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Heures d&apos;étude par mois : demandes multipliées par les heures par étude. Le coût de ce temps multiplie
          ces heures par le coût horaire. Le temps passé sur des études non signées retire la part déjà signée
          aujourd&apos;hui.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Études payées : demandes multipliées par la part de clients qui acceptent de payer. Les heures récupérées
          sont le temps d&apos;étude actuel moins le temps des études encore faites. Les contrats après étude payante
          multiplient les études payées par le taux de signature après. L&apos;écart de marge multiplie l&apos;écart de
          contrats par la marge brute.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Si l&apos;étude est déduite de la commande, seules les études des clients qui ne signent pas sont facturées.
          Sinon, toutes les études payées le sont. Le bilan sans le temps récupéré additionne ces recettes et
          l&apos;écart de marge. Le bilan avec le temps récupéré y ajoute la valeur des heures rendues.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le taux d&apos;acceptation d&apos;équilibre est celui qui annule le bilan sans le temps récupéré. Il
          n&apos;est pas affiché s&apos;il dépasse 100 %, ou si aucun taux ne suffit.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le bilan « sans le temps récupéré » ne compte que l&apos;argent : études facturées et marge gagnée ou
          perdue. Le temps récupéré ne vaut quelque chose que s&apos;il sert vraiment à autre chose, d&apos;où les deux
          lignes. Toutes les valeurs par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/devis-payant-etude-prealable-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Devis payant en B2B : quand faire payer l&apos;étude
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/catalogue"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Le catalogue QuoteBuilder
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
          Calcul local · aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un avis juridique ni
          comptable.
        </p>
      </section>

      <MarketingCta
        title="Annoncer l'étude dans le funnel."
        text="Compte Free sans carte. QuoteBuilder n'encaisse pas l'étude : il l'annonce dans le catalogue et enregistre la réponse. Le paiement reste dans votre circuit habituel."
      />
    </>
  );
}
