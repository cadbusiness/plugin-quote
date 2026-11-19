import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis alarme et vidéosurveillance pour entreprise : locaux, zones filmées, télésurveillance et autorisations, une demande chiffrable avant la visite",
  description: "Landing SEO installateurs d'alarme, de vidéosurveillance et de télésurveillance pour les entreprises : les questions à poser avant la visite (site, surface, accès, besoin, zones filmées, télésurveillance, existant, effectif), l'autorisation préfectorale pour les zones ouvertes au public, les règles CNIL et Code du travail, le CNAPS pour la télésurveillance, la rétractation des clients de cinq salariés ou moins, et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-alarme-videosurveillance-entreprise",
});

export const FAQ = [
  { q: "Existe-t-il un template alarme ou vidéosurveillance dans QuoteBuilder ?", a: "Non. Il n'y a pas de template sécurité. On part du template « Aménagement industriel » (famille « Industrie & fabrication »), dont la première étape décrit le site et ses contraintes, et on renomme ses choix." },
  { q: "Quelles questions poser avant de chiffrer une alarme pour une entreprise ?", a: "Le type de site, la surface, le nombre d'accès, le besoin (intrusion, vidéo, contrôle d'accès), la télésurveillance, l'existant, l'échéance et l'effectif. Avec un plan, la plupart des petits sites se chiffrent en fourchette avant la visite." },
  { q: "Faut-il une autorisation pour installer des caméras dans un commerce ?", a: "Si les caméras filment des lieux ouverts au public (entrée, zone de vente, caisse), le dispositif doit être autorisé par le préfet, ou le préfet de police à Paris. Pour des lieux non ouverts au public, pas de formalité CNIL, mais une inscription au registre des traitements." },
  { q: "Combien de temps peut-on garder les images ?", a: "La durée dépend de l'objectif. La CNIL indique qu'en principe elle n'excède pas un mois, et que quelques jours suffisent souvent pour vérifier un incident." },
  { q: "Peut-on filmer les salariés ?", a: "Le système ne doit pas servir à surveiller leur travail. Ils doivent être informés avant (article L1222-4 du Code du travail), et le CSE doit être consulté dans les entreprises d'au moins cinquante salariés (article L2312-38). Pas de caméra dans les toilettes ni les vestiaires." },
  { q: "La télésurveillance demande-t-elle un agrément ?", a: "La surveillance par systèmes électroniques de sécurité est une activité de sécurité privée (article L611-1 du Code de la sécurité intérieure). L'entreprise qui l'exerce doit obtenir une autorisation du CNAPS (article L612-9) et ses intervenants une carte professionnelle (article L612-20)." },
  { q: "Un client de trois salariés peut-il se rétracter après avoir signé ?", a: "Oui, si le contrat a été signé hors de vos locaux et que son objet n'entre pas dans le champ de son activité principale (article L221-3 du Code de la consommation). Il a alors quatorze jours, et aucun paiement ne peut être reçu pendant sept jours." },
  { q: "Pourquoi toutes mes demandes sortent Cold ?", a: "La formule du score ne lit, sur ce template, que la question « Contraintes », qui rapporte 5 points. Le maximum est 35, sous le seuil warm de 45. Les questions ajoutées ont des clés automatiques que la formule ne lit pas." },
  { q: "Le client peut-il envoyer un plan ou des photos ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Il peut aussi ajouter un fichier plus tard depuis son espace prospect, rubrique « Compléter la demande »." },
  { q: "QuoteBuilder gère-t-il le contrat de télésurveillance ?", a: "Non. QuoteBuilder n'a ni prix mensuel, ni durée de contrat, ni signature électronique, ni facturation. Le PDF est un récapitulatif marqué « Document indicatif, non contractuel. ». Le contrat se fait dans vos outils habituels." },
];

export default function FunnelDevisAlarmeVideosurveillanceEntreprisePage() {
  const body = loadPostBody("funnel-devis-alarme-videosurveillance-entreprise");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis alarme et vidéosurveillance pour entreprise : locaux, zones filmées, télésurveillance et autorisations, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-alarme-videosurveillance-entreprise`,
    description: "Landing SEO installateurs d'alarme, de vidéosurveillance et de télésurveillance pour les entreprises : les questions à poser avant la visite (site, surface, accès, besoin, zones filmées, télésurveillance, existant, effectif), l'autorisation préfectorale pour les zones ouvertes au public, les règles CNIL et Code du travail, le CNAPS pour la télésurveillance, la rétractation des clients de cinq salariés ou moins, et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée.",
    about: "Alarme et vidéosurveillance",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Alarme et vidéosurveillance"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis alarme et vidéosurveillance pour entreprise : locaux, zones filmées, télésurveillance et autorisations, une demande chiffrable avant la visite"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO installateurs d'alarme, de vidéosurveillance et de télésurveillance pour les entreprises : les questions à poser avant la visite (site, surface, accès, besoin, zones filmées, télésurveillance, existant, effectif), l'autorisation préfectorale pour les zones ouvertes au public, les règles CNIL et Code du travail, le CNAPS pour la télésurveillance, la rétractation des clients de cinq salariés ou moins, et comment monter ce funnel dans QuoteBuilder à partir du template Aménagement industriel. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/retractation-hors-etablissement-tpe-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-delai-retractation-hors-etablissement", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez type de site, surface, zones à filmer, télésurveillance et installation existante dans un ordre fixe. Il n’y a pas de template alarme ou sécurité. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
