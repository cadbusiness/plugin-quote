import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis déménagement d'entreprise : sites, volume, étages, objets sensibles, date, une demande chiffrable avant la visite technique",
  description: "Landing SEO déménageurs d'entreprise (bureaux, ateliers, archives, informatique) : questions avant la visite technique, NAF 49.42Z, registre des transporteurs (article L3211-1 du code des transports), absence de template déménagement, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-demenagement-entreprise",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template déménagement ?", a: "Non. Le plus proche est « Aménagement industriel » (`fitout`), famille « Industrie & fabrication ». Vous renommez ses libellés et ajoutez vos questions." },
  { q: "Puis-je renommer « Bureaux / vestiaires » en « Bureaux, agence, cabinet » ?", a: "Oui. Le libellé change, la valeur `office` reste. Les règles de suggestion qui utilisent `office` continuent de fonctionner." },
  { q: "Pourquoi mes demandes sortent-elles toutes Cold ?", a: "Parce que la formule de score est fixe et ne lit presque rien sur ce template : 30 points de base, 35 si une contrainte réelle est cochée. Les questions que vous ajoutez ont des clés générées automatiquement, que la formule ne lit pas. Triez sur les réponses." },
  { q: "Puis-je poser la question « salle serveur » seulement si le client a de l'informatique ?", a: "Non. Il n'y a pas de branchement conditionnel : toutes les questions s'affichent pour tout le monde. Proposez une réponse « Non concerné »." },
  { q: "Le prospect peut-il envoyer des photos de ses locaux ?", a: "Oui, à l'étape Personnalisation, dans la zone « Plan (PDF ou image) » : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Plus tard, il peut ajouter des fichiers depuis « Compléter la demande » sur son espace prospect." },
  { q: "Mon équipe peut-elle joindre le métré de la visite au dossier ?", a: "Non. Les fichiers d'un dossier viennent seulement du prospect. Notez le métré en note interne, ou demandez au client de déposer son plan." },
  { q: "Y a-t-il une question de type date ?", a: "Non. Les types disponibles sont Choix visuel, Mesure, Liste, Choix multiple, Texte et Fichier. Posez la période en Liste, ou la date en Texte." },
  { q: "Le client peut-il faire valider le devis par sa direction ?", a: "Oui. Il peut partager le dossier à des relecteurs, chacun avec son propre lien valable 30 jours. La signature du devis se fait hors de QuoteBuilder." },
  { q: "Free suffit-il pour tester ?", a: "Oui, Free permet de monter un funnel sans carte. Starter et Pro commencent à 39 € et 79 € par mois en paiement annuel." },
  { q: "Où voir un funnel en fonctionnement ?", a: "Sur la [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage), qui montre le parcours en étapes côté visiteur." },
];

export default function FunnelDevisDemenagementEntreprisePage() {
  const body = loadPostBody("funnel-devis-demenagement-entreprise");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis déménagement d'entreprise : sites, volume, étages, objets sensibles, date, une demande chiffrable avant la visite technique",
    url: `${SITE_URL}/secteurs/funnel-devis-demenagement-entreprise`,
    description: "Landing SEO déménageurs d'entreprise (bureaux, ateliers, archives, informatique) : questions avant la visite technique, NAF 49.42Z, registre des transporteurs (article L3211-1 du code des transports), absence de template déménagement, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée.",
    about: "Déménagement d'entreprise",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Déménagement"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis déménagement d'entreprise : sites, volume, étages, objets sensibles, date, une demande chiffrable avant la visite technique"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO déménageurs d'entreprise (bureaux, ateliers, archives, informatique) : questions avant la visite technique, NAF 49.42Z, registre des transporteurs (article L3211-1 du code des transports), absence de template déménagement, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/rupture-brutale-relations-commerciales-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-preavis-rupture-brutale", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez locaux, trajet, nombre de postes, étages, objets sensibles et période dans un ordre fixe. QuoteBuilder n'a pas de template déménagement : partez d'Aménagement industriel. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
