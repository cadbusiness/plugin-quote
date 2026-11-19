import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis chambre froide et froid commercial : volume, température, emplacement, groupe, une demande chiffrable avant la visite",
  description: "Landing SEO frigoristes et installateurs de froid commercial (chambres froides positives et négatives, meubles frigorifiques, maintenance) : questions avant la visite, attestation de capacité pour les fluides frigorigènes (articles R543-76 et R543-99 du code de l'environnement), absence de template froid, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-chambre-froide-froid-commercial",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template chambre froide ou froid commercial ?", a: "Non. Partez du template « Aménagement industriel » (`fitout`), dont la contrainte « Normes alimentaires » correspond déjà au métier, et renommez les choix du type de site." },
  { q: "Puis-je renommer « Bureaux / vestiaires » en « Restaurant, commerce, boutique » ?", a: "Oui. Changez le libellé, gardez la valeur `office`. Les règles qui utilisent cette valeur continuent de fonctionner." },
  { q: "Pourquoi mes demandes sortent-elles toutes Cold ?", a: "Parce que la formule de score est fixe et ne lit, sur ce template, que la clé `constraints` (5 points si une vraie contrainte est cochée). Les questions ajoutées ont des clés générées que la formule ne lit pas. Le score vaut donc 30 ou 35." },
  { q: "Puis-je poser la question « Distance du groupe » seulement si le client a choisi un groupe à distance ?", a: "Non. Il n'y a pas de branchement conditionnel. Toutes les questions s'affichent pour tout le monde. Ajoutez une réponse « Non concerné »." },
  { q: "Le funnel peut-il calculer la puissance frigorifique ?", a: "Non. QuoteBuilder enregistre les réponses et propose des produits du catalogue. Il ne fait pas de calcul entre les réponses. Le bilan frigorifique reste votre travail." },
  { q: "Le prospect peut-il envoyer une photo de la plaque du groupe ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation (PDF, JPEG, PNG, WebP, 10 Mo), ou plus tard depuis son espace prospect, rubrique « Compléter la demande »." },
  { q: "Mon équipe peut-elle joindre le bilan frigorifique au dossier ?", a: "Non. Seuls les fichiers déposés par le prospect entrent dans le dossier. Votre équipe peut ajouter des notes internes en texte brut." },
  { q: "Y a-t-il une question de type date pour la date d'ouverture ?", a: "Non. L'éditeur n'a pas de type date. Utilisez une liste (« Dans le mois », « Dans les trois mois ») et demandez la date exacte dans « Votre besoin en quelques lignes »." },
  { q: "QuoteBuilder gère-t-il les contrats de maintenance et les fluides ?", a: "Non. Pas de planning d'interventions, pas de suivi des contrats, pas de registre des fluides frigorigènes, pas de signature électronique, pas de facturation. Le catalogue peut proposer un contrat de maintenance comme produit ; sa gestion se fait ailleurs." },
  { q: "Free suffit-il pour tester ?", a: "Oui, avec un funnel. Starter commence à 39 € par mois et Pro à 79 € par mois en paiement annuel. Voir la [page des tarifs](https://www.quotebuilder.co/tarifs)." },
];

export default function FunnelDevisChambreFroideFroidCommercialPage() {
  const body = loadPostBody("funnel-devis-chambre-froide-froid-commercial");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis chambre froide et froid commercial : volume, température, emplacement, groupe, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-chambre-froide-froid-commercial`,
    description: "Landing SEO frigoristes et installateurs de froid commercial (chambres froides positives et négatives, meubles frigorifiques, maintenance) : questions avant la visite, attestation de capacité pour les fluides frigorigènes (articles R543-76 et R543-99 du code de l'environnement), absence de template froid, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée.",
    about: "Chambre froide et froid commercial",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Froid commercial"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis chambre froide et froid commercial : volume, température, emplacement, groupe, une demande chiffrable avant la visite"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO frigoristes et installateurs de froid commercial (chambres froides positives et négatives, meubles frigorifiques, maintenance) : questions avant la visite, attestation de capacité pour les fluides frigorigènes (articles R543-76 et R543-99 du code de l'environnement), absence de template froid, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée."}</p>
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
      <MarketingCta title="Essayer gratuitement" text={" Posez température, dimensions, emplacement, groupe et délai dans un ordre fixe. QuoteBuilder n'a pas de template froid ni de template chambre froide : partez d'Aménagement industriel. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
