import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis agencement de bureau : postes, cloisons, fit-out",
  description:
    "Landing SEO agencement bureau / fit-out : funnel de devis (postes, cloisonnement, délais chantier, plans). Brief chiffrable, score, relances et FAQ pour agenceurs et mobiliers pro.",
  path: "/secteurs/funnel-devis-agencement-bureau",
});

const FAQ = [
  {
    q: "Le funnel remplace-t-il la visite plateau ?",
    a: "Non. Il prépare ou filtre la visite. Certains pré-devis partent sur plan + photos ; les cas sensibles restent en RDV.",
  },
  {
    q: "Peut-on gérer mobilier seul et pack fit-out dans le même parcours ?",
    a: "Oui, avec une branche « périmètre » dès le début. Les questions cloison / phasage n’apparaissent que si besoin.",
  },
  {
    q: "Comment traiter les appels d’offres formalisés ?",
    a: "Parcours ou branche « AO » : délais, pièces, critères, contacts. Ne forcez pas le même flux qu’un devis express PME.",
  },
  {
    q: "Et les normes (accessibilité, incendie) ?",
    a: "Ajoutez des questions de bascule et une disclaimer. Le funnel oriente ; il ne remplace pas le BET / architecte.",
  },
  {
    q: "Peut-on embarquer le parcours sur un site vitrine ?",
    a: "Oui, via widget / JS. Voir le guide d’installation du widget devis.",
  },
  {
    q: "Faut-il un configurateur 3D pour qualifier ?",
    a: "Non. Utile plus tard. Au stade demande, un brief structuré + plan bat un configurateur vide de contraintes chantier.",
  },
  {
    q: "Comment scorer un projet « urgent » sans plan ?",
    a: "Urgence + brief vide = risque. Traitez vite le contact, mais limitez le chiffrage lourd tant que le plan ou la visite n’est pas calée.",
  },
  {
    q: "Autre secteur proche ?",
    a: "Menuiserie sur mesure pour cloisons / agencement bois, rayonnage pour archives et back-office.",
  },
];

export default function AgencementBureauLandingPage() {
  const body = loadPostBody("funnel-devis-agencement-bureau");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis agencement de bureau : postes, cloisons, fit-out",
    url: `${SITE_URL}/secteurs/funnel-devis-agencement-bureau`,
    about: "Agencement de bureau, fit-out, mobilier professionnel, cloisonnement, devis tertiaire",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Agencement de bureau
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis agencement de bureau : postes, cloisons, fit-out
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Postes, cloisonnement, délais chantier, plans. Un brief chiffrable, un score, un owner,
            puis un suivi qui tient le planning de déménagement.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
            >
              Créer ce funnel
            </Link>
            <Link
              href="/secteurs"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mk-ink ring-1 ring-mk-border"
            >
              Tous les secteurs
            </Link>
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Steps postes, cloisons, planning, plans." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Gammes mobilier, finitions + Si/Alors." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, SLA chantier, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, visite, relances." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl bg-white p-4 ring-1 ring-mk-border hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)]"
              >
                <p className="font-semibold">{item.t}</p>
                <p className="mt-1 text-sm text-mk-muted">{item.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Essayer le template agencement"
        text="Un parcours postes, cloisons, planning. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
