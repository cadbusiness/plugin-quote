import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis mezzanine et plateforme industrielle : usage, surface, hauteur, charge, accès, une demande chiffrable avant la visite",
  description: "Landing SEO fabricants et installateurs de mezzanines métalliques et de plateformes de stockage : questions avant la visite, charge d'exploitation, accès et garde-corps, surface de plancher et formalités d'urbanisme (service-public.fr, article R*421-17 du code de l'urbanisme), réception et garanties, montage à partir du template Configurateur projet (racking), score de 38 à 80 selon le type d'espace, la surface et la charge. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-mezzanine-plateforme-industrielle",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template mezzanine ?", a: "Pas sous ce nom. Partez du template « Configurateur projet » (`racking`), famille « Rayonnage & stockage » : type d'espace, surface, hauteur et charge, puis les solutions adaptées. Renommez les libellés pour parler de mezzanine." },
  { q: "Puis-je renommer « Charge par niveau » en « Usage et charge du plancher » ?", a: "Oui. Changez le libellé de la question et ceux des options, gardez les valeurs `light`, `medium` et `heavy`. Le score et les règles continuent de fonctionner." },
  { q: "Comment le score est-il calculé sur ce template ?", a: "La formule est fixe : 30 points de base, 10 pour Entrepôt ou Commerce, 8, 15 ou 25 selon la surface, 8 pour une charge moyenne et 15 pour une charge lourde. Le score va de 38 à 80. Les questions ajoutées ne sont pas lues." },
  { q: "Puis-je poser la question « Porte palière » seulement si le client stocke des palettes ?", a: "Non. Il n'y a pas de branchement conditionnel. Toutes les questions s'affichent pour tout le monde. Ajoutez une réponse « À conseiller »." },
  { q: "Le funnel peut-il calculer la structure ou le prix au mètre carré ?", a: "Il ne fait pas de calcul entre les réponses. Le prix vient des produits du catalogue : montant de ligne égal au prix unitaire multiplié par la quantité, que le prospect règle à l'étape Personnalisation. La note de calcul reste votre travail." },
  { q: "Le prospect peut-il envoyer le plan du bâtiment ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation (PDF, JPEG, PNG, WebP, 10 Mo), ou plus tard depuis son espace prospect, rubrique « Compléter la demande »." },
  { q: "Mon équipe peut-elle joindre la note de calcul au dossier ?", a: "Non. Seuls les fichiers déposés par le prospect entrent dans le dossier. Votre équipe peut ajouter des notes internes en texte brut." },
  { q: "Faut-il une autorisation d'urbanisme pour une mezzanine ?", a: "Souvent, oui. Selon service-public.fr, au-delà de 5 m² de surface de plancher avec plus de 1,80 m sous plafond, il faut en général une déclaration préalable, voire un permis de construire au-delà de certains seuils. La règle dépend du lieu : vérifiez en mairie." },
  { q: "QuoteBuilder gère-t-il la pose et la réception ?", a: "Non. Pas de planning de pose, pas de procès-verbal de réception, pas de signature électronique, pas de facturation. Le funnel et le dossier servent à qualifier la demande ; la suite se gère dans vos outils." },
  { q: "Free suffit-il pour tester ?", a: "Oui, avec un funnel. Starter commence à 39 € par mois et Pro à 79 € par mois en paiement annuel. Voir la [page des tarifs](https://www.quotebuilder.co/tarifs)." },
];

export default function FunnelDevisMezzaninePlateformeIndustriellePage() {
  const body = loadPostBody("funnel-devis-mezzanine-plateforme-industrielle");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis mezzanine et plateforme industrielle : usage, surface, hauteur, charge, accès, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-mezzanine-plateforme-industrielle`,
    description: "Landing SEO fabricants et installateurs de mezzanines métalliques et de plateformes de stockage : questions avant la visite, charge d'exploitation, accès et garde-corps, surface de plancher et formalités d'urbanisme (service-public.fr, article R*421-17 du code de l'urbanisme), réception et garanties, montage à partir du template Configurateur projet (racking), score de 38 à 80 selon le type d'espace, la surface et la charge. Sans template inventé ni fonction inventée.",
    about: "Mezzanine et plateforme industrielle",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Mezzanine industrielle"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis mezzanine et plateforme industrielle : usage, surface, hauteur, charge, accès, une demande chiffrable avant la visite"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO fabricants et installateurs de mezzanines métalliques et de plateformes de stockage : questions avant la visite, charge d'exploitation, accès et garde-corps, surface de plancher et formalités d'urbanisme (service-public.fr, article R*421-17 du code de l'urbanisme), réception et garanties, montage à partir du template Configurateur projet (racking), score de 38 à 80 selon le type d'espace, la surface et la charge. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/score-demande-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/blog/pieces-jointes-plans-photos-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/blog/regles-suggestion-produits-funnel-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez usage, surface, hauteur, charge et accès dans un ordre fixe. QuoteBuilder n'a pas de template mezzanine : partez de Configurateur projet, celui du rayonnage. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
