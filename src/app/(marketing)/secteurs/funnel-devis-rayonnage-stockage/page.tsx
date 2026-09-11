import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis rayonnage & stockage",
  description:
    "Parcours de devis pour fabricants et revendeurs de rayonnage : charge, travées, surface, dossier scoré, autopilote de relances. Template QuoteBuilder.",
  path: "/secteurs/funnel-devis-rayonnage-stockage",
});

const FAQ = [
  {
    q: "Faut-il un configurateur 3D ?",
    a: "Non pour commencer. Un brief (usage, géométrie, charge, délai, budget) suffit à chiffrer. Le 3D vient après, sur les dossiers chauds.",
  },
  {
    q: "On vend aussi des pièces et de l’occasion.",
    a: "Séparez les CTA. Panier boutique pour le standard. Funnel pour le projet. Deux catalogues ou deux activations dans le même référentiel syncé.",
  },
  {
    q: "Plusieurs dépôts / marques ?",
    a: "Un funnel par enseigne ou par dépôt si les gammes divergent. Agency gère le multi-compte. Un wizard unique « fourre-tout » noie le prospect.",
  },
  {
    q: "Combien de temps pour un premier parcours ?",
    a: "Une famille, un template, dix références actives, le widget sur /devis. Moins d’une journée si le tarif est déjà dans Woo ou en CSV.",
  },
  {
    q: "Et les normes / notes de calcul ?",
    a: "Le funnel signale la contrainte. La note reste du ressort du bureau d’études. QuoteBuilder n’est pas un logiciel de dimensionnement.",
  },
];

export default function RayonnageLandingPage() {
  const body = loadPostBody("funnel-devis-rayonnage-stockage");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis rayonnage & stockage",
    url: `${SITE_URL}/secteurs/funnel-devis-rayonnage-stockage`,
    about: "Rayonnage industriel, stockage, cantilever, picking, entrepôt",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">
            Secteur · Rayonnage & stockage
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Le prospect compose les travées. Vous recevez un brief.
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-[#1A1510]/70 sm:text-lg">
            Charge, surface, usage, délai. Puis score, assignation, relances. Pas un « bonjour »
            dans la boîte info@.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-[#E85D04] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Créer ce funnel
            </Link>
            <Link
              href="/secteurs"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1510] ring-1 ring-black/8"
            >
              Tous les secteurs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-6">
        <Markdown source={body} />
      </section>

      <section className="border-y border-[#1A1510]/8 bg-white/55 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">La chaîne, sur ce métier</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Steps usage, charge, plan, produits." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Gammes actives + Si/Alors." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, fiche, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "T+0 jusqu’à J+30." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl bg-white p-4 ring-1 ring-black/6 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)]"
              >
                <p className="font-semibold">{item.t}</p>
                <p className="mt-1 text-sm text-[#1A1510]/55">{item.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Équipez le parcours, pas seulement l’entrepôt."
        text="Template rayonnage. Free sans carte."
      />
    </>
  );
}
