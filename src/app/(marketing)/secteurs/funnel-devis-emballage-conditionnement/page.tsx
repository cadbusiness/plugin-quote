import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis emballage et conditionnement : recevoir des demandes chiffrables",
  description:
    "Landing SEO fabricants et distributeurs d'emballages : funnel de devis (type d'emballage, matière, volume, échéance), template Emballages QuoteBuilder, fourchette indicative, relecture. Sans barème inventé. Pas de question dimensions dans le template.",
  path: "/secteurs/funnel-devis-emballage-conditionnement",
});

const FAQ = [
  {
    q: "Existe-t-il un template emballage dans QuoteBuilder ?",
    a: "Oui : « Emballages », dans la famille Industrie & fabrication, nommé par défaut « Funnel emballages ». Il crée l'étape Votre conditionnement, puis Solutions recommandées, Personnalisation et Vos coordonnées.",
  },
  {
    q: "Le template demande-t-il les dimensions ?",
    a: "Non. Ajoutez un champ « Dimensions intérieures (L × l × h, en mm) » à l'étape Votre conditionnement.",
  },
  {
    q: "Peut-on afficher des questions différentes pour un carton et un film ?",
    a: "Non. Les questions s'enchaînent dans un ordre fixe, sans branchement. Seuls les produits suggérés changent selon les réponses.",
  },
  {
    q: "Le prospect peut-il joindre un plan ?",
    a: "Oui, à l'étape Personnalisation ou depuis son espace prospect. Une question de type fichier ne permet pas de téléverser.",
  },
  {
    q: "Peut-on gérer un prix dégressif selon la quantité ?",
    a: "Pas automatiquement. Le prix d'un produit ne dépend pas de la quantité. Créez un produit par palier ou par lot, ou utilisez une fourchette.",
  },
  {
    q: "Le prospect voit-il un montant total ?",
    a: "Oui, une fourchette indicative : le prix multiplié par la quantité pour chaque ligne, additionné, sauf si la règle porte sa propre fourchette.",
  },
  {
    q: "Peut-on vendre un lot caisse, calage et film ?",
    a: "Il n'existe pas de kit. Créez trois produits et proposez-les ensemble avec une règle.",
  },
  {
    q: "Les prix sont-ils HT ?",
    a: "QuoteBuilder ne gère pas la TVA et n'affiche ni HT ni TTC. Précisez « HT » dans le nom ou la description des produits.",
  },
  {
    q: "Le score aide-t-il à trier les demandes d'emballage ?",
    a: "Non. Le template ne contient aucune question lue par le score : chaque dossier reçoit 30 points, Cold.",
  },
  {
    q: "Que se passe-t-il si un acheteur s'arrête en cours de route ?",
    a: "S'il a sauvegardé sa configuration avec son email, une relance part après une heure d'inactivité, avec un lien de reprise. Sinon, la session reste visible dans la page Sessions, sans contact.",
  },
];

export default function EmballageConditionnementLandingPage() {
  const body = loadPostBody("funnel-devis-emballage-conditionnement");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis emballage et conditionnement : recevoir des demandes chiffrables",
    url: `${SITE_URL}/secteurs/funnel-devis-emballage-conditionnement`,
    about: "Emballage, type d'emballage, matière, volume, échéance",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Emballage et conditionnement
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis emballage et conditionnement : recevoir des demandes chiffrables
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type d&apos;emballage, matière, volume ou quantité, échéance. Le template Emballages ne pose pas de question
            dimensions : on l&apos;ajoute. Un brief chiffrable, puis une relecture sur un seul lien.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup?plan=free"
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
              {
                href: "/fonctionnalites/funnel",
                t: "Funnel",
                d: "Ordre fixe : type d'emballage, matière, volume, échéance. Les dimensions s'ajoutent.",
              },
              {
                href: "/fonctionnalites/catalogue",
                t: "Catalogue",
                d: "Prix fixe, fourchette ou sur devis. Pas de kits. Pas de prix dégressif.",
              },
              {
                href: "/fonctionnalites/demandes",
                t: "Demandes",
                d: "Libellé automatique. Dossier Emballages : 30 points, Cold. Sept statuts.",
              },
              {
                href: "/fonctionnalites/autopilote",
                t: "Autopilote",
                d: "Reprise après 1 h puis 24 h si un email a été laissé.",
              },
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
        title="Partir du template Emballages"
        text="Créer un compte Free puis choisir le template Emballages dans la famille Industrie & fabrication. Type Formulaire, nom par défaut « Funnel emballages ». Le template ne crée ni produits ni règles, et ne pose pas de question dimensions. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
