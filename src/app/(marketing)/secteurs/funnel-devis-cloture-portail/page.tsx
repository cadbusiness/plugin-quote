import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis clôture et portail : linéaire, hauteur, motorisation, pose",
  description:
    "Landing SEO poseurs et fabricants de clôtures, portails et grilles : funnel de devis (linéaire, hauteur, motorisation, matériaux), configurateur vs Excel, options, délai réponse, espace prospect.",
  path: "/secteurs/funnel-devis-cloture-portail",
});

const FAQ = [
  {
    q: "Faut-il toujours une visite avant devis clôture / portail ?",
    a: "Pas toujours pour une estimation. Oui souvent avant commande et pose (pente, sol, mitoyenneté). Le funnel doit distinguer « prix indicatif » et « devis ferme après relevé ».",
  },
  {
    q: "Comment gérer les photos WhatsApp du client ?",
    a: "Autorisez WhatsApp pour recevoir, mais créez tout de suite un dossier et uploadez-y les images. Sinon le fil disparaît.",
  },
  {
    q: "Que mettre en premier : linéaire ou type de produit ?",
    a: "Famille produit et typologie d’abord (pour brancher les questions), puis dimensions. Inverser pousse à un prix au mètre magique.",
  },
  {
    q: "Comment scorer « urgent avant vente du bien » ?",
    a: "Souvent Hot : date contrainte. Vérifiez décideur, accès, complétude du brief. SLA court.",
  },
  {
    q: "Un seul funnel pour particulier et promoteur ?",
    a: "Oui, avec une première question contexte et des branches (volumes, lots, interlocuteurs). Un monolithe sans branches redevient un formulaire flou.",
  },
  {
    q: "Comment traiter syndic + copropriétaires ?",
    a: "Champ interlocuteurs, circuit de validation, un seul lien espace prospect pour la bonne version.",
  },
  {
    q: "Le funnel remplace-t-il le poseur ?",
    a: "Non. Il prépare le brief pour que le poseur et l’atelier ne perdent pas leur temps sur des incomplets.",
  },
  {
    q: "Comment éviter les reprises motorisation ?",
    a: "Liste moteur + accessoires + alimentation dès le funnel. Toute modif = nouvelle version du devis.",
  },
];

export default function CloturePortailLandingPage() {
  const body = loadPostBody("funnel-devis-cloture-portail");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis clôture et portail : linéaire, hauteur, motorisation, pose",
    url: `${SITE_URL}/secteurs/funnel-devis-cloture-portail`,
    about: "Clôture, portail, grilles, motorisation, devis pose, linéaire, hauteur",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Clôture et portail
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis clôture et portail : linéaire, hauteur, motorisation, pose
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Linéaire, hauteur, matériaux, motorisation, terrain, pose. Un brief chiffrable, un
            score, un owner, puis des relances qui tiennent la saison.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Branches clôture, portail, grille, moteur." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Panneaux, lames, motorisation + Si/Alors." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, SLA saison, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, métrage, relances." },
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
        title="Essayer le template clôture / portail"
        text="Un parcours linéaire, hauteur, motorisation, pose. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
