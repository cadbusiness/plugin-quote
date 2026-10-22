import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurPenalitesRetardLivraisonCalculator } from "@/components/marketing/calculateur-penalites-retard-livraison-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-penalites-retard-livraison";

const DESCRIPTION =
  "Livraison ou chantier en retard sur la date du devis : saisissez le montant, l'assiette, les deux dates, la franchise, le taux par jour, le plafond et le seuil d'exonération. Le calcul donne les jours de retard, la pénalité due, le jour où le plafond est atteint et la compare au préjudice. Calcul 100 % local.";

const JSON_LD_DESCRIPTION =
  "Calcule une pénalité de retard de livraison B2B à partir du montant, de l'assiette, des deux dates, de la franchise, du taux, du plafond et du seuil d'exonération. Jours pénalisés, montant dû, jour du plafond et comparaison au préjudice. Calcul local.";

const INTRO =
  "Une livraison, une fabrication ou un chantier arrive après la date promise dans le devis. Si votre contrat prévoit des pénalités de retard, leur montant dépend de quatre choses : l'assiette, le taux par jour, la franchise et le plafond. Renseignez la commande, les deux dates et votre clause : le calcul donne les jours de retard, la pénalité due, le jour où le plafond est atteint, et la compare au préjudice que le retard cause vraiment.";

const NOTE =
  "Le calcul ne remplace pas un conseil juridique. Une pénalité de retard est une clause pénale, modérable par le juge si elle est manifestement excessive ou dérisoire, et due après mise en demeure sauf inexécution définitive (article 1231-5 du Code civil). Les CCAG publics ne s'appliquent qu'aux marchés qui s'y réfèrent.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de pénalités de retard de livraison (B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurPenalitesRetardLivraisonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de pénalités de retard de livraison (B2B)",
    url: `${SITE_URL}${PATH}`,
    description: JSON_LD_DESCRIPTION,
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
            Calculateur de pénalités de retard de livraison (B2B)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurPenalitesRetardLivraisonCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/delai-livraison-penalites-retard-execution-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Délai de livraison et pénalités de retard dans un devis B2B
          </Link>
          {" · "}
          <Link
            href="/blog/conditions-paiement-penalites-retard-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Conditions de paiement et pénalités de retard
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
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un avis juridique.
        </p>
      </section>
    </>
  );
}
