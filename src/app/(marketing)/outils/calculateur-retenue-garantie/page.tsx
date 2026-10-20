import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurRetenueGarantieCalculator } from "@/components/marketing/calculateur-retenue-garantie-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-retenue-garantie";

const DESCRIPTION =
  "Retenue de garantie sur un marché de travaux : saisissez le montant, la TVA, le taux, le nombre de versements et la date de réception prévue. Le calcul donne la retenue totale et par versement, ce que vous encaissez avant libération, la date de libération (un an après la réception sur un marché privé), le coût de la trésorerie immobilisée et celui d'une caution bancaire à la place. Calcul 100 % local.";

const JSON_LD_DESCRIPTION =
  "Calcule la retenue de garantie d'un marché de travaux (plafond de 5 % sur un marché privé ou public, 3 % pour une PME avec certains acheteurs publics), la retenue par versement, la date de libération ou de remboursement, le coût de la trésorerie immobilisée et celui d'une caution bancaire. Calcul local.";

const INTRO =
  "Sur un marché de travaux, le client peut garder une partie de chaque versement jusqu'à un an après la réception : c'est la retenue de garantie, 5 % au plus. Renseignez le marché, le taux, les versements et la date de réception prévue : le calcul donne la somme retenue, la date de libération, ce que cet argent immobilisé vous coûte et ce que coûterait une caution bancaire à la place.";

const NOTE =
  "Le calcul ne remplace pas un conseil juridique. Pour un marché privé, le plafond de 5 % et la libération à un an viennent de la loi n° 71-584 du 16 juillet 1971. Pour un marché public, le plafond de 3 % pour une PME et le remboursement sous 30 jours viennent des articles R2191-33 et R2191-35 du Code de la commande publique.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur de retenue de garantie (marché de travaux)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurRetenueGarantiePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur de retenue de garantie (marché de travaux)",
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
            Calculateur de retenue de garantie (marché de travaux)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurRetenueGarantieCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/retenue-garantie-caution-devis-travaux-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Retenue de garantie dans un devis de travaux
          </Link>
          {" · "}
          <Link
            href="/blog/acomptes-echeances-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Acomptes et échéances
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
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un avis juridique ni
          comptable.
        </p>
      </section>
    </>
  );
}
