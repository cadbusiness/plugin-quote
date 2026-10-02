import type { Metadata } from "next";
import Link from "next/link";
import { CoutContexteHorsDossierDevisCalculator } from "@/components/marketing/cout-contexte-hors-dossier-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût du contexte hors dossier devis",
  description:
    "Estimez le coût mensuel quand le contexte d'un devis B2B reste dans Slack, au téléphone ou dans les têtes au lieu des notes internes du dossier : re-brief, dossiers fragiles, opportunités. Calcul 100 % local.",
  path: "/outils/estimateur-cout-contexte-hors-dossier-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, minutes et panier restent dans votre navigateur. Rien n'est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "Deux ordres de grandeur : le temps chargé de re-brief (dossiers fragiles = dossiers × % sans notes utiles, heures = fragiles × minutes / 60, coût temps = heures × taux) et les opportunités si un panier est renseigné (dossiers morts ou repartis en clarification faute de contexte × panier). Le total additionne les deux. C'est indicatif, pas un conseil financier.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l'outil ne convertit pas les dossiers concernés en euros. Dossiers fragiles, heures et coût temps restent affichés.",
  },
  {
    q: "Les notes internes sont-elles un chat d'équipe ?",
    a: "Non. Sur QuoteBuilder, les notes internes sont un champ / notes sur le dossier devis, visibles à l'équipe, séparées du fil prospect (chat plat). Ce n'est pas un module de chat interne inventé, ni des commentaires ancrés aux lignes. Les réponses équipe dans le fil prospect n'affichent pas de nom d'auteur.",
  },
  {
    q: "L'outil change-t-il un score, un statut ou un SLA ?",
    a: "Non. C'est un ordre de grandeur local. Le score Hot / Warm / Cold suit une formule fixe à la soumission (surface, load, access, project_type, constraints, longueur du besoin) : il ignore photos, zone et urgence, il n'est pas configurable, et il n'y a pas de SLA produit. Les statuts CRM restent les sept de la liste fixe : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Accepté et Signé ne sont pas des statuts. Gagné et Perdu sont posés par le commercial. Pas de versions Vn, pas d'acceptation en ligne du prospect. La fiche commerciale montre une dernière consultation relative, pas un open-tracking avancé.",
  },
];

export default function EstimateurCoutContexteHorsDossierDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût du contexte hors dossier devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures de re-brief, coût temps, dossiers fragiles et opportunités quand le contexte d'un devis B2B reste hors des notes internes du dossier.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-contexte-hors-dossier-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût du contexte hors dossier devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de dossiers, part sans notes internes utiles, minutes perdues en re-brief, et
            hypothèses de dossiers morts ou repartis en clarification faute de contexte. L’outil
            estime les dossiers fragiles, les heures, le coût temps, les opportunités et le total
            indicatif. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/notes-internes-dossier-devis-equipe-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Notes internes sur un dossier devis
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutContexteHorsDossierDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les dossiers fragiles = dossiers / mois × part sans notes internes utiles. Les heures
          perdues = ces dossiers fragiles × minutes de re-brief ÷ 60. Le coût temps = ces heures ×
          le taux horaire chargé. Les dossiers morts ou repartis en clarification = dossiers / mois
          × cette part. Si le panier est renseigné, les opportunités = ces dossiers × panier. Le
          total additionne coût temps et opportunités. Ordre de grandeur pour une discussion
          d’équipe, pas un conseil financier.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les notes internes vivent sur le dossier devis, visibles à l’équipe, séparées du fil
          prospect (chat plat). Ce n’est pas un chat interne inventé, ni des commentaires ancrés
          aux lignes. L’assignation existe ; Responsable technique et Directeur financier sont des
          rôles relecteur (lien 30 jours, Valider le dossier ou Modifications). Le score Hot, Warm
          ou Cold suit une formule fixe. Il n’est pas configurable. Il n’y a pas de SLA produit. Les
          statuts CRM sont Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Gagné
          et Perdu sont posés par le commercial. La fiche commerciale montre une dernière
          consultation relative.
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
            href="/blog/notes-internes-dossier-devis-equipe-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            notes internes sur un dossier devis
          </Link>
          {" · "}
          <Link
            href="/blog/transfert-brief-commercial-technique-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            transfert brief commercial → technique
          </Link>
          {" · "}
          <Link
            href="/blog/validation-interne-avant-envoi-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            validation interne
          </Link>
          {" · "}
          <Link
            href="/blog/commentaires-annotations-devis-collaboratif-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            commentaires collaboratifs
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/espace-prospect"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            espace prospect
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
        title="Gardez le contexte sur le dossier."
        text="Notes internes visibles à l’équipe, fil prospect à part. Pas de chat interne. Free sans carte. La démo rayonnage montre le principe."
      />
    </>
  );
}
