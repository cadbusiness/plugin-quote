import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis thermolaquage et traitement de surface : pièces, métal, état, usage, teinte et dimensions, une demande chiffrable avant le premier appel",
  description: "Landing SEO pour les ateliers de thermolaquage, de peinture industrielle et de traitement de surface des métaux : les questions à poser avant de chiffrer (pièces, métal et état, usage final et corrosivité, teinte, dimensions et poids, masquages, exigences documentées, transport), le vocabulaire du métier, la place du laqueur dans une chaîne de sous-traitance, et comment monter ce funnel dans QuoteBuilder à partir du template Pièces & sous-traitance. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-thermolaquage-traitement-surface",
});

export const FAQ = [
  { q: "Existe-t-il un template thermolaquage dans QuoteBuilder ?", a: "Non. QuoteBuilder n'a pas de template thermolaquage ni traitement de surface. Le plus proche est « Pièces & sous-traitance », dans la famille Industrie & fabrication, qui crée un funnel de type Formulaire nommé « Funnel pièces ». On renomme ses questions et on en ajoute." },
  { q: "Peut-on afficher des questions différentes selon le métal ou l'usage ?", a: "Non. Il n'y a pas de branchement conditionnel : toutes les questions s'affichent pour tout le monde, dans l'ordre fixé. Les règles Si/Alors choisissent seulement les produits proposés à l'écran Solutions recommandées, jusqu'à trois." },
  { q: "Le client peut-il envoyer des photos de ses pièces ?", a: "Oui. À l'étape Personnalisation, la zone « Plan (PDF ou image) » accepte PDF, JPEG, PNG et WebP jusqu'à 10 Mo par fichier. Après l'envoi, le client peut aussi ajouter un fichier depuis son espace prospect, dans « Compléter la demande »." },
  { q: "Pourquoi toutes mes demandes sont-elles Cold ?", a: "Parce que la formule du score est fixe et ne lit aucune question du template Pièces & sous-traitance, ni les questions ajoutées. Chaque dossier reçoit 30 points, Cold. Triez sur le contenu : quantité, dimensions, usage, photo, échéance." },
  { q: "Peut-on proposer « grenaillage + thermolaquage » en un seul lot ?", a: "Pas sous forme de kit : QuoteBuilder ne gère pas de lots composés. Créez deux produits et une règle qui les suggère ensemble, par exemple quand l'état des pièces est « Rouillées »." },
  { q: "QuoteBuilder calcule-t-il le prix à partir des dimensions ?", a: "Non. Les produits portent un prix fixe, une fourchette ou la mention « sur devis ». Les prix se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent). Les règles peuvent proposer un produit « pièces longues » au-delà d'une longueur, mais le calcul de la surface développée et des charges reste votre chiffrage." },
  { q: "Comment noter qu'une demande vient d'un métallier qui sous-traite ?", a: "Ajoutez une question « Vous êtes » (client final, ou entreprise qui fait laquer pour un chantier) et une question facultative « Client final et chantier ». Notez ensuite dans les notes internes du dossier les dates utiles. Les règles de la loi de 1975 sont expliquées dans l'article sur la sous-traitance." },
  { q: "Mon équipe peut-elle joindre au dossier la fiche technique de la poudre ?", a: "Non. L'équipe ne peut pas joindre de fichier à un dossier : les fichiers viennent du client. La fiche technique part avec votre devis ferme, depuis votre outil habituel." },
  { q: "Les prix affichés sont-ils HT ?", a: "QuoteBuilder n'affiche pas de mention HT ou TTC : les prix du catalogue se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent), et le dossier affiche une fourchette indicative. Précisez dans votre devis ferme la base hors taxes et le taux de TVA applicable." },
  { q: "Peut-on fixer une date de validité sur la fourchette ?", a: "Non. Les devis de QuoteBuilder n'ont pas de date de validité ni d'expiration. Le PDF récapitulatif porte le pied fixe « Document indicatif, non contractuel. ». La durée de validité de votre prix figure dans votre devis ferme." },
];

export default function FunnelDevisThermolaquageTraitementSurfacePage() {
  const body = loadPostBody("funnel-devis-thermolaquage-traitement-surface");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis thermolaquage et traitement de surface : pièces, métal, état, usage, teinte et dimensions, une demande chiffrable avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-thermolaquage-traitement-surface`,
    description: "Landing SEO pour les ateliers de thermolaquage, de peinture industrielle et de traitement de surface des métaux : les questions à poser avant de chiffrer (pièces, métal et état, usage final et corrosivité, teinte, dimensions et poids, masquages, exigences documentées, transport), le vocabulaire du métier, la place du laqueur dans une chaîne de sous-traitance, et comment monter ce funnel dans QuoteBuilder à partir du template Pièces & sous-traitance. Sans template inventé ni fonction inventée.",
    about: "Thermolaquage et traitement de surface",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Thermolaquage"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis thermolaquage et traitement de surface : pièces, métal, état, usage, teinte et dimensions, une demande chiffrable avant le premier appel"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO pour les ateliers de thermolaquage, de peinture industrielle et de traitement de surface des métaux : les questions à poser avant de chiffrer (pièces, métal et état, usage final et corrosivité, teinte, dimensions et poids, masquages, exigences documentées, transport), le vocabulaire du métier, la place du laqueur dans une chaîne de sous-traitance, et comment monter ce funnel dans QuoteBuilder à partir du template Pièces & sous-traitance. Sans template inventé ni fonction inventée."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover">Créer ce funnel</Link>
            <Link href="/secteurs" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mk-ink ring-1 ring-mk-border">Tous les secteurs</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-6">
        <Markdown source={body} />
      </section>
      <section className="border-y border-mk-border bg-mk-band px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">La chaîne, sur ce métier</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-sous-traitance-loi-1975", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/pieces-jointes-plans-photos-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/fonctionnalites/espace-prospect", t: "Espace prospect", d: "Le dossier, les pièces et les relances, sur un seul lien." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl bg-white p-4 ring-1 ring-mk-border hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)]">
                <p className="font-semibold">{item.t}</p>
                <p className="mt-1 text-sm text-mk-muted">{item.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <MarketingFaq items={FAQ} />
      <MarketingCta title="Essayer gratuitement" text={" Posez pièces, métal, état, usage final, teinte et dimensions dans un ordre fixe. QuoteBuilder n'a pas de template thermolaquage : partez de Pièces & sous-traitance. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
