import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurPretMainOeuvreDevisCalculator } from "@/components/marketing/verificateur-pret-main-oeuvre-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-pret-main-oeuvre-devis";
const TITLE = "Vérificateur de prêt de main-d'œuvre pour un devis de régie";
const DESCRIPTION = "Devis de régie, d'assistance technique ou de renfort : vérifiez les indices de prêt de main-d'œuvre illicite (encadrement, ordres, livrable, prix, matériel, savoir-faire), calculez le coût refacturable d'une mise à disposition et l'écart avec votre prix. Clause et message prêts à copier. Calcul local.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurPretMainOeuvreDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: TITLE,
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
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
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">{TITLE}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{"Un client vous demande des personnes plutôt qu'un résultat : « deux techniciens pendant six mois, à l'heure ». Décrivez l'opération, l'organisation prévue sur place et le coût de vos salariés. L'outil compte les indices de fourniture de personnel, calcule le coût refacturable d'une mise à disposition et l'écart avec votre prix, vérifie dix points, et prépare une clause pour le devis et un message pour le client."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurPretMainOeuvreDevisCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{"Le résultat est indicatif et ne remplace pas un conseil juridique. Les valeurs de départ sont des hypothèses d'exemple."}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href={"/blog/pret-main-oeuvre-illicite-marchandage-devis-regie-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"prêt de main-d'œuvre illicite et marchandage"}</Link>
          {" · "}<Link href={"/blog/forfait-regie-temps-passe-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"forfait ou régie"}</Link>
          {" · "}<Link href={"/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"sous-traitance et loi de 1975"}</Link>
          {" · "}<Link href={"/blog/clause-non-sollicitation-personnel-devis-b2b"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"clause de non-sollicitation"}</Link>
          {" · "}<Link href={"/secteurs/funnel-devis-palettes-caisses-bois-export"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"funnel de devis palettes et caisses bois"}</Link>
          {" · "}<Link href={"/signup?plan=free"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"Créer un compte Free"}</Link>
          {" · "}<Link href={"/c/demo/rayonnage"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"démo rayonnage"}</Link>
          {" · "}<Link href={"/tarifs"} className="font-medium text-mk-accent underline-offset-2 hover:underline">{"tarifs"}</Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
