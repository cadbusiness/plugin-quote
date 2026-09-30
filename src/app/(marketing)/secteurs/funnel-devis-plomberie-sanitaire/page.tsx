import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis plomberie et sanitaire : fuite, rénovation, neuf, brief scoré",
  description:
    "Landing SEO artisans et entreprises plomberie / sanitaire : funnel de devis (type d’intervention, type de pièce, accès, photos, urgence, type client, matériaux, options), sans barèmes ni prix officiels inventés.",
  path: "/secteurs/funnel-devis-plomberie-sanitaire",
});

const FAQ = [
  {
    q: "Peut-on chiffrer une rénovation sanitaire sans visite ?",
    a: "Souvent un indicatif oui, si type d’intervention, pièce, photos et accès sont corrects. Un devis ferme dépend de votre politique risque (réseaux, dépose, surprises cloison).",
  },
  {
    q: "Faut-il afficher un prix forfait fuite sur le site ?",
    a: "Dangereux sans brief. Préférez un parcours qui aboutit à une estimation personnalisée, ou une fourchette très large clairement non contractuelle. Pas de barème « officiel » inventé.",
  },
  {
    q: "Comment gérer urgence et projet long dans le même funnel ?",
    a: "Une question « contexte », posée dans un ordre fixe. Le score et le SLA changent selon la réponse. Le dossier reste le même ensuite.",
  },
  {
    q: "Comment parler d’assurance sans se tromper ?",
    a: "Mention générique + collecte d’infos + traitement humain. Pas de promesse de prise en charge dans le wizard.",
  },
  {
    q: "Fuite et rénovation salle de bain doivent-elles être deux funnels ?",
    a: "Pas forcément. Une question « type d’intervention », dans le même funnel et dans un ordre fixe, suffit souvent. Séparez seulement si les équipes ou les catalogues sont vraiment distincts.",
  },
  {
    q: "Comment éviter l’abandon à l’étape photos ?",
    a: "Rendez l’upload optionnel mais valorisé (« avec photos, réponse plus rapide »). Proposez « je n’ai pas de photo » pour ne pas bloquer.",
  },
  {
    q: "QuoteBuilder planifie-t-il les tournées plombiers ?",
    a: "Non. Le produit aide à filtrer et scorer les demandes, chiffrer, partager l’espace prospect et relancer. L’agenda terrain reste hors produit.",
  },
  {
    q: "Combien d’étapes idéales ?",
    a: "Souvent 8 à 11. Au-delà, découpez (cœur puis technique) ou repoussez le détail après le score Hot.",
  },
  {
    q: "Comment démarrer sans refondre tout le site ?",
    a: "Un widget funnel sur la page « Devis plomberie » et un catalogue minimal (forfaits dépannage, quelques lignes sanitaires, options dépose / accès) suffisent pour un pilote.",
  },
  {
    q: "Faut-il une validation interne avant d’envoyer un devis plomberie complexe ?",
    a: "Sur les Hot, les paniers élevés, les accès complexes et les sinistres, oui. Ça réduit les devis trop optimistes.",
  },
];

export default function PlomberieSanitaireLandingPage() {
  const body = loadPostBody("funnel-devis-plomberie-sanitaire");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis plomberie et sanitaire : fuite, rénovation, neuf, brief scoré",
    url: `${SITE_URL}/secteurs/funnel-devis-plomberie-sanitaire`,
    about: "Plomberie, sanitaire, fuite, rénovation, accès chantier, photos",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Plomberie et sanitaire
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis plomberie et sanitaire : fuite, rénovation, neuf, brief scoré
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type d’intervention, type de pièce, accès, photos, urgence, type de client, matériaux
            et options. Un brief chiffrable, un score, puis un espace prospect sur un seul lien.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Questions en ordre fixe : type d’intervention, pièce, accès, photos, urgence." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Forfaits dépannage, sanitaires, dépose. Si/Alors pour les produits suggérés." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, urgence vs projet, assignation." },
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
        title="Essayer gratuitement"
        text="Posez type d’intervention, pièce, accès, photos et urgence dans un ordre fixe, puis scorez le dossier. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
