import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const TITLE = "Funnel de devis élagage et abattage d'arbres : nombre d'arbres, hauteur, intervention, environnement, accès et évacuation, une demande chiffrable avant le déplacement";
const DESCRIPTION = "Landing SEO élagueurs et entreprises d'arboriculture B2B (syndics, bailleurs, entreprises, campings, hôtels, collectivités) : les questions à poser avant de chiffrer une taille, une réduction de couronne, un abattage, un démontage ou un dessouchage, montage à partir du template Paysagiste (garden), score lu sur la surface seulement, photos par la zone « Plan (PDF ou image) », règles Si/Alors pour les cartes de suggestion. Sans template inventé ni fonction inventée.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/secteurs/funnel-devis-elagage-abattage-arbres",
});

export const FAQ = [
  {
    q: "QuoteBuilder a-t-il un template élagage ?",
    a: "Non. Le modèle le plus proche est Paysagiste, de la famille Habitat & aménagement, avec son étape « Votre extérieur » (usage principal en choix multiple, surface en m², niveau d'entretien en liste), puis les étapes Solutions recommandées, Personnalisation et Vos coordonnées. Vous renommez les questions et ajoutez les vôtres : nombre d'arbres, hauteur, environnement, accès, évacuation, urgence.",
  },
  {
    q: "Le client peut-il m'envoyer des photos de l'arbre ?",
    a: "Oui, à l'étape Personnalisation, dans la zone « Plan (PDF ou image) » : PDF, JPEG, PNG ou WebP, 10 Mo par fichier. Il peut aussi en ajouter plus tard depuis son espace prospect, rubrique « Compléter la demande ». N'utilisez pas une question de type Fichier, qui s'affiche comme un champ texte dans le funnel publié.",
  },
  {
    q: "Pourquoi mes demandes urgentes sortent-elles Cold ?",
    a: "Parce que le score suit une formule fixe qui lit des clés précises. Sur le template Paysagiste, c'est la surface qui compte : 400 m² ou plus donne 55 points (Warm), de 100 à 399 m² donne 45 (Warm), en dessous de 100 m² donne 38 (Cold), et sans la question, 30 (Cold). L'urgence, la hauteur et les photos ne sont pas lues. Triez les urgences vous-même.",
  },
  {
    q: "Puis-je poser la question du dessouchage seulement en cas d'abattage ?",
    a: "Non, le funnel n'a pas de branchement conditionnel : toutes les questions s'affichent dans le même ordre pour tout le monde. Gardez une réponse « Non » ou « À conseiller » pour que la question reste simple pour le client qui demande seulement une taille.",
  },
  {
    q: "Le funnel peut-il calculer le prix à partir du nombre d'arbres ?",
    a: "Non. Le funnel n'a pas de calcul entre réponses. Il recueille le nombre d'arbres et la hauteur en questions Mesure, et vous chiffrez. Vos cartes de suggestion peuvent afficher une fourchette par prestation, choisie par vos règles selon les réponses.",
  },
  {
    q: "Le client peut-il choisir une date d'intervention ?",
    a: "Pas dans un calendrier : le funnel n'a pas de type de question date. Utilisez une liste (« Arbre dangereux à sécuriser », « Dans le mois », « Période à convenir ») et fixez la date au premier échange, après avoir vérifié les contraintes du site.",
  },
  {
    q: "Puis-je vendre un forfait abattage, dessouchage et évacuation ?",
    a: "Pas sous forme de kit : QuoteBuilder n'en a pas. Créez l'abattage avec des options (évacuation, broyage) et des variantes par hauteur, ou trois produits distincts que vos cartes de suggestion affichent ensemble.",
  },
  {
    q: "Faut-il une autorisation pour abattre un arbre chez un client professionnel ?",
    a: "Cela dépend du terrain. Dans un espace boisé classé, les coupes et abattages sont soumis à déclaration préalable (code de l'urbanisme, article R421-23), et un plan local d'urbanisme peut protéger d'autres arbres. Près d'un réseau, une déclaration de travaux est nécessaire. Vérifiez avant de promettre une date ; la question « Contrainte connue » vous aide à repérer les cas.",
  },
  {
    q: "Peut-on élaguer pendant la période de nidification ?",
    a: "L'article L411-1 du code de l'environnement interdit de détruire les nids et les œufs des espèces protégées, et l'Office français de la biodiversité recommande de ne pas tailler haies et arbres du 15 mars au 31 juillet. Un arbre habité pendant cette période demande une vérification et souvent un report. Pour un arbre dangereux, la mise en sécurité se décide au cas par cas.",
  },
  {
    q: "Free suffit-il pour tester ?",
    a: "Oui pour voir l'interface, monter un premier funnel à partir du modèle Paysagiste et le tester vous-même. Starter dès 39 € et Pro dès 79 € par mois en annuel ajoutent de la capacité ; le détail est sur la page tarifs.",
  },
];

export default function FunnelDevisElagageAbattageArbresPage() {
  const body = loadPostBody("funnel-devis-elagage-abattage-arbres");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/secteurs/funnel-devis-elagage-abattage-arbres`,
    description: DESCRIPTION,
    about: "Élagage et abattage d'arbres",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Élagage et abattage"}</p>
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
              { href: "/blog/mention-dechets-devis-travaux-bordereau-depot-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-mention-dechets-devis-travaux", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
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
      <MarketingCta title="Essayer gratuitement" text={"Posez nombre d'arbres, hauteur, intervention, environnement, accès et évacuation dans un ordre fixe. QuoteBuilder n'a pas de template élagage ou arboriculture : partez de Paysagiste. Le plan Free suffit pour voir l'interface, sans carte."} />
    </>
  );
}
