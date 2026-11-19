import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis impression 3D et prototypage : procédé, matière, quantité, usage, fichier et confidentialité, une demande chiffrable avant le premier appel",
  description: "Landing SEO pour les ateliers d'impression 3D, les bureaux de service en fabrication additive et les prestataires de prototypage rapide : les questions à poser avant de chiffrer (usage de la pièce, procédé, matière, dimensions, quantité, finition, fichier disponible, échéance), le vocabulaire de la norme ISO/ASTM 52900, la confidentialité des fichiers avant devis (secret des affaires, article L151-3 et brevet), et comment monter ce funnel dans QuoteBuilder à partir du template Pièces & sous-traitance. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-impression-3d-prototypage",
});

export const FAQ = [
  { q: "Existe-t-il un template impression 3D dans QuoteBuilder ?", a: "Non. Le plus proche est « Pièces & sous-traitance », dans la famille Industrie & fabrication, le même que pour l'usinage. Il pose le type de besoin, la matière, la quantité et l'échéance. Vous adaptez les choix et ajoutez vos questions : procédé, dimensions, finition, fichier disponible, confidentialité." },
  { q: "Le client peut-il m'envoyer son fichier STL ou STEP par le funnel ?", a: "Non. La zone de dépôt accepte PDF, JPEG, PNG et WebP, jusqu'à 10 Mo, à l'étape Personnalisation comme dans « Compléter la demande » de l'espace prospect. Demandez un plan PDF ou des captures, et convenez de l'envoi du fichier 3D par votre propre canal." },
  { q: "Peut-on afficher des questions différentes selon le procédé ?", a: "Non. Les étapes et les questions passent dans un ordre fixe. Les règles Si/Alors choisissent seulement les produits proposés. Posez les questions utiles à tous, avec des libellés qui le permettent, ou créez un deuxième funnel pour une activité vraiment différente." },
  { q: "Les suggestions peuvent-elles dépendre de la quantité ?", a: "Oui, si la quantité est une liste ou un champ nombre. Le champ texte du template ne permet pas de condition numérique." },
  { q: "Pourquoi toutes mes demandes sont-elles Cold ?", a: "Parce que la formule du score ne lit aucune des questions de ce template. Elle donne 30 points, Cold, à chaque dossier, sauf si un texte de besoin ajoute des points. Triez sur l'usage, la quantité, l'échéance et le fichier disponible." },
  { q: "Peut-on proposer un lot « prototype + série » ?", a: "Pas sous forme de kit : QuoteBuilder n'en gère pas. Créez deux produits et suggérez-les ensemble avec une règle." },
  { q: "QuoteBuilder calcule-t-il le prix à partir du fichier ?", a: "Non. Il ne lit pas les fichiers et ne calcule ni volume ni temps d'impression. La fourchette affichée vient de votre catalogue. Les prix se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent)." },
  { q: "Comment gérer un client qui veut un accord de confidentialité ?", a: "Ajoutez une question « Confidentialité » au funnel, ne demandez pas de fichier sensible au premier tour, et faites signer l'accord hors de QuoteBuilder avant l'envoi. Notez la date et la durée dans les notes internes. L'article sur [l'accord de confidentialité avant un devis](https://www.quotebuilder.co/blog/accord-confidentialite-nda-avant-devis-b2b) détaille les clauses à vérifier." },
  { q: "Mon équipe peut-elle ajouter le fichier reçu par e-mail au dossier ?", a: "Non. Les fichiers d'un dossier viennent du prospect, par le funnel ou par l'espace prospect. Notez dans une note interne où le fichier est rangé." },
  { q: "Les prix affichés sont-ils HT ?", a: "QuoteBuilder affiche des montants qui se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent), sans mention HT, TVA ou TTC. Précisez-le dans votre devis ferme." },
];

export default function FunnelDevisImpression3dPrototypagePage() {
  const body = loadPostBody("funnel-devis-impression-3d-prototypage");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis impression 3D et prototypage : procédé, matière, quantité, usage, fichier et confidentialité, une demande chiffrable avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-impression-3d-prototypage`,
    description: "Landing SEO pour les ateliers d'impression 3D, les bureaux de service en fabrication additive et les prestataires de prototypage rapide : les questions à poser avant de chiffrer (usage de la pièce, procédé, matière, dimensions, quantité, finition, fichier disponible, échéance), le vocabulaire de la norme ISO/ASTM 52900, la confidentialité des fichiers avant devis (secret des affaires, article L151-3 et brevet), et comment monter ce funnel dans QuoteBuilder à partir du template Pièces & sous-traitance. Sans template inventé ni fonction inventée.",
    about: "Impression 3D et prototypage",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Impression 3D"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis impression 3D et prototypage : procédé, matière, quantité, usage, fichier et confidentialité, une demande chiffrable avant le premier appel"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO pour les ateliers d'impression 3D, les bureaux de service en fabrication additive et les prestataires de prototypage rapide : les questions à poser avant de chiffrer (usage de la pièce, procédé, matière, dimensions, quantité, finition, fichier disponible, échéance), le vocabulaire de la norme ISO/ASTM 52900, la confidentialité des fichiers avant devis (secret des affaires, article L151-3 et brevet), et comment monter ce funnel dans QuoteBuilder à partir du template Pièces & sous-traitance. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/accord-confidentialite-nda-avant-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-accord-confidentialite-nda", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez usage, procédé, matière, quantité, échéance et fichier disponible dans un ordre fixe. QuoteBuilder n'a pas de template impression 3D : partez de Pièces & sous-traitance. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
