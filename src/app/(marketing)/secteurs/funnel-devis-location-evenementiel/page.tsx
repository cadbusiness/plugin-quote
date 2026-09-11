import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis location événementielle : matériel, dates, logistique",
  description:
    "Landing SEO location événementielle : funnel de devis (sono, lumière, structure, mobilier). Dates, volumes, livraison, brief chiffrable, score et relances pour loueurs B2B.",
  path: "/secteurs/funnel-devis-location-evenementiel",
});

const FAQ = [
  {
    q: "Faut-il afficher les prix dans le funnel ?",
    a: "Afficher des indicatifs ou des packs aide à filtrer. Les prix fermes dépendent souvent de la logistique et de la dispo. Soyez honnêtes dans le récap : estimation avant validation stock / accès site.",
  },
  {
    q: "Et la dispo temps réel ?",
    a: "Idéal à moyen terme. Au démarrage, un brief riche + rappel rapide bat un configurateur déconnecté du planning. Branchez la sync quand le process commercial est stable.",
  },
  {
    q: "B2B seulement ?",
    a: "Beaucoup de loueurs font B2B (agences, entreprises) et B2C (mariage). Un champ « type de client » + packs dédiés évite un parcours unique trop corporate ou trop wedding.",
  },
  {
    q: "Combien d’étapes max ?",
    a: "Souvent 5 à 7. Au-delà, découpez : funnel court, puis espace prospect pour pièces jointes (plan de salle, rider).",
  },
  {
    q: "QuoteBuilder remplace-t-il mon logiciel de location ?",
    a: "Non. QuoteBuilder couvre parcours de demande, dossier, score, autopilote de suivi. Votre outil de stock / planning reste la référence opérationnelle une fois l’affaire engagée.",
  },
];

export default function LocationEvenementielLandingPage() {
  const body = loadPostBody("funnel-devis-location-evenementiel");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis location événementielle : matériel, dates, logistique",
    url: `${SITE_URL}/secteurs/funnel-devis-location-evenementiel`,
    about: "Location événementielle, sono, lumière, structure, mobilier, devis matériel événement",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Location événementielle
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis location événementielle : matériel, dates, logistique
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Dates, volumes, livraison, packs ou à la carte. Un brief chiffrable, un score, un owner,
            puis un suivi qui tient la pression calendrier.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Steps événement, dates, catégories, logistique." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Packs + à la carte, Si/Alors." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, SLA dates, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, option / hold, relances." },
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
        title="Essayer le template événementiel"
        text="Un parcours dates, matériel, logistique. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
