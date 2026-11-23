import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const TITLE = "Funnel de devis vitrerie et miroiterie : type de verre, dimensions, emplacement, façonnage, accès et urgence, une demande chiffrable avant le déplacement";
const DESCRIPTION = "Landing SEO vitriers et miroitiers B2B (commerces, bureaux, restaurants, hôtels, syndics, ateliers) : les questions à poser avant de chiffrer un vitrage, un miroir, une crédence, une cloison ou un garde-corps en verre, montage à partir du template Menuisier (wood), score Cold 30, photos et plans par la zone « Plan (PDF ou image) », lien de déclaration des performances dans la ligne « Conformité » du produit. Sans template inventé ni fonction inventée.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/secteurs/funnel-devis-vitrerie-miroiterie",
});

export const FAQ = [
  {
    q: "QuoteBuilder a-t-il un template vitrerie ou miroiterie ?",
    a: "Non. Le modèle le plus proche est Menuisier, de la famille Habitat & aménagement, avec son type d'ouvrage en cartes (dont « Ouverture » et « Agencement »), sa finition en liste et ses dimensions en texte. Renommez les libellés, gardez les valeurs, et ajoutez vos questions de vitrerie.",
  },
  {
    q: "Le funnel peut-il calculer la surface et le prix au mètre carré ?",
    a: "Non. Le funnel n'a pas de calcul entre réponses. Il recueille la largeur, la hauteur et le nombre d'éléments en questions Mesure, et vous chiffrez. Affichez plutôt une fourchette par prestation type ou « Sur devis ».",
  },
  {
    q: "Le prospect peut-il m'envoyer des photos de la vitre cassée ?",
    a: "Oui, à l'étape Personnalisation, dans la zone « Plan (PDF ou image) » : PDF, JPEG, PNG ou WebP, 10 Mo par fichier. Il peut aussi en ajouter plus tard depuis son espace prospect. La question « Fichier » de l'éditeur, elle, s'affiche comme un champ texte.",
  },
  {
    q: "Puis-je poser la question du façonnage seulement pour les miroirs ?",
    a: "Non, le funnel n'a pas de branchement conditionnel : toutes les questions s'affichent dans le même ordre pour tout le monde. Gardez un choix « Aucun » pour que la question reste simple pour un remplacement de vitrage.",
  },
  {
    q: "Pourquoi mes demandes sortent-elles toutes Cold ?",
    a: "Parce que le score suit une formule fixe qui lit des clés précises (surface, charge, rotation, type de projet, contraintes, besoin). Le template Menuisier et vos questions ajoutées n'en portent aucune. Toutes les demandes sortent à 30 points, Cold. Triez par la réponse « Urgence ».",
  },
  {
    q: "Le client peut-il choisir une date d'intervention ?",
    a: "Pas dans un calendrier : le funnel n'a pas de type de question date. Utilisez une liste (« Casse à sécuriser aujourd'hui », « Sous huit jours », « Dans le mois », « Projet à chiffrer ») ou un champ Texte.",
  },
  {
    q: "Un prix de 185,50 € s'affiche-t-il au centime ?",
    a: "Non. Les prix s'affichent en euros entiers à partir de 1 € : 185,50 € devient « 186 € ». Les montants sous 1 € gardent deux décimales. Pour la vitrerie, une fourchette par prestation est plus parlante qu'un prix au centime.",
  },
  {
    q: "Dois-je fournir une déclaration des performances pour un vitrage isolant ?",
    a: "Si le vitrage est couvert par la norme harmonisée NF EN 1279-5, son fabricant établit une déclaration des performances et appose le marquage CE. Si vous le revendez ou le posez, vous transmettez cette déclaration au client, en français. Si vous assemblez vous-même les vitrages isolants, c'est vous le fabricant.",
  },
  {
    q: "Puis-je mettre la déclaration des performances dans la fiche produit ?",
    a: "Vous pouvez mettre son lien dans la ligne « Conformité » du bloc « Mode d'emploi » du produit, avec un libellé. Il s'affiche avec le produit dans le funnel, la boutique et le catalogue. QuoteBuilder n'héberge pas le fichier et votre équipe ne peut pas joindre de fichier au dossier.",
  },
  {
    q: "Free suffit-il pour tester ?",
    a: "Oui pour voir l'interface, monter un premier funnel à partir du modèle Menuisier et le tester vous-même. Starter dès 39 € et Pro dès 79 € par mois en annuel ajoutent de la capacité ; le détail est sur la page tarifs.",
  },
];

export default function FunnelDevisVitrerieMiroiteriePage() {
  const body = loadPostBody("funnel-devis-vitrerie-miroiterie");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/secteurs/funnel-devis-vitrerie-miroiterie`,
    description: DESCRIPTION,
    about: "Vitrerie et miroiterie",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Vitrerie et miroiterie"}</p>
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
              { href: "/blog/marquage-ce-declaration-performances-produits-construction-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-marquage-ce-declaration-performances", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/secteurs/funnel-devis-menuiserie-sur-mesure", t: "Secteur voisin", d: "Un autre funnel du même geste commercial." },
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
      <MarketingCta title="Essayer gratuitement" text={"Posez besoin, type de verre, dimensions, emplacement, façonnage, accès et urgence dans un ordre fixe. QuoteBuilder n'a pas de template vitrerie ou miroiterie : partez de Menuisier. Le plan Free suffit pour voir l'interface, sans carte."} />
    </>
  );
}
