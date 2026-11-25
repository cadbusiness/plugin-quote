import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const TITLE = "Funnel de devis arrosage automatique et irrigation : surface, zones, source d'eau, pression, réseaux enterrés et pilotage, une demande chiffrable avant la visite";
const DESCRIPTION = "Landing SEO installateurs d'arrosage automatique et paysagistes qui équipent des résidences, hôtels, campings, entreprises, terrains de sport et collectivités : les questions à poser avant de chiffrer une installation ou une rénovation d'arrosage (surface, zones, source d'eau, pression, réseaux enterrés, alimentation électrique, pilotage, contrat d'entretien et hivernage), montage à partir du template Paysagiste (garden), effet réel du score, plan et photos par la zone « Plan (PDF ou image) », règles Si/Alors pour les cartes de suggestion. Sans template inventé ni fonction inventée.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/secteurs/funnel-devis-arrosage-automatique-irrigation",
});

export const FAQ = [
  {
    q: "QuoteBuilder a-t-il un template arrosage ou irrigation ?",
    a: "Non. Le modèle le plus proche est Paysagiste, de la famille Habitat & aménagement, avec son étape « Votre extérieur » (usage principal en choix multiple, surface en m², niveau d'entretien en liste), puis les étapes Solutions recommandées, Personnalisation et Vos coordonnées. Vous renommez les questions et ajoutez les vôtres : zones, source d'eau, pression, existant, obstacles, pilotage.",
  },
  {
    q: "Le client peut-il m'envoyer un plan ou des photos du compteur ?",
    a: "Oui, à l'étape Personnalisation, dans la zone « Plan (PDF ou image) » : PDF, JPEG, PNG ou WebP, 10 Mo par fichier, un fichier par sélection. Il peut aussi en ajouter plus tard depuis son espace prospect, rubrique « Compléter la demande ». N'utilisez pas une question de type Fichier, qui s'affiche comme un champ texte dans le funnel publié. Les photos au format HEIC ne passent pas : demandez du JPEG.",
  },
  {
    q: "Pourquoi une petite demande urgente sort-elle Cold ?",
    a: "Parce que le score suit une formule fixe qui lit des clés précises. Sur le template Paysagiste, c'est la surface qui compte : 400 m² ou plus donne 55 points (Warm), de 100 à 399 m² donne 45 (Warm), en dessous de 100 m² donne 38 (Cold), et sans la question, 30 (Cold). L'urgence, la source d'eau et les photos ne sont pas lues. Triez vous-même.",
  },
  {
    q: "Puis-je poser la question du forage seulement si le client a un forage ?",
    a: "Non, le funnel n'a pas de branchement conditionnel : toutes les questions s'affichent dans le même ordre pour tout le monde. Gardez une réponse « Je ne sais pas » ou « Aucun » pour que la question reste simple pour le client qui a un compteur public.",
  },
  {
    q: "Le funnel peut-il calculer le prix à partir de la surface ?",
    a: "Non. Le funnel n'a pas de calcul entre réponses. Il recueille la surface et le nombre de zones en questions Mesure, et vous chiffrez. Vos cartes de suggestion peuvent afficher une fourchette par prestation, choisie par vos règles selon les réponses.",
  },
  {
    q: "Le client peut-il choisir une date de début de travaux ?",
    a: "Pas dans un calendrier : le funnel n'a pas de type de question date. Utilisez une liste (« Dès que possible », « Avant la saison d'arrosage », « Hors saison », « À convenir ») et fixez la date au premier échange.",
  },
  {
    q: "Puis-je vendre un forfait installation, mise en service et hivernage ?",
    a: "Pas sous forme de kit : QuoteBuilder n'en a pas. Créez l'installation avec des options et des variantes, ou plusieurs produits distincts que vos cartes de suggestion affichent ensemble.",
  },
  {
    q: "Peut-on promettre qu'on pourra arroser toute la saison ?",
    a: "Non, il vaut mieux ne rien garantir à ce sujet. Le préfet peut prendre un arrêté de restriction temporaire des usages de l'eau, gradué en quatre niveaux (vigilance, alerte, alerte renforcée, crise), qui peut aller jusqu'à l'arrêt total des prélèvements (code de l'environnement, article R211-66). Écrivez dans le devis que l'usage peut être limité par arrêté, et ce que cela change pour le client.",
  },
  {
    q: "Faut-il déclarer un forage fait pour un client ?",
    a: "Pour l'usage domestique de l'eau, oui : l'article L2224-9 du code général des collectivités territoriales prévoit une déclaration au maire, et les entreprises qui réalisent des forages tiennent un registre et les déclarent pour le compte de leur client dans les trois mois. Les travaux de création doivent respecter une certification. Pour un usage professionnel, vérifiez le régime applicable auprès de la direction départementale des territoires.",
  },
  {
    q: "Free suffit-il pour tester ?",
    a: "Oui pour voir l'interface, monter un premier funnel à partir du modèle Paysagiste et le tester vous-même. Starter dès 39 € et Pro dès 79 € par mois en annuel ajoutent de la capacité ; le détail est sur la page tarifs.",
  },
];

export default function FunnelDevisArrosageAutomatiqueIrrigationPage() {
  const body = loadPostBody("funnel-devis-arrosage-automatique-irrigation");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/secteurs/funnel-devis-arrosage-automatique-irrigation`,
    description: DESCRIPTION,
    about: "Arrosage automatique et irrigation",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Arrosage et irrigation"}</p>
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
              { href: "/blog/reconduction-tacite-preavis-resiliation-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-preavis-reconduction-tacite", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/secteurs/funnel-devis-paysagiste-amenagement-jardin", t: "Secteur voisin", d: "Un autre funnel du même geste commercial." },
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
      <MarketingCta title="Essayer gratuitement" text={"Posez surface, zones, source d'eau, pression, réseaux enterrés et pilotage dans un ordre fixe. QuoteBuilder n'a pas de template arrosage ou irrigation : partez de Paysagiste. Le plan Free suffit pour voir l'interface, sans carte."} />
    </>
  );
}
