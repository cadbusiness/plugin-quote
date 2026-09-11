import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis menuiserie sur mesure : fenêtres, portes, agencement",
  description:
    "Landing SEO menuiserie : funnel de devis sur mesure (fenêtres, portes, agencement). Cotes, matériaux, pose, brief chiffrable, score et relances pour ateliers et poseurs B2B/B2C projet.",
  path: "/secteurs/funnel-devis-menuiserie-sur-mesure",
});

const FAQ = [
  {
    q: "Le funnel remplace-t-il la visite technique ?",
    a: "Non. Il prépare ou filtre la visite. Certains pré-devis peuvent partir sans déplacement si le risque est faible ; les cas sensibles restent en RDV.",
  },
  {
    q: "Peut-on l’utiliser pour l’agencement commercial (magasins) ?",
    a: "Oui. Les champs changent (linéaire, éclairage, contraintes ERP magasin), la logique de brief structuré reste.",
  },
  {
    q: "Comment gérer les demandes architectes ?",
    a: "Parcours dédié ou branche « professionnel » avec champs DCE, lot, délai chantier, et partage multi-contacts.",
  },
  {
    q: "Et les aides / primes rénovation énergétique ?",
    a: "Ajoutez une question informative et une disclaimer. Le funnel oriente ; il ne remplace pas le conseil réglementaire.",
  },
  {
    q: "Peut-on embarquer le parcours sur un site vitrine WordPress ?",
    a: "Oui, via widget / JS. Voir le guide d’installation du widget devis.",
  },
  {
    q: "Autre secteur proche ?",
    a: "Pour le stockage industriel configurable : funnel rayonnage et stockage.",
  },
];

export default function MenuiserieLandingPage() {
  const body = loadPostBody("funnel-devis-menuiserie-sur-mesure");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis menuiserie sur mesure : fenêtres, portes, agencement",
    url: `${SITE_URL}/secteurs/funnel-devis-menuiserie-sur-mesure`,
    about: "Menuiserie sur mesure, fenêtres, portes, agencement bois",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Menuiserie sur mesure
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis menuiserie sur mesure : fenêtres, portes, agencement
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Un funnel transforme une demande vague en brief chiffrable : typologie, dimensions, matériaux,
            options, pose, délai, budget indicatif, puis score, assignation et relances.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Steps typologie, cotes, matériau, pose." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Profils, vitrages, finitions + Si/Alors." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, fiche, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirmation, RDV, relances." },
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
        title="Essayer le template menuiserie"
        text="Un parcours cotes, matériaux, pose. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
