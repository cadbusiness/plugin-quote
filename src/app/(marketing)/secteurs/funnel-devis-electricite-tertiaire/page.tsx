import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis électricité tertiaire : dépannage, mise en conformité, neuf, brief scoré",
  description:
    "Landing SEO électriciens et entreprises électricité tertiaire : funnel de devis (dépannage, mise en conformité, rénovation tableau, neuf, éclairage, courants faibles), type de site, accès, photos, urgence, options, brief scoré. Sans barèmes ni normes inventées comme features produit.",
  path: "/secteurs/funnel-devis-electricite-tertiaire",
});

const FAQ = [
  {
    q: "Peut-on chiffrer une rénovation de tableau sans visite ?",
    a: "Souvent un indicatif oui, si type d’intervention, site, photos et accès sont corrects. Un devis ferme dépend de votre politique risque (existant, puissance, cheminements, surprises).",
  },
  {
    q: "Faut-il afficher un prix forfait dépannage sur le site ?",
    a: "Dangereux sans brief. Préférez un parcours qui aboutit à une estimation personnalisée, ou une fourchette très large clairement non contractuelle. Pas de barème « officiel » inventé.",
  },
  {
    q: "Comment gérer dépannage et projet long dans le même funnel ?",
    a: "Une question « contexte », posée dans un ordre fixe. Le score Hot, Warm ou Cold est calculé à la soumission. L’équipe trie ensuite. Même dossier ensuite. Les étapes produit restent en ordre fixe ; vos priorités d’équipe font le reste.",
  },
  {
    q: "Comment parler de NF C 15-100 ou Consuel sans se tromper ?",
    a: "Mention générique + collecte d’infos + traitement humain. Pas de promesse de conformité automatique dans le wizard, et pas comme feature QuoteBuilder.",
  },
  {
    q: "Dépannage et éclairage doivent-ils être deux funnels ?",
    a: "Pas forcément. Une question « type d’intervention », dans le même funnel et dans un ordre fixe, suffit souvent. Le score Hot, Warm ou Cold est calculé à la soumission. L’équipe trie ensuite. Séparez seulement si les équipes ou les catalogues sont vraiment distincts.",
  },
  {
    q: "Comment éviter l’abandon à l’étape photos ?",
    a: "Rendez l’upload optionnel mais valorisé. Proposez « je n’ai pas de photo » pour ne pas bloquer.",
  },
  {
    q: "QuoteBuilder planifie-t-il les interventions électriciens ?",
    a: "Non. Le produit aide à filtrer, poser un libellé automatique, chiffrer, partager l’espace prospect et relancer. L’agenda terrain reste hors produit. Ce n’est pas non plus un client WhatsApp.",
  },
  {
    q: "Combien d’étapes idéales ?",
    a: "Souvent 8 à 11 questions, dans un ordre fixe. Le score Hot, Warm ou Cold est calculé à la soumission. L’équipe trie les dossiers ensuite.",
  },
  {
    q: "Comment démarrer sans refondre tout le site ?",
    a: "Un widget funnel sur la page « Devis électricité » et un catalogue minimal (dépannage, quelques lignes tableau / éclairage, options accès / hors heures) suffisent pour un pilote. Pas de template secteur électricité à activer d’un clic.",
  },
  {
    q: "Faut-il une validation interne avant d’envoyer un devis électricité complexe ?",
    a: "Sur les dossiers que l’équipe juge prioritaires, les paniers élevés, les accès complexes et les multi-sites, oui. Ça réduit les devis trop optimistes.",
  },
];

export default function ElectriciteTertiaireLandingPage() {
  const body = loadPostBody("funnel-devis-electricite-tertiaire");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis électricité tertiaire : dépannage, mise en conformité, neuf, brief scoré",
    url: `${SITE_URL}/secteurs/funnel-devis-electricite-tertiaire`,
    about: "Électricité tertiaire, dépannage, conformité, tableau, éclairage, accès, photos",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Électricité tertiaire
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis électricité tertiaire : dépannage, mise en conformité, neuf, brief scoré
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type d’intervention, type de site, accès, photos, urgence, type de client et options.
            Un brief chiffrable, un libellé automatique, puis un espace prospect sur un seul lien.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Questions en ordre fixe : type d’intervention, site, accès, photos, urgence." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Dépannage, tableau, éclairage. Si/Alors pour les produits suggérés." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Libellé automatique Hot, Warm ou Cold, et assignation." },
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
        text="Posez type d’intervention, site, accès, photos et urgence dans un ordre fixe. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
