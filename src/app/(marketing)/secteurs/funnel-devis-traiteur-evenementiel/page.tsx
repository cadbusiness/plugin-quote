import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis traiteur événementiel : des demandes avec date, convives, format et régimes",
  description:
    "Landing SEO traiteur événementiel et réceptions d'entreprise : funnel de devis (type de prestation, date, lieu, convives, régimes et allergies), template Traiteur QuoteBuilder, formules par convive, fourchette indicative, relecture et validation client. Sans barème inventé.",
  path: "/secteurs/funnel-devis-traiteur-evenementiel",
});

const FAQ = [
  {
    q: "Existe-t-il un template traiteur dans QuoteBuilder ?",
    a: "Oui : « Traiteur », dans la famille Location & événementiel, nommé par défaut « Funnel traiteur ». Il crée l'étape Votre événement (Type de prestation, Durée, Date ou lieu), puis Solutions recommandées, Personnalisation et Vos coordonnées.",
  },
  {
    q: "Le template demande-t-il le nombre de convives ?",
    a: "Non, malgré son sous-titre. Ajoutez une question de type Mesure « Nombre de convives » à l'étape Votre événement.",
  },
  {
    q: "Peut-on afficher des questions différentes pour un cocktail et un repas assis ?",
    a: "Non. Les questions s'enchaînent dans un ordre fixe, sans branchement. Seules les formules suggérées changent selon les réponses, grâce aux règles.",
  },
  {
    q: "Peut-on proposer un prix par personne ?",
    a: "Oui, avec un produit en fourchette ou en prix fixe par convive, et la quantité égale au nombre de personnes. Le montant de la ligne multiplie le prix par la quantité.",
  },
  {
    q: "Les prix sont-ils HT ?",
    a: "QuoteBuilder n'affiche ni HT ni TTC et ne gère pas la TVA. Précisez « HT » dans le nom ou la description de vos produits.",
  },
  {
    q: "Peut-on vendre un menu complet en un seul lot ?",
    a: "Il n'existe pas de kit ni de lot dans QuoteBuilder. Créez le menu comme un produit unique, ou proposez plusieurs produits ensemble dans une même règle.",
  },
  {
    q: "Le client peut-il envoyer un plan de salle ?",
    a: "Oui, à l'étape Personnalisation (PDF ou image, 10 Mo) ou depuis son espace prospect, rubrique « Compléter la demande ».",
  },
  {
    q: "Le funnel gère-t-il les allergènes ?",
    a: "Il recueille les régimes et allergies déclarés, via les questions que vous ajoutez. L'information réglementaire sur les allergènes de vos plats reste à votre charge.",
  },
  {
    q: "Plusieurs personnes chez le client peuvent-elles valider ?",
    a: "Oui. Le client invite des relecteurs depuis son espace prospect ; chacun reçoit un lien de 30 jours et peut valider ou demander des modifications.",
  },
  {
    q: "QuoteBuilder gère-t-il la production et le planning ?",
    a: "Non. Il reçoit, structure et suit les demandes de devis. Fiches techniques, achats et planning restent dans vos outils.",
  },
];

export default function TraiteurEvenementielLandingPage() {
  const body = loadPostBody("funnel-devis-traiteur-evenementiel");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis traiteur événementiel : des demandes avec date, convives, format et régimes",
    url: `${SITE_URL}/secteurs/funnel-devis-traiteur-evenementiel`,
    about: "Traiteur événementiel, type de prestation, durée, date, lieu",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Traiteur événementiel
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis traiteur événementiel : des demandes avec date, convives, format et régimes
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de prestation, durée, date ou lieu. Le template Traiteur ne pose pas de question convives : on
            l&apos;ajoute. Un brief chiffrable, puis une relecture sur un seul lien.
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
                d: "Ordre fixe : type de prestation, durée, date ou lieu. Les convives s'ajoutent.",
              },
              {
                href: "/fonctionnalites/catalogue",
                t: "Catalogue",
                d: "Prix fixe, fourchette ou sur devis. Pas de kits.",
              },
              {
                href: "/fonctionnalites/demandes",
                t: "Demandes",
                d: "Libellé automatique Hot, Warm ou Cold. Sept statuts.",
              },
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
        title="Partir du template Traiteur"
        text="Créer un compte Free puis choisir le template Traiteur dans la famille Location & événementiel. Type Formulaire, nom par défaut « Funnel traiteur ». Le template ne crée ni produits ni règles, et ne pose pas de question convives. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
