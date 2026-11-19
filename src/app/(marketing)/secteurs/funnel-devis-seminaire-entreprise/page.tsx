import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis séminaire d'entreprise : participants, dates, format, hébergement et budget, une demande complète avant le premier appel",
  description: "Landing SEO pour les agences et organisateurs de séminaires d'entreprise, les domaines et hôtels qui vendent des séminaires clés en main : les questions à poser avant de chiffrer (nombre de participants, dates et souplesse, format journée ou résidentiel, salles, hébergement, restauration, activités, transport, budget, décideur), la capacité du lieu, l'option et l'annulation, la clause de règlement des litiges, et comment monter ce funnel dans QuoteBuilder à partir du template Chapiteaux & agence. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-seminaire-entreprise",
});

export const FAQ = [
  { q: "Existe-t-il un template séminaire dans QuoteBuilder ?", a: "Non. Le plus proche est « Chapiteaux & agence », dans la famille Location & événementiel, qui propose déjà un choix « Séminaire / soirée ». Il crée un funnel de type Formulaire nommé « Funnel événementiel », que vous adaptez." },
  { q: "Le template demande-t-il le nombre de participants ?", a: "Non, malgré le sous-titre « Jauge, lieu et durée ». Ajoutez une question « Nombre de participants » de type nombre, obligatoire, sur la première étape." },
  { q: "Peut-on masquer la question hébergement pour une journée d'étude ?", a: "Non. Il n'y a pas de branchement conditionnel : toutes les questions s'affichent pour tous. Ajoutez un choix « Pas d'hébergement » et laissez la question facultative, ou créez un funnel séparé pour les journées d'étude." },
  { q: "Le client peut-il envoyer son programme ou son cahier des charges ?", a: "Oui, en PDF, ou en image JPEG, PNG ou WebP, jusqu'à 10 Mo, dans la zone de dépôt de l'étape Personnalisation, ou plus tard depuis son espace prospect. Un fichier Word ou un tableur ne passe pas : demandez un PDF." },
  { q: "Pourquoi toutes mes demandes de séminaire sont-elles Cold ?", a: "Parce que la formule du score, fixe, ne lit aucune des questions de ce funnel : ni le nombre de participants, ni les dates, ni le budget. Chaque dossier part de 30 points. Seul un texte de besoin peut en ajouter. Triez sur le contenu de la demande." },
  { q: "QuoteBuilder vérifie-t-il la disponibilité des lieux ?", a: "Non. Il n'a ni calendrier, ni réservation, ni gestion d'options. Il reçoit la demande et vous aide à la suivre ; la recherche de lieux et les options se font dans vos outils." },
  { q: "Peut-on proposer un « pack séminaire » tout compris ?", a: "Pas sous forme de kit : QuoteBuilder n'a ni kits ni lots. Décrivez le pack comme une formule de votre catalogue, avec ses options, et proposez-le par une règle Si/Alors." },
  { q: "Plusieurs personnes peuvent-elles valider la proposition côté client ?", a: "Oui. Le contact principal peut inviter des relecteurs, avec un rôle (Directeur financier, Acheteur, Décideur, Responsable technique), chacun avec son lien valable 30 jours. Ils commentent, valident ou demandent des modifications. Ce n'est pas une signature." },
  { q: "Les prix affichés sont-ils HT ?", a: "QuoteBuilder affiche des montants en euros entiers, sans mention HT, TVA ou TTC. Précisez-le dans votre devis ferme." },
  { q: "Faut-il un plan payant pour ce funnel ?", a: "Non pour commencer : selon la page des tarifs consultée le 5 novembre 2026, l'offre Free comprend un funnel et 10 soumissions au total, sans carte. Pour plusieurs funnels (séminaires et journées d'étude, par exemple), Starter en comprend trois à 39 € par mois, Pro un nombre illimité à 79 € par mois." },
];

export default function FunnelDevisSeminaireEntreprisePage() {
  const body = loadPostBody("funnel-devis-seminaire-entreprise");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis séminaire d'entreprise : participants, dates, format, hébergement et budget, une demande complète avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-seminaire-entreprise`,
    description: "Landing SEO pour les agences et organisateurs de séminaires d'entreprise, les domaines et hôtels qui vendent des séminaires clés en main : les questions à poser avant de chiffrer (nombre de participants, dates et souplesse, format journée ou résidentiel, salles, hébergement, restauration, activités, transport, budget, décideur), la capacité du lieu, l'option et l'annulation, la clause de règlement des litiges, et comment monter ce funnel dans QuoteBuilder à partir du template Chapiteaux & agence. Sans template inventé ni fonction inventée.",
    about: "Séminaire d'entreprise",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Séminaire"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis séminaire d'entreprise : participants, dates, format, hébergement et budget, une demande complète avant le premier appel"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO pour les agences et organisateurs de séminaires d'entreprise, les domaines et hôtels qui vendent des séminaires clés en main : les questions à poser avant de chiffrer (nombre de participants, dates et souplesse, format journée ou résidentiel, salles, hébergement, restauration, activités, transport, budget, décideur), la capacité du lieu, l'option et l'annulation, la clause de règlement des litiges, et comment monter ce funnel dans QuoteBuilder à partir du template Chapiteaux & agence. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/clause-attributive-juridiction-mediation-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-clause-reglement-litiges", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez format, participants, dates, hébergement, restauration et décideur dans un ordre fixe. QuoteBuilder n'a pas de template séminaire : partez de Chapiteaux & agence. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
