import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis dératisation et désinsectisation : nuisible, type de site, surface, signes constatés et échéance, une demande chiffrable avant le premier passage",
  description: "Landing SEO pour les entreprises de dératisation, désinsectisation et désinfection (3D) : les questions à poser avant de chiffrer (nuisible, type de site, établissement alimentaire, surface, signes constatés, traitements déjà faits, contrôle prévu, horaires), les règles qui comptent (règlement (CE) n° 852/2004 annexe II chapitre IX, règlement (UE) n° 528/2012 article 17, arrêté du 9 octobre 2013 et Certibiocide nuisibles, article L441-1 du code de commerce), et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-deratisation-desinsectisation-3d",
});

export const FAQ = [
  { q: "Existe-t-il un template dératisation dans QuoteBuilder ?", a: "Non. Il n'y a pas de template dératisation, désinsectisation ou désinfection. On part de « Aménagement industriel », dans la famille « Industrie & fabrication », on renomme les choix du type de site et des contraintes, et on ajoute ses propres questions : nuisible, attente, surface, niveaux, signes constatés, ancienneté, traitements déjà faits, échéance, horaires." },
  { q: "Un restaurant est-il obligé d'avoir un contrat de dératisation ?", a: "Le règlement (CE) n° 852/2004, annexe II, chapitre IX, point 4, impose aux exploitants du secteur alimentaire de mettre au point des méthodes adéquates pour lutter contre les organismes nuisibles. Il n'impose pas de faire appel à un prestataire. Beaucoup d'exploitants le font, parce que l'entreprise spécialisée apporte la méthode, le suivi et les documents attendus lors des contrôles et des audits." },
  { q: "Les techniciens doivent-ils avoir un Certibiocide ?", a: "Oui, pour utiliser à titre professionnel les rodenticides, insecticides et acaricides concernés. Depuis le 1er janvier 2024, il existe un certificat spécifique pour la lutte contre les nuisibles (TP14, TP18 et TP20), obtenu après 21 heures de formation et valable cinq ans, selon la notice explicative du ministère chargé de l'écologie." },
  { q: "Le client qui commande l'intervention a-t-il besoin d'un Certibiocide ?", a: "Non. La notice et la foire aux questions du site Certibiocide précisent que le certificat n'est pas exigé des donneurs d'ordres qui commandent une intervention. C'est l'applicateur qui doit le détenir." },
  { q: "Quel prix afficher pour une dératisation dans le funnel ?", a: "Une fourchette par passage, ou par poste pour un contrat, en écrivant dans la description le nombre de passages compris et le prix d'un passage supplémentaire. Quand le prix ne peut pas être fixé d'avance, l'article L441-1 du code de commerce prévoit que le prestataire communique, à l'acheteur professionnel qui le demande, la méthode de calcul ou un devis suffisamment détaillé." },
  { q: "Peut-on proposer un contrat de suivi annuel dans le funnel ?", a: "Vous pouvez créer un produit « Contrat de suivi rongeurs, par passage » et écrire dans sa description le nombre de passages par an. QuoteBuilder n'a pas de prix récurrent, de durée de contrat ni de reconduction. Le contrat lui-même, avec sa durée et son préavis, se rédige et se signe dans vos outils habituels." },
  { q: "Le client peut-il envoyer des photos des traces ou du nid ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Il peut aussi compléter sa demande plus tard depuis son espace prospect, et l'Autopilote peut lui demander une photo au bout de 2 jours." },
  { q: "Peut-on traiter à part les urgences guêpes et frelons ?", a: "Pas dans le même funnel avec un autre chemin : il n'y a pas de branchement conditionnel. Vous pouvez faire remonter l'urgence avec la question « Échéance » et la trier dans le dossier, ou créer un deuxième funnel dédié aux nids, si votre plan le permet. La duplication n'existe pas : le deuxième funnel se crée à la main." },
  { q: "Pourquoi toutes les demandes sont-elles Cold ?", a: "Parce que la formule du score ne lit, sur ce template, que la question « Contraintes », qui vaut au plus 5 points, et que les questions que vous ajoutez ne sont pas lues. Le maximum est 35 points. C'est la formule, fixe, pas un jugement sur la demande. Triez sur le nuisible, l'échéance et les signes constatés." },
  { q: "QuoteBuilder tient-il le plan de pose ou les fiches de passage ?", a: "Non. QuoteBuilder reçoit et suit les demandes de devis. Le plan de pose, les fiches de passage, le dossier de suivi pour les audits, le devis final, le contrat, la facture et le suivi de paiement se font dans vos outils habituels. Le PDF d'une demande porte la mention « Document indicatif, non contractuel. »." },
];

export default function FunnelDevisDeratisationDesinsectisation3dPage() {
  const body = loadPostBody("funnel-devis-deratisation-desinsectisation-3d");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis dératisation et désinsectisation : nuisible, type de site, surface, signes constatés et échéance, une demande chiffrable avant le premier passage",
    url: `${SITE_URL}/secteurs/funnel-devis-deratisation-desinsectisation-3d`,
    description: "Landing SEO pour les entreprises de dératisation, désinsectisation et désinfection (3D) : les questions à poser avant de chiffrer (nuisible, type de site, établissement alimentaire, surface, signes constatés, traitements déjà faits, contrôle prévu, horaires), les règles qui comptent (règlement (CE) n° 852/2004 annexe II chapitre IX, règlement (UE) n° 528/2012 article 17, arrêté du 9 octobre 2013 et Certibiocide nuisibles, article L441-1 du code de commerce), et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée.",
    about: "Dératisation et désinsectisation",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Dératisation 3D"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis dératisation et désinsectisation : nuisible, type de site, surface, signes constatés et échéance, une demande chiffrable avant le premier passage"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO pour les entreprises de dératisation, désinsectisation et désinfection (3D) : les questions à poser avant de chiffrer (nuisible, type de site, établissement alimentaire, surface, signes constatés, traitements déjà faits, contrôle prévu, horaires), les règles qui comptent (règlement (CE) n° 852/2004 annexe II chapitre IX, règlement (UE) n° 528/2012 article 17, arrêté du 9 octobre 2013 et Certibiocide nuisibles, article L441-1 du code de commerce), et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/cgv-conditions-achat-client-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/blog/reconduction-tacite-preavis-resiliation-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-preavis-reconduction-tacite", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez nuisible, type de site, surface, signes constatés et échéance dans un ordre fixe. Il n’y a pas de template dératisation. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
