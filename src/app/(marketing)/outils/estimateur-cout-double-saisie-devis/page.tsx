import type { Metadata } from "next";
import Link from "next/link";
import { CoutDoubleSaisieDevisCalculator } from "@/components/marketing/cout-double-saisie-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût de la double saisie devis",
  description:
    "Estimez le coût de la double saisie des demandes de devis B2B (mail/form vers resaisie logiciel) : heures perdues, dossiers déformés, opportunités. Calcul 100 % local.",
  path: "/outils/estimateur-cout-double-saisie-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, minutes, taux et panier restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "Deux ordres de grandeur : le temps chargé de la resaisie (heures = demandes × minutes / 60, puis × taux horaire) et les opportunités si un panier est renseigné (dossiers déformés × part qui meurt ou repart en clarification × panier). Le total additionne les deux.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas les dossiers morts en euros. Heures, coût temps et dossiers déformés restent affichés.",
  },
  {
    q: "QuoteBuilder a-t-il un écran pour saisir ou importer un devis ?",
    a: "Non. Pas de saisie manuelle de devis, pas d’écran d’import. Les demandes naissent du funnel public, de /api/leads, des plugins, de l’agent chat, ou d’un lien préfill rempli par le commercial. Le commercial ne joint pas de fichiers : les pièces viennent des uploads prospect. Pas de validité, de versions, de signature, de kits ni de TVA. Le funnel reste en ordre fixe, sans branchement conditionnel.",
  },
  {
    q: "L’outil change-t-il un score ou un statut ?",
    a: "Non. C’est un ordre de grandeur local. Le score Hot / Warm / Cold suit une formule fixe à la soumission (surface, load, access, project_type, constraints, longueur du besoin) : il ignore photos, zone et urgence, il n’est pas configurable, et il n’y a pas de SLA produit. Les statuts CRM restent les sept de la liste fixe : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Accepté et Signé ne sont pas des statuts. Gagné et Perdu sont posés par le commercial.",
  },
];

export default function EstimateurCoutDoubleSaisieDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût de la double saisie devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures de resaisie, coût temps, dossiers déformés et opportunités perdues liées à la double saisie des demandes de devis B2B.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-double-saisie-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût de la double saisie devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de demandes retraitées (mail, formulaire pauvre, Excel puis logiciel ou CRM),
            minutes perdues, part d’infos déformées et panier moyen. L’outil estime les heures, le
            coût temps, les dossiers déformés, les opportunités et le total indicatif. Calcul 100 %
            dans votre navigateur.{" "}
            <Link
              href="/blog/sources-demande-devis-b2b-funnel-api"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Sources d’une demande de devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutDoubleSaisieDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les heures perdues = demandes en double saisie × minutes par demande, ramenées en heures.
          Le coût temps = ces heures × le taux horaire chargé. Les dossiers déformés = demandes ×
          part d’infos perdues ou déformées. Les dossiers qui meurent ou repartent en clarification
          = dossiers déformés × cette part. Si le panier est renseigné, les opportunités = ces
          dossiers × panier HT. Le total additionne coût temps et opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/sources-demande-devis-b2b-funnel-api"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            sources d’une demande (funnel / API)
          </Link>
          {" · "}
          <Link
            href="/blog/formulaire-contact-vs-funnel-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            formulaire vs funnel
          </Link>
          {" · "}
          <Link
            href="/blog/preremplir-devis-url-parametres"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            préremplir via URL
          </Link>
          {" · "}
          <Link
            href="/blog/recevoir-demandes-devis-wordpress-quotebuilder"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            recevoir WP
          </Link>
          {" · "}
          <Link
            href="/blog/telephone-whatsapp-vers-brief-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            téléphone / WhatsApp vers brief
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
        title="Une source, un brief, zéro resaisie."
        text="Funnel, API, plugins ou lien préfill. Pas de saisie manuelle, pas d’import de devis. Free sans carte."
      />
    </>
  );
}
