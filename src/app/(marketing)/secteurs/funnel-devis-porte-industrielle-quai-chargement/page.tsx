import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis portes industrielles et quais de chargement : type de fermeture, dimensions de baie, manœuvre, quai, une demande chiffrable avant la visite",
  description: "Landing SEO fabricants, installateurs et mainteneurs de portes industrielles (portes sectionnelles, rideaux métalliques, portes rapides) et d'équipements de quai (niveleurs, abris, butoirs) : questions avant la visite, cotes en centimètres, site en activité et plan de prévention, entretien semestriel des portes automatiques (arrêté du 21 décembre 1993, article R4224-12 du code du travail), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-porte-industrielle-quai-chargement",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template portes industrielles ou quais de chargement ?", a: "Non. Il n'y a ni template portes ni template quais. Le plus proche est « Aménagement industriel » (fitout), qui parle d'un site et de ses contraintes, dont « Accès / quai ». On renomme ses libellés et on ajoute les questions utiles." },
  { q: "Puis-je renommer « Bureaux / vestiaires » en « Commerce, concession, parking » ?", a: "Oui. Vous changez le libellé, la valeur technique `office` reste la même et les règles de suggestion qui l'utilisent continuent de fonctionner." },
  { q: "Pourquoi mes demandes sortent-elles toutes Cold ?", a: "Parce que la formule de score est fixe et ne lit, sur ce template, que la question Contraintes : 30 points de base, 35 si une vraie contrainte est cochée. Warm commence à 45. Les questions que vous ajoutez ont des clés générées que la formule ne lit pas. Triez sur le délai et le projet." },
  { q: "Puis-je poser les questions sur le niveleur seulement si le prospect a choisi un niveleur ?", a: "Non. Il n'y a pas de branchement conditionnel : toutes les questions s'affichent pour tout le monde, dans un ordre fixe. Les règles Si/Alors servent seulement à choisir les produits suggérés." },
  { q: "Comment saisir une largeur de baie de 3,50 m ?", a: "En centimètres : 350. Une question Mesure ajoutée va de 0 à 10 000 par pas de 1, pensée pour des nombres entiers, et vous ne réglez que l'unité et l'exemple. Écrivez « en centimètres » dans le libellé." },
  { q: "Le funnel peut-il calculer la surface de la porte et un prix au mètre carré ?", a: "Non. QuoteBuilder ne fait pas de calcul entre les réponses. Le prix vient des produits du catalogue, avec une quantité réglée à l'étape Personnalisation. Le chiffrage fin se fait après lecture de la demande." },
  { q: "Le prospect peut-il envoyer des photos de sa porte ?", a: "Oui, par la zone « Plan (PDF ou image) » de l'étape Personnalisation (PDF, JPEG, PNG, WebP, 10 Mo), puis depuis son espace prospect, rubrique « Compléter la demande ». Une question de type Fichier, elle, s'affiche comme un champ texte dans le funnel public." },
  { q: "Mon équipe peut-elle joindre le rapport de visite ou le plan de prévention au dossier ?", a: "Non. Seuls les fichiers envoyés par le prospect figurent dans le dossier. Votre équipe peut écrire des notes internes, en texte brut et en ajout seul. Les documents de l'entreprise se gardent dans vos outils." },
  { q: "QuoteBuilder gère-t-il les contrats d'entretien et le livret d'entretien des portes ?", a: "Non. Vous pouvez vendre un contrat d'entretien comme un produit du catalogue, mais le produit ne planifie pas les visites semestrielles et ne tient pas de livret d'entretien. Ces suivis restent dans vos outils de maintenance." },
  { q: "Free suffit-il pour tester ?", a: "Oui. Le plan Free permet de créer un funnel et de voir l'interface, sans carte. Starter est à partir de 39 € par mois et Pro à partir de 79 € par mois en paiement annuel." },
];

export default function FunnelDevisPorteIndustrielleQuaiChargementPage() {
  const body = loadPostBody("funnel-devis-porte-industrielle-quai-chargement");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis portes industrielles et quais de chargement : type de fermeture, dimensions de baie, manœuvre, quai, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-porte-industrielle-quai-chargement`,
    description: "Landing SEO fabricants, installateurs et mainteneurs de portes industrielles (portes sectionnelles, rideaux métalliques, portes rapides) et d'équipements de quai (niveleurs, abris, butoirs) : questions avant la visite, cotes en centimètres, site en activité et plan de prévention, entretien semestriel des portes automatiques (arrêté du 21 décembre 1993, article R4224-12 du code du travail), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35. Sans template inventé ni fonction inventée.",
    about: "Portes industrielles et quais de chargement",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Portes industrielles"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis portes industrielles et quais de chargement : type de fermeture, dimensions de baie, manœuvre, quai, une demande chiffrable avant la visite"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO fabricants, installateurs et mainteneurs de portes industrielles (portes sectionnelles, rideaux métalliques, portes rapides) et d'équipements de quai (niveleurs, abris, butoirs) : questions avant la visite, cotes en centimètres, site en activité et plan de prévention, entretien semestriel des portes automatiques (arrêté du 21 décembre 1993, article R4224-12 du code du travail), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/plan-prevention-entreprise-exterieure-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-plan-prevention-entreprise-exterieure", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/visite-technique-avant-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez type de fermeture, cotes de baie en centimètres, manœuvre, quai et site en activité dans un ordre fixe. QuoteBuilder n'a pas de template portes industrielles ni de template quais de chargement : partez d'Aménagement industriel. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
