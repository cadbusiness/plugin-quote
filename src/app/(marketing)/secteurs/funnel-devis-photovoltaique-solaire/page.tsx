import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadContentBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis photovoltaïque et solaire : toiture, kWc, brief, signature",
  description:
    "Landing SEO installateurs et bureaux d’études PV : funnel de devis (toiture, puissance kWc, orientation, conso, type de client, accès, stockage batterie option, délai pose), sans barèmes d’aides inventés.",
  path: "/secteurs/funnel-devis-photovoltaique-solaire",
});

const FAQ = [
  {
    q: "Peut-on chiffrer une installation PV sans visite ?",
    a: "Souvent un indicatif oui, si toiture, orientation, photos et conso (même approximative) sont corrects. Un devis ferme dépend de votre politique risque (structure, ombre, tableau, accès).",
  },
  {
    q: "Faut-il afficher un prix au kWc sur le site ?",
    a: "Dangereux sans brief. Préférez un parcours qui aboutit à une estimation personnalisée, ou une fourchette très large clairement non contractuelle.",
  },
  {
    q: "Comment gérer particulier, pro et syndic dans le même funnel ?",
    a: "Branche précoce « type de client », puis champs spécifiques (SIRET, lots, contact technique). Ne mélangez pas tout sur le même écran.",
  },
  {
    q: "Comment parler des aides sans se tromper ?",
    a: "Mention générique + collecte d’infos + traitement humain. Pas de barème inventé dans le wizard.",
  },
  {
    q: "La batterie doit-elle être obligatoire dans le parcours ?",
    a: "Non. Proposez-la en option ou en branche « je veux étudier le stockage ». Beaucoup de prospects veulent d’abord la production.",
  },
  {
    q: "Comment éviter l’abandon à l’étape photos ?",
    a: "Rendez l’upload optionnel mais valorisé (« avec photos toiture, réponse sous 48 h »). Proposez « je n’ai pas de photo » pour ne pas bloquer.",
  },
  {
    q: "Quel lien avec le catalogue produits ?",
    a: "Les gammes modules / onduleurs / forfaits pose du funnel doivent mapper vos kits / articles. Sinon double saisie.",
  },
  {
    q: "Combien d’étapes idéales ?",
    a: "Souvent 8 à 11. Au-delà, découpez (cœur puis technique) ou repoussez le détail après le score Hot.",
  },
  {
    q: "Comment démarrer sans refondre tout le site ?",
    a: "Un widget funnel sur la page « Devis solaire / PV » + catalogue minimal (2–3 gammes, forfaits pose, option batterie) suffit pour un pilote.",
  },
];

export default function PhotovoltaiqueSolaireLandingPage() {
  const body = loadContentBody("funnel-devis-photovoltaique-solaire", "secteurs");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis photovoltaïque et solaire : toiture, kWc, brief, signature",
    url: `${SITE_URL}/secteurs/funnel-devis-photovoltaique-solaire`,
    about: "Photovoltaïque, solaire, toiture, kWc, orientation, consommation, batterie, pose",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Photovoltaïque et solaire
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis photovoltaïque et solaire : toiture, kWc, brief, signature
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Toiture, puissance indicative (kWc), orientation, consommation, type de client, accès,
            option batterie, photos, délai de pose. Un brief chiffrable, un score, puis une signature
            qui ne traîne pas.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Branches toiture, kWc, type de client, photos." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Gammes modules, onduleurs, forfaits pose, batterie." },
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
        title="Essayer le template photovoltaïque / solaire"
        text="Un parcours toiture, kWc, orientation, photos, option batterie. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
