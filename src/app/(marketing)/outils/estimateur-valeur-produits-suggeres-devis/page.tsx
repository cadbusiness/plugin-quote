import type { Metadata } from "next";
import Link from "next/link";
import { ValeurProduitsSuggeresDevisCalculator } from "@/components/marketing/valeur-produits-suggeres-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur valeur des produits suggérés dans un devis",
  description:
    "Estimez ce que rapporte une meilleure pertinence des produits suggérés dans votre funnel de devis B2B : dossiers avec suggestion retenue, valeur ajoutée aux devis, valeur gagnée indicative, temps commercial. Vos chiffres, calcul 100 % local.",
  path: "/outils/estimateur-valeur-produits-suggeres-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, pourcentages, valeur, taux et minutes restent dans votre navigateur. Rien n'est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le total indicatif ?",
    a: "L'écart de dossiers avec suggestion retenue (demandes × % visé moins demandes × % actuel) multiplie la valeur moyenne ajoutée. La valeur gagnée indicative applique votre taux de transformation à cet écart. Le temps libéré = cet écart de dossiers × minutes / 60 × taux horaire. Le total mensuel additionne valeur gagnée et temps. Sur 12 mois, ce total × 12. C'est indicatif, sur vos hypothèses, pas un conseil financier ni un benchmark.",
  },
  {
    q: "Pourquoi l'écart disparaît si le % visé n'est pas au-dessus du % actuel ?",
    a: "L'outil n'estime un gain que lorsque la part visée dépasse la part actuelle. Sinon il n'y a pas d'écart à chiffrer.",
  },
  {
    q: "Les règles Si/Alors changent-elles le parcours ou le prix ?",
    a: "Non. Elles choisissent seulement les produits proposés à l'écran « Solutions recommandées » : 3 blocs au maximum, par priorité décroissante. Elles ne font pas sauter d'étape et ne calculent pas de prix. Pas de kits : options, variantes et produits liés. Le prix reste une fourchette indicative min-max, sans TVA.",
  },
  {
    q: "L'outil change-t-il un score, un statut ou un SLA ?",
    a: "Non. C'est un ordre de grandeur local. Le score Hot / Warm / Cold suit une formule fixe à la soumission (surface, load, access, project_type, constraints, longueur du besoin) : il ignore photos, zone et urgence, il n'est pas configurable, et il n'y a pas de SLA produit. Les statuts CRM restent les sept de la liste fixe : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Accepté et Signé ne sont pas des statuts. Gagné et Perdu sont posés par le commercial.",
  },
];

export default function EstimateurValeurProduitsSuggeresDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur valeur des produits suggérés dans un devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime l'écart de valeur ajoutée aux devis, la valeur gagnée indicative et le temps commercial libéré quand les produits suggérés dans un funnel de devis B2B sont plus pertinents. Calcul local sur vos hypothèses.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-valeur-produits-suggeres-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur valeur des produits suggérés dans un devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de demandes, part actuelle et part visée de dossiers où le prospect retient un
            produit suggéré, valeur moyenne ajoutée, taux de transformation et minutes gagnées.
            L&apos;outil estime l&apos;écart de valeur ajoutée aux devis, la valeur gagnée indicative
            et le temps commercial libéré. Ce sont vos hypothèses, pas un benchmark. Calcul 100 %
            dans votre navigateur.{" "}
            <Link
              href="/blog/regles-suggestion-produits-funnel-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Règles de suggestion produits
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <ValeurProduitsSuggeresDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les dossiers avec suggestion retenue = demandes / mois × le pourcentage. L&apos;écart de
          dossiers = la part visée moins la part actuelle, sans descendre sous zéro. La valeur
          ajoutée aux devis = ces dossiers × la valeur moyenne d&apos;une suggestion retenue.
          L&apos;écart de valeur = la cible moins l&apos;actuel. La valeur gagnée indicative = cet
          écart × le taux de transformation. Les heures libérées = l&apos;écart de dossiers ×
          minutes ÷ 60. Le temps = ces heures × le taux horaire chargé. Le total mensuel additionne
          valeur gagnée et temps. Sur 12 mois, ce total × 12. Ordre de grandeur pour une discussion
          d&apos;équipe, pas un conseil financier.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les règles Si/Alors choisissent seulement les produits proposés à l&apos;écran « Solutions
          recommandées » (3 blocs au maximum, par priorité). Elles ne font pas sauter d&apos;étape et
          ne calculent pas de prix. Pas de kits : options, variantes et produits liés. Le prix reste
          une fourchette indicative min-max, sans TVA. Le score Hot, Warm ou Cold suit une formule
          fixe. Il n&apos;est pas configurable. Il n&apos;y a pas de SLA produit. Les statuts CRM
          sont Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Gagné et Perdu sont
          posés par le commercial.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/signup?plan=free"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            compte Free
          </Link>
          {" · "}
          <Link
            href="/blog/regles-suggestion-produits-funnel-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            règles de suggestion produits
          </Link>
          {" · "}
          <Link
            href="/blog/options-variantes-alternatives-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            options et variantes
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-paysagiste-amenagement-jardin"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel devis paysagiste
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-gain-temps-catalogue-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            gain de temps catalogue
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/catalogue"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            catalogue
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Trois blocs, pas tout le catalogue."
        text="Règles Si/Alors sur les produits suggérés, dans un ordre d'étapes fixe. Pas de kits. Free sans carte. La démo rayonnage montre le principe."
      />
    </>
  );
}
