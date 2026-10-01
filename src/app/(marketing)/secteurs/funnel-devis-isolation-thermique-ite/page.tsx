import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis isolation thermique et ITE : façade, combles, brief, relances",
  description:
    "Landing SEO artisans et entreprises isolation / ITE : funnel de devis (type de surface, m², support, accès chantier, état existant, photos, délai, type client), sans barèmes d’aides inventés.",
  path: "/secteurs/funnel-devis-isolation-thermique-ite",
});

const FAQ = [
  {
    q: "Peut-on chiffrer une ITE sans visite ?",
    a: "Souvent un indicatif oui, si surface, hauteur, photos façade et accès sont corrects. Un devis ferme dépend de votre politique risque (support, points singuliers, mitoyenneté, diagnostics).",
  },
  {
    q: "Faut-il afficher un prix au m² sur le site ?",
    a: "Dangereux sans brief. Préférez un parcours qui aboutit à une estimation personnalisée, ou une fourchette très large clairement non contractuelle.",
  },
  {
    q: "Comment gérer particulier, pro et syndic dans le même funnel ?",
    a: "Branche précoce « type de client », puis champs spécifiques (SIRET, lots, contact technique, vote AG). Ne mélangez pas tout sur le même écran.",
  },
  {
    q: "Comment parler des aides sans se tromper ?",
    a: "Mention générique + collecte d’infos + traitement humain. Pas de barème inventé (MaPrimeRénov’ ou autre) dans le wizard.",
  },
  {
    q: "Combles et ITE doivent-ils être deux funnels séparés ?",
    a: "Une branche « type de travaux » dans le même funnel suffit souvent. Séparez si les équipes ou les catalogues sont vraiment distincts.",
  },
  {
    q: "Comment éviter l’abandon à l’étape photos ?",
    a: "Rendez l’upload optionnel mais valorisé (« avec photos façade / combles, réponse sous 48 h »). Proposez « je n’ai pas de photo » pour ne pas bloquer.",
  },
  {
    q: "Quel lien avec le catalogue produits ?",
    a: "Les gammes isolants, finitions et forfaits pose du funnel doivent mapper vos options, variantes et produits liés. Pas de kits. Sinon double saisie des lignes.",
  },
  {
    q: "Combien d’étapes idéales ?",
    a: "Souvent 8 à 11. Au-delà, découpez (cœur puis technique) ou repoussez le détail après le score Hot.",
  },
  {
    q: "Comment démarrer sans refondre tout le site ?",
    a: "Un widget funnel sur la page « Devis isolation / ITE » et un catalogue minimal (2-3 gammes, forfaits pose, options accès / finition) suffisent pour un pilote.",
  },
  {
    q: "Faut-il une validation interne avant d’envoyer un devis ITE ?",
    a: "Sur les Hot, les paniers élevés et les accès complexes, oui. Ça réduit les V2 et les remises de panique.",
  },
];

export default function IsolationThermiqueIteLandingPage() {
  const body = loadPostBody("funnel-devis-isolation-thermique-ite");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis isolation thermique et ITE : façade, combles, brief, relances",
    url: `${SITE_URL}/secteurs/funnel-devis-isolation-thermique-ite`,
    about: "Isolation thermique, ITE, façade, combles, surface, accès chantier, photos",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Isolation thermique et ITE
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis isolation thermique et ITE : façade, combles, brief, relances
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de travaux, surface, support, accès chantier, état existant, photos, délai, type de
            client. Un brief chiffrable, un score, puis des relances.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Branches ITE, combles, murs, type de client, photos." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Gammes isolants, finitions, forfaits pose, accès." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, délai chantier, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, relances." },
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
        title="Essayer gratuitement"
        text="Posez surface, support, accès et photos dans un ordre fixe. Il n’y a pas de template isolation. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
