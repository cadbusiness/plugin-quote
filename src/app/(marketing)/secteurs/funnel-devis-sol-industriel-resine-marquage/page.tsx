import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis sol industriel, résine et marquage au sol : surface, support, trafic, arrêt d'activité, une demande chiffrable avant la visite",
  description: "Landing SEO applicateurs de sols industriels, revêtements de sol en résine, peinture de sol et marquage au sol d'entrepôts, d'ateliers et de locaux techniques : questions avant la visite (surface, support, état, trafic, zone alimentaire, arrêt d'activité, remise en service, marquage), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35, règles du code du travail sur les sols et le marquage des voies (R4214-3, R4214-4, R4214-11, R4224-3). Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-sol-industriel-resine-marquage",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template sol industriel ou marquage au sol ?", a: "Non. QuoteBuilder n'a pas de template sol industriel. La base la plus proche est le template « Aménagement industriel » (fitout, famille « Industrie & fabrication »), avec le type de site (Entrepôt / logistique, Atelier de production, Bureaux / vestiaires, Autre) et les contraintes (Normes alimentaires, Hauteur limitée, Accès / quai, Aucune particulière). Vous renommez les choix et ajoutez vos questions." },
  { q: "Le funnel peut-il calculer un prix au m² à partir de la surface saisie ?", a: "Non. QuoteBuilder ne fait pas de calcul entre les réponses. Le prix vient des produits de votre catalogue, avec une quantité que le prospect règle à l'étape Personnalisation. Un produit « au m² » avec une quantité de 1 200 donne une estimation indicative, pas un prix calculé à partir de la question Surface." },
  { q: "Pourquoi mes demandes de sol sortent-elles toutes Cold ?", a: "Parce que la formule de score est fixe et que, sur fitout, elle ne lit que la clé `constraints` : 30 points, ou 35 si une vraie contrainte est cochée. La question Surface que vous ajoutez a une clé générée automatiquement, que la formule ne lit pas. Triez sur la surface, le trafic et la période dans les réponses." },
  { q: "Puis-je afficher les questions de marquage seulement aux prospects qui en veulent ?", a: "Non, il n'y a pas de branchement conditionnel. Toutes les questions s'affichent dans l'ordre choisi. Rendez les questions de marquage facultatives, et ajoutez « Pas de marquage » dans les choix." },
  { q: "Comment le prospect m'envoie-t-il des photos du sol et le plan ?", a: "Par la zone « Plan (PDF ou image) » de l'étape Personnalisation (PDF, JPEG, PNG ou WebP, 10 Mo), puis depuis son espace prospect avec « Compléter la demande ». N'utilisez pas une question de type Fichier : dans le funnel publié, elle s'affiche comme un champ texte." },
  { q: "Mon équipe peut-elle joindre le rapport de diagnostic au dossier ?", a: "Non. L'équipe ne peut pas joindre de fichier au dossier : seuls les envois du prospect y figurent. Notez les conclusions du diagnostic dans les notes internes, et envoyez le rapport avec votre devis depuis votre outil habituel." },
  { q: "Que dit le code du travail sur les sols des locaux de travail ?", a: "L'article R4214-3 prévoit que les planchers des locaux sont exempts de bosses, de trous ou de plans inclinés dangereux, et qu'ils sont fixes, stables et non glissants. L'article R4214-4 demande des surfaces qui peuvent être nettoyées. Ces obligations pèsent sur le maître d'ouvrage et l'employeur ; vous proposez une solution adaptée à ce qu'il vous décrit." },
  { q: "Le marquage au sol des allées est-il obligatoire ?", a: "L'article R4214-11 prévoit que le marquage au sol des voies de circulation est mis en évidence dès que l'importance de la circulation des véhicules ou le danger lié aux locaux le justifie, selon la réglementation sur la signalisation dans les lieux de travail. L'article R4224-3 demande une circulation sûre des piétons et des véhicules. Le tracé reste une décision du client, selon son plan de circulation." },
  { q: "Le client est une mairie : qu'est-ce qui change ?", a: "Sous 100 000 € HT de travaux, la mairie peut commander sans publicité ni mise en concurrence, souvent après comparaison de devis. Elle paie sous 30 jours à compter de la réception de la facture sur Chorus Pro, et un retard ouvre droit à des intérêts moratoires et à une indemnité de 40 €. Voir l'article sur les devis pour un acheteur public et le calculateur d'intérêts moratoires." },
  { q: "Free suffit-il pour tester ?", a: "Oui, pour monter un funnel et le tester : Free est sans carte, avec un funnel. Starter commence à 39 € par mois et Pro à 79 € par mois en paiement annuel. Le détail est sur la page des tarifs." },
];

export default function FunnelDevisSolIndustrielResineMarquagePage() {
  const body = loadPostBody("funnel-devis-sol-industriel-resine-marquage");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis sol industriel, résine et marquage au sol : surface, support, trafic, arrêt d'activité, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-sol-industriel-resine-marquage`,
    description: "Landing SEO applicateurs de sols industriels, revêtements de sol en résine, peinture de sol et marquage au sol d'entrepôts, d'ateliers et de locaux techniques : questions avant la visite (surface, support, état, trafic, zone alimentaire, arrêt d'activité, remise en service, marquage), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35, règles du code du travail sur les sols et le marquage des voies (R4214-3, R4214-4, R4214-11, R4224-3). Sans template inventé ni fonction inventée.",
    about: "Sol industriel, résine et marquage au sol",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Sol industriel et marquage"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis sol industriel, résine et marquage au sol : surface, support, trafic, arrêt d'activité, une demande chiffrable avant la visite"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO applicateurs de sols industriels, revêtements de sol en résine, peinture de sol et marquage au sol d'entrepôts, d'ateliers et de locaux techniques : questions avant la visite (surface, support, état, trafic, zone alimentaire, arrêt d'activité, remise en service, marquage), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35, règles du code du travail sur les sols et le marquage des voies (R4214-3, R4214-4, R4214-11, R4224-3). Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/devis-acheteur-public-marche-sans-publicite-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-interets-moratoires-marche-public", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/plan-prevention-entreprise-exterieure-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez surface, support, état du sol, trafic, arrêt d'activité et marquage dans un ordre fixe. QuoteBuilder n'a pas de template sol industriel : partez d'Aménagement industriel. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
