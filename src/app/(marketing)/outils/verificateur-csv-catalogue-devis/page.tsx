import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurCsvCatalogueDevisCalculator } from "@/components/marketing/verificateur-csv-catalogue-devis-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-csv-catalogue-devis";

export const metadata: Metadata = pageMetadata({
  title: "Vérificateur de fichier CSV catalogue avant import",
  description:
    "Collez ou choisissez votre CSV catalogue : séparateur, colonnes reconnues, SKU en double, prix illisibles, lignes ignorées et champs qui seront effacés, contrôlés avec les mêmes règles que l'import QuoteBuilder. Conversion point-virgule vers virgule. Tout reste dans votre navigateur.",
  path: PATH,
});

export default function VerificateurCsvCatalogueDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Vérificateur de fichier CSV catalogue avant import",
    url: `${SITE_URL}${PATH}`,
    description:
      "Contrôle un CSV catalogue avec les règles de l'import QuoteBuilder : séparateur, colonnes reconnues, SKU en double, prix illisibles, lignes ignorées, champs effacés. Conversion point-virgule vers virgule. Calcul local.",
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
            Vérificateur de fichier CSV catalogue avant import
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Un tarif exporté d&apos;Excel arrive rarement propre : point-virgule au lieu de virgule, accents abîmés,
            colonne « Prix » que personne ne reconnaît, SKU en double. Collez votre fichier ou choisissez-le : l&apos;outil
            le lit avec les mêmes règles que l&apos;import CSV du catalogue QuoteBuilder, dit ce qui bloque, ce qui sera
            ignoré et ce qui sera effacé, puis vous rend un fichier à la virgule si besoin.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurCsvCatalogueDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Ce que l&apos;outil ne vérifie pas</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[16px] leading-7 text-mk-muted">
          <li>
            Si un SKU existe déjà dans votre funnel : il ne voit pas votre catalogue. C&apos;est pourtant ce qui décide
            entre création et mise à jour.
          </li>
          <li>
            Les photos, options, variantes et caractéristiques : le CSV ne les importe pas, elles se règlent sur la
            fiche produit.
          </li>
          <li>
            La justesse de vos prix et le choix HT ou TTC : le fichier n&apos;a pas de colonne TVA, le montant est pris
            tel quel.
          </li>
        </ul>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/import-catalogue-csv-funnel-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            importer son catalogue en CSV
          </Link>
          {" · "}
          <Link href="/fonctionnalites/catalogue" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            le catalogue
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
        title="Importer le catalogue, pas le ressaisir."
        text="Compte Free sans carte. L'import CSV est dans le catalogue, réservé au Propriétaire et aux Admins. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
