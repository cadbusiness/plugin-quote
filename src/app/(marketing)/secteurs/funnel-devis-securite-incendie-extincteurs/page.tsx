import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis sécurité incendie et extincteurs : surface, niveaux, parc existant, dernière vérification et risques particuliers, une demande chiffrable avant la visite",
  description: "Landing SEO pour les entreprises de sécurité incendie (extincteurs, vérification, formation, plans et signalétique) : les questions à poser avant de chiffrer (type de site, surface, niveaux, effectif, parc existant, date de la dernière vérification, ERP, risques particuliers), les règles qui comptent (Code du travail R4227-28 à R4227-39, règlement ERP MS 38 et MS 73, norme NF S 61-919 et règle APSAD R4 décrites par l'INRS et le CNPP), et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-securite-incendie-extincteurs",
});

export const FAQ = [
  { q: "Existe-t-il un template sécurité incendie dans QuoteBuilder ?", a: "Non. Il n'y a pas de template sécurité incendie ou extincteurs. On part de « Aménagement industriel », dans la famille « Industrie & fabrication », on renomme les choix du type de site et des contraintes, et on ajoute ses propres questions : besoin, surface, niveaux, effectif, parc existant, dernière vérification, âge des appareils, échéance." },
  { q: "Combien d'extincteurs faut-il au minimum dans une entreprise ?", a: "Le Code du travail (article R4227-29) demande au moins un extincteur portatif à eau pulvérisée d'au moins 6 litres pour 200 m² de plancher, et au moins un appareil par niveau. Les locaux à risques particuliers, notamment électriques, doivent avoir des appareils en nombre et de type adaptés. C'est un minimum, pas une étude du site." },
  { q: "À quelle fréquence faut-il vérifier les extincteurs ?", a: "Dans un établissement recevant du public, l'article MS 38 du règlement de sécurité prévoit une vérification annuelle et une révision tous les dix ans. Dans les lieux de travail, l'article R4227-39 du Code du travail prévoit des essais et visites périodiques. La norme NF S 61-919, décrite par l'INRS, prévoit une maintenance annuelle par une personne compétente." },
  { q: "La certification APSAD est-elle obligatoire ?", a: "Non, pas au titre de la loi. La règle APSAD R4 est un référentiel du CNPP, et la certification I4 NF285 est une démarche volontaire. Seules les entreprises certifiées peuvent délivrer les documents N4 et Q4. Certains contrats d'assurance y font référence : le client doit lire le sien. Une question du funnel peut le lui demander." },
  { q: "Faut-il forcément passer par un prestataire pour la maintenance ?", a: "L'INRS indique qu'il n'est pas obligatoire de faire appel à une entreprise extérieure, à condition que la personne qui fait la maintenance soit compétente. En pratique, la plupart des entreprises confient cette maintenance à un prestataire, qui apporte aussi les pièces et les appareils de remplacement." },
  { q: "QuoteBuilder peut-il calculer le nombre d'extincteurs à partir de la surface ?", a: "Non. Il n'y a pas de calcul automatique. Un produit a un prix fixe, une fourchette ou « Sur devis », et le montant d'une ligne est le prix unitaire multiplié par la quantité. Le client peut saisir le nombre d'appareils en quantité, et vous faites le calcul réglementaire au moment du devis." },
  { q: "Peut-on proposer un contrat de maintenance annuel dans le funnel ?", a: "Vous pouvez créer un produit « Vérification annuelle, par appareil » et écrire dans sa description qu'il s'agit d'un prix par an. QuoteBuilder n'a pas de prix récurrent, de durée de contrat ni de reconduction. Le contrat lui-même, avec sa durée et son préavis, se rédige et se signe dans vos outils habituels." },
  { q: "Le client peut-il envoyer des photos de ses extincteurs ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Une photo de l'étiquette donne l'âge et la date de la dernière vérification. Il peut aussi compléter sa demande plus tard depuis son espace prospect." },
  { q: "Pourquoi toutes les demandes sont-elles Cold ?", a: "Parce que la formule du score ne lit, sur ce template, que la question « Contraintes », qui vaut au plus 5 points, et que les questions que vous ajoutez ne sont pas lues. Le maximum est 35 points. C'est la formule, fixe, pas un jugement sur la demande. Triez sur le besoin, l'échéance et la dernière vérification." },
  { q: "QuoteBuilder tient-il le registre de sécurité ou les comptes rendus de vérification ?", a: "Non. QuoteBuilder reçoit et suit les demandes de devis. Le registre de sécurité, les comptes rendus de vérification, les étiquettes, le devis final, le contrat, la facture et le suivi de paiement se font dans vos outils habituels. Le PDF d'une demande porte la mention « Document indicatif, non contractuel. »." },
];

export default function FunnelDevisSecuriteIncendieExtincteursPage() {
  const body = loadPostBody("funnel-devis-securite-incendie-extincteurs");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis sécurité incendie et extincteurs : surface, niveaux, parc existant, dernière vérification et risques particuliers, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-securite-incendie-extincteurs`,
    description: "Landing SEO pour les entreprises de sécurité incendie (extincteurs, vérification, formation, plans et signalétique) : les questions à poser avant de chiffrer (type de site, surface, niveaux, effectif, parc existant, date de la dernière vérification, ERP, risques particuliers), les règles qui comptent (Code du travail R4227-28 à R4227-39, règlement ERP MS 38 et MS 73, norme NF S 61-919 et règle APSAD R4 décrites par l'INRS et le CNPP), et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée.",
    about: "Sécurité incendie et extincteurs",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Sécurité incendie"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis sécurité incendie et extincteurs : surface, niveaux, parc existant, dernière vérification et risques particuliers, une demande chiffrable avant la visite"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO pour les entreprises de sécurité incendie (extincteurs, vérification, formation, plans et signalétique) : les questions à poser avant de chiffrer (type de site, surface, niveaux, effectif, parc existant, date de la dernière vérification, ERP, risques particuliers), les règles qui comptent (Code du travail R4227-28 à R4227-39, règlement ERP MS 38 et MS 73, norme NF S 61-919 et règle APSAD R4 décrites par l'INRS et le CNPP), et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/travaux-supplementaires-avenant-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-preavis-reconduction-tacite", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/reconduction-tacite-preavis-resiliation-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez type de site, surface, niveaux, parc existant et date de la dernière vérification dans un ordre fixe. Il n’y a pas de template sécurité incendie. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
