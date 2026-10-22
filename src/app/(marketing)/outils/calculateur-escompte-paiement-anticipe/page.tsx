import type { Metadata } from "next";
import Link from "next/link";
import { CalculateurEscomptePaiementAnticipeCalculator } from "@/components/marketing/calculateur-escompte-paiement-anticipe-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/calculateur-escompte-paiement-anticipe";

const DESCRIPTION =
  "Escompte pour paiement anticipé : saisissez le montant de la facture, le pourcentage, l'échéance normale, le délai d'escompte et votre coût de financement. Le calcul donne le montant de l'escompte, le taux annuel équivalent, l'escompte maximum à votre taux et la mention à porter sur la facture. Calcul local, sans compte.";

const JSON_LD_DESCRIPTION =
  "Calcule un escompte pour paiement anticipé B2B : montant, taux annuel équivalent simple et composé, comparaison au coût de financement et mention à porter sur la facture. Calcul local.";

const INTRO =
  "Vous proposez à un client une réduction s'il paie avant l'échéance, ou un fournisseur vous en propose une. Un escompte de 2 % paraît modeste. Ramené à un taux annuel, il coûte souvent bien plus qu'un découvert ou un financement de facture. Saisissez le montant, l'escompte, les deux délais et votre coût de financement : le calcul compare les deux.";

const NOTE =
  "Le calcul ne remplace pas un conseil comptable ou juridique. La facture entre professionnels indique les conditions d'escompte ou leur absence (article L441-9 du Code de commerce). Le traitement de l'escompte sur la facture et pour la TVA se valide avec l'expert-comptable.";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur d'escompte pour paiement anticipé (B2B)",
  description: DESCRIPTION,
  path: PATH,
});

export default function CalculateurEscomptePaiementAnticipePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculateur d'escompte pour paiement anticipé (B2B)",
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
            {"Calculateur d'escompte pour paiement anticipé (B2B)"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{INTRO}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CalculateurEscomptePaiementAnticipeCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">{NOTE}</p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/clause-reserve-propriete-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Clause de réserve de propriété dans un devis B2B
          </Link>
          {" · "}
          <Link
            href="/blog/conditions-paiement-penalites-retard-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Conditions de paiement et pénalités de retard
          </Link>
          {" · "}
          <Link
            href="/outils/calculateur-penalites-retard-paiement"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Calculateur de pénalités de retard de paiement
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
          Calcul local, aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses, pas un conseil comptable ni
          juridique.
        </p>
      </section>
    </>
  );
}
