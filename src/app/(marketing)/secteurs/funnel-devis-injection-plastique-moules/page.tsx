import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const TITLE = "Funnel de devis injection plastique : pièce, matière, quantité annuelle, moule et contact alimentaire, une demande chiffrable avant le premier appel";
const DESCRIPTION = "Landing SEO mouleurs, injecteurs et transformateurs plastiques : les questions à poser avant de chiffrer une pièce injectée (prototype ou série, moule à créer ou existant, propriété du moule, matière, couleur, quantité annuelle et taille de lot, dimensions et poids, usage alimentaire, reprises et assemblage, fichiers), montage à partir du template Pièces & sous-traitance (industry_parts), score Cold 30, prix unitaires sous 1 € affichés au centime et au-dessus en euros entiers, déclaration de conformité contact alimentaire (règlement UE 10/2011, annexe IV). Sans template inventé ni fonction inventée.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/secteurs/funnel-devis-injection-plastique-moules",
});

export const FAQ = [
    {
      q: "QuoteBuilder a-t-il un template injection plastique ?",
      a: "Non. Partez du template « Pièces & sous-traitance », dans la famille Industrie & fabrication, nommé par défaut « Funnel pièces ». Sa liste de matières pense métal : renommez-la.",
    },
    {
      q: "Le prospect peut-il m'envoyer un fichier STEP ?",
      a: "Non. La zone « Plan (PDF ou image) » accepte les PDF, JPEG, PNG et WebP jusqu'à 10 Mo. Demandez un plan PDF dans le funnel et indiquez dans l'e-mail de confirmation où envoyer le fichier 3D.",
    },
    {
      q: "Le funnel peut-il calculer le prix d'une pièce à partir du poids et de la quantité ?",
      a: "Non. Le funnel ne fait aucun calcul entre les réponses. Il recueille les informations ; le prix sort de votre outil de chiffrage.",
    },
    {
      q: "Puis-je afficher un prix unitaire de 1,35 € ?",
      a: "Vous pouvez le saisir, mais le prospect verra « 1 € » : à partir de 1 €, les prix s'affichent en euros entiers. Sous 1 €, les centimes restent affichés. Vendez par lot ou affichez une fourchette.",
    },
    {
      q: "Pourquoi mes demandes sortent-elles toutes Cold ?",
      a: "Parce que la formule du score lit des clés et des valeurs que ce template n'utilise pas. Toutes les demandes sortent à 30 points. Triez sur le moule, la quantité annuelle et l'usage.",
    },
    {
      q: "Puis-je poser les questions sur le moule seulement à ceux qui n'en ont pas ?",
      a: "Non. Il n'y a pas de branchement conditionnel : toutes les questions s'affichent dans le même ordre. Rendez-les facultatives et prévoyez un choix « Je ne sais pas encore ».",
    },
    {
      q: "Une règle peut-elle dépendre de la quantité annuelle ?",
      a: "Oui, si la quantité annuelle est une question de type Mesure : « Quantité annuelle est au moins 20 000 ». Pas si c'est un Texte.",
    },
    {
      q: "Que faut-il pour une pièce au contact des aliments ?",
      a: "Selon la DGCCRF, le fabricant établit une déclaration de conformité qui indique les types de denrées et les conditions de contact ; pour le plastique, elle suit l'annexe IV du règlement (UE) n° 10/2011. Demandez au client l'aliment, la température, la durée et l'usage, et vérifiez les déclarations de votre fournisseur de matière.",
    },
    {
      q: "Puis-je proposer un moule et ses pièces comme un seul kit ?",
      a: "Non. QuoteBuilder ne gère pas de kits. Une règle peut proposer sur une même carte le moule, les échantillons et la série, qui restent des lignes séparées.",
    },
    {
      q: "Free suffit-il pour tester ?",
      a: "Oui. Le plan Free permet de monter le funnel et de voir l'interface, sans carte bancaire.",
    },
];

export default function FunnelDevisInjectionPlastiqueMoulesPage() {
  const body = loadPostBody("funnel-devis-injection-plastique-moules");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/secteurs/funnel-devis-injection-plastique-moules`,
    description: DESCRIPTION,
    about: "Injection plastique et moules",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Injection plastique et moules"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{TITLE}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{DESCRIPTION}</p>
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
              { href: "/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-amortissement-outillage-specifique", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/secteurs/funnel-devis-usinage-sous-traitance-pieces", t: "Secteur voisin", d: "Un autre funnel du même geste commercial." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez projet, moule, matière, quantité annuelle, usage et fichiers dans un ordre fixe. QuoteBuilder n'a pas de template injection plastique : partez de Pièces & sous-traitance. Le plan Free suffit pour voir l'interface, sans carte. "} />
    </>
  );
}
