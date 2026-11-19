import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis pour transporteur routier de marchandises : enlèvement, livraison, poids, palettes, quai ou hayon et délais d'attente, une demande de cotation chiffrable du premier coup",
  description: "Landing SEO transporteurs routiers de marchandises et affréteurs : les informations à demander avant de coter un transport (adresses, dates, nature et poids, palettes et dimensions, conditions de chargement, marchandises dangereuses ou sous température, valeur, fréquence), les règles du métier qui pèsent sur la cotation (prix couvrant les charges, indexation gazole, temps d'attente et prestations annexes, contrat type général, paiement à 30 jours, action directe), et comment monter ce funnel dans QuoteBuilder à partir du Questionnaire générique. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-transport-routier-marchandises",
});

export const FAQ = [
  { q: "Existe-t-il un template transport dans QuoteBuilder ?", a: "Non. Il n'y a pas de template transport ou logistique. On part du « Questionnaire générique », dans la famille « Sur mesure », et on ajoute ses propres questions : type d'envoi, lieux, date, nombre de palettes, poids, conditions de chargement et de livraison, marchandise particulière, fréquence." },
  { q: "Quelles informations demander avant de coter un transport ?", a: "Les lieux d'enlèvement et de livraison, les dates et horaires, la nature de la marchandise, le poids brut, le nombre de palettes ou de colis et leurs dimensions, les marchandises dangereuses ou périssables, les conditions de chargement et de livraison, et les prestations annexes. Le contrat type général en donne la liste à son article 3.1." },
  { q: "QuoteBuilder calcule-t-il le prix selon la distance ?", a: "Non. Il n'y a pas de calcul de distance, au kilomètre, au poids ou par zone. Un produit a un prix fixe, une fourchette ou « Sur devis », et le montant d'une ligne est le prix unitaire multiplié par la quantité." },
  { q: "Le prix doit-il intégrer la hausse du gazole ?", a: "Le Code des transports prévoit une révision de plein droit du prix pour tenir compte de la variation des charges de carburant entre la date du contrat et la date du transport (article L3222-1), à partir de l'indice du CNR si le contrat ne prévoit rien. La facture fait apparaître ces charges. Écrivez-le dans la description de vos produits." },
  { q: "Comment facturer le temps d'attente au chargement ?", a: "Le contrat doit mentionner l'estimation des temps de chargement et de déchargement et les modalités de calcul de la rémunération en cas de dépassement (article L3222-8 du Code des transports). Sans contrat écrit, le contrat type général fixe des durées de référence à son article 11 et prévoit un complément quand le dépassement n'est pas imputable au transporteur." },
  { q: "Quel délai de paiement pour un transporteur ?", a: "Pour le transport routier de marchandises, le délai ne peut dépasser 30 jours à compter de la date d'émission de la facture (article L441-11 du Code de commerce). Le contrat type général prévoit aussi le paiement au plus tard 30 jours après l'émission de la facture." },
  { q: "Que faire si le commissionnaire ne paie pas ?", a: "Le voiturier qui a déplacé lui-même la marchandise dispose d'une action directe en paiement contre l'expéditeur et le destinataire, garants du paiement du prix du transport (article L132-8 du Code de commerce). Toute clause contraire est réputée non écrite. Faites-vous conseiller sur votre cas." },
  { q: "Le client peut-il envoyer des photos de la marchandise ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Il peut aussi compléter sa demande plus tard depuis son espace prospect." },
  { q: "Pourquoi toutes les demandes sont-elles Cold ?", a: "Parce que la formule du score ne lit pas les questions que vous ajoutez, et que la question texte du Questionnaire générique vaut rarement l'une des valeurs qu'elle reconnaît. C'est la formule, fixe, pas un jugement sur la demande. Triez sur le type d'envoi, la fréquence et la date d'enlèvement." },
  { q: "QuoteBuilder établit-il la lettre de voiture ou l'ordre de transport ?", a: "Non. QuoteBuilder reçoit et suit les demandes de cotation. La cotation ferme, l'ordre de transport, la lettre de voiture, la facture et le suivi de paiement se font dans vos outils habituels. Le PDF d'une demande porte la mention « Document indicatif, non contractuel. »." },
];

export default function FunnelDevisTransportRoutierMarchandisesPage() {
  const body = loadPostBody("funnel-devis-transport-routier-marchandises");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis pour transporteur routier de marchandises : enlèvement, livraison, poids, palettes, quai ou hayon et délais d'attente, une demande de cotation chiffrable du premier coup",
    url: `${SITE_URL}/secteurs/funnel-devis-transport-routier-marchandises`,
    description: "Landing SEO transporteurs routiers de marchandises et affréteurs : les informations à demander avant de coter un transport (adresses, dates, nature et poids, palettes et dimensions, conditions de chargement, marchandises dangereuses ou sous température, valeur, fréquence), les règles du métier qui pèsent sur la cotation (prix couvrant les charges, indexation gazole, temps d'attente et prestations annexes, contrat type général, paiement à 30 jours, action directe), et comment monter ce funnel dans QuoteBuilder à partir du Questionnaire générique. Sans template inventé ni fonction inventée.",
    about: "Transport routier de marchandises",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Transport routier"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis pour transporteur routier de marchandises : enlèvement, livraison, poids, palettes, quai ou hayon et délais d'attente, une demande de cotation chiffrable du premier coup"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO transporteurs routiers de marchandises et affréteurs : les informations à demander avant de coter un transport (adresses, dates, nature et poids, palettes et dimensions, conditions de chargement, marchandises dangereuses ou sous température, valeur, fréquence), les règles du métier qui pèsent sur la cotation (prix couvrant les charges, indexation gazole, temps d'attente et prestations annexes, contrat type général, paiement à 30 jours, action directe), et comment monter ce funnel dans QuoteBuilder à partir du Questionnaire générique. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-remise-volume-contrat-cadre", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/frais-port-franco-incoterms-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez type d'envoi, lieux, date, poids, palettes et conditions de chargement dans un ordre fixe. Il n’y a pas de template transport. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
