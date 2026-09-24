import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis pompe à chaleur et chauffage : brief, aides, signature",
  description:
    "Landing SEO installateurs et bureaux d’études chauffage / PAC : funnel de devis (puissance, surface, énergie, isolation, accès, aides, photos, délai pose), options et signature.",
  path: "/secteurs/funnel-devis-pompe-chaleur-chauffage",
});

const FAQ = [
  {
    q: "Peut-on chiffrer une PAC sans visite ?",
    a: "Souvent un indicatif oui, si surface, énergie, photos et accès sont corrects. Un devis ferme dépend de votre politique risque (électrique, liaisons, voisinage, émetteurs).",
  },
  {
    q: "Faut-il afficher un prix au m² sur le site ?",
    a: "Dangereux sans brief. Préférez un parcours qui aboutit à une estimation personnalisée, ou une fourchette très large clairement non contractuelle.",
  },
  {
    q: "Comment gérer air-eau vs air-air dans le même funnel ?",
    a: "Branche précoce « type de système », puis questions spécifiques. Ne mélangez pas les options des deux familles sur le même écran.",
  },
  {
    q: "Comment parler des aides sans se tromper ?",
    a: "Mention générique + collecte d’infos + traitement humain. Pas de barème inventé dans le wizard.",
  },
  {
    q: "Les syndics et les particuliers ont-ils le même parcours ?",
    a: "Même logique, champs différents (lots, contacts, planning). Deux funnels ou une branche « type de client » dès le début.",
  },
  {
    q: "Comment éviter l’abandon à l’étape photos ?",
    a: "Rendez l’upload optionnel mais valorisé (« avec photos, réponse sous 48 h »). Proposez « je n’ai pas de photo » pour ne pas bloquer.",
  },
  {
    q: "Quel lien avec le catalogue produits ?",
    a: "Les gammes et forfaits pose du funnel doivent mapper vos kits et articles. Sinon double saisie.",
  },
  {
    q: "Combien d’étapes idéales ?",
    a: "Souvent 7 à 10. Au-delà, découpez (cœur puis technique) ou repoussez le détail après le score Hot.",
  },
  {
    q: "Comment démarrer sans refondre tout le site ?",
    a: "Un widget funnel sur la page « Devis PAC » + catalogue minimal (3 gammes, forfaits pose, 6 options) suffit pour un pilote.",
  },
];

export default function PompeChaleurChauffageLandingPage() {
  const body = loadPostBody("funnel-devis-pompe-chaleur-chauffage");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis pompe à chaleur et chauffage : brief, aides, signature",
    url: `${SITE_URL}/secteurs/funnel-devis-pompe-chaleur-chauffage`,
    about: "Pompe à chaleur, chauffage, surface, énergie, isolation, accès, aides, pose",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Pompe à chaleur et chauffage
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis pompe à chaleur et chauffage : brief, aides, signature
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Puissance indicative, surface, énergie actuelle, isolation, accès technique, aides, photos,
            délai de pose. Un brief chiffrable, un score, puis une signature qui ne traîne pas.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Branches air-eau, air-air, accès, photos." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Gammes PAC, forfaits pose, options." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, délai pose, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, relances, validité." },
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
        title="Essayer le template pompe à chaleur / chauffage"
        text="Un parcours surface, énergie, accès, photos, aides. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
