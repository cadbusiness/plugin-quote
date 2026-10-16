import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title:
    "Funnel de devis agence web et ESN : site, renfort, data, une demande cadrée avant le premier rendez-vous",
  description:
    "Landing SEO agences web, ESN et studios de développement : template Agence / ESN de QuoteBuilder, questions à ajouter (budget, existant, forfait ou régie, décideurs), catalogue d'offres et de jours, règles Si/Alors par type de besoin, score Cold, cahier des charges en PDF, relecteurs DSI et achats. Sans fonction inventée.",
  path: "/secteurs/funnel-devis-agence-web-esn",
});

const FAQ = [
  {
    q: "Existe-t-il un template agence web ou ESN dans QuoteBuilder ?",
    a: "Oui. Le template « Agence / ESN », identifiant tech_agency, dans la famille Tech et services. Il crée un formulaire nommé « Funnel agence », en quatre étapes.",
  },
  {
    q: "Quels types de besoin le template propose-t-il ?",
    a: "Site / produit, Renfort / TMA, Data / SI et Autre, en choix visuel obligatoire. Viennent ensuite un champ Contexte facultatif et une Échéance. Les offres elles-mêmes viennent de votre catalogue, via des règles que vous écrivez.",
  },
  {
    q: "Peut-on poser des questions différentes pour un site et pour un renfort ?",
    a: "Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les offres suggérées. Posez des questions compréhensibles dans tous les cas, laissez facultatives celles qui ne concernent qu'un type de besoin, ou faites deux funnels.",
  },
  {
    q: "Pourquoi les demandes sont-elles Cold ?",
    a: "La formule part de 30 et ne lit ni le type de besoin, ni le champ Contexte (clé notes), ni l'échéance, ni les questions ajoutées dans le constructeur. Tel quel, chaque demande vaut 30 points, donc cold. Ce n'est pas un réglage.",
  },
  {
    q: "Le client peut-il joindre un cahier des charges ?",
    a: "Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Pas de Word ni de zip. Plus tard, le contact principal peut ajouter un fichier, dans les mêmes formats, depuis « Compléter la demande » sur son espace prospect.",
  },
  {
    q: "Peut-on chiffrer de la régie au jour ?",
    a: "Oui, avec un produit à prix fixe par jour et la quantité en jours. Le montant de la ligne est le prix unitaire multiplié par la quantité. Le contrat de régie lui-même, avec la description de la prestation, se rédige hors de QuoteBuilder.",
  },
  {
    q: "La DSI ou les achats peuvent-ils voir la demande ?",
    a: "Oui, si le client les invite comme relecteurs depuis son espace prospect. Chacun reçoit un lien de 30 jours. Ils peuvent consulter, commenter, indiquer un budget maximum, valider ou demander des modifications. Ce n'est pas une signature.",
  },
  {
    q: "QuoteBuilder gère-t-il la cession de droits ou le contrat ?",
    a: "Non. QuoteBuilder recueille la demande et produit un récapitulatif indicatif. La cession de droits, le périmètre et les conditions vont dans votre contrat et vos conditions générales.",
  },
  {
    q: "Les options changent-elles le prix ?",
    a: "Non. Le montant d'une ligne est le prix unitaire multiplié par la quantité. Une variante qui coûte plus cher, par exemple un profil senior, est un autre produit.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes. Le détail des plans est sur la page Tarifs.",
  },
];

export default function AgenceWebEsnLandingPage() {
  const body = loadPostBody("funnel-devis-agence-web-esn");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis agence web et ESN : site, renfort, data, une demande cadrée avant le premier rendez-vous",
    url: `${SITE_URL}/secteurs/funnel-devis-agence-web-esn`,
    about: "Agence web, ESN, site, renfort, data",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Agence web et ESN
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis agence web et ESN : site, renfort, data, une demande cadrée avant le premier rendez-vous
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de besoin, contexte, échéance. Le template Agence / ESN les pose. Budget, existant, forfait ou régie
            s&apos;ajoutent. Un brief avant le premier rendez-vous, puis un devis rédigé à part.
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
                href: "/blog/salon-professionnel-demandes-devis-b2b",
                t: "Salon professionnel",
                d: "QR code, lien tagué, relance le soir même. Transformer les contacts du stand en demandes.",
              },
              {
                href: "/outils/calculateur-roi-salon-professionnel-devis",
                t: "Calculateur ROI",
                d: "Coût par demande, marge et seuil de rentabilité. Le calcul se fait dans le navigateur.",
              },
              {
                href: "/blog/regles-suggestion-produits-funnel-devis-b2b",
                t: "Règles Si/Alors",
                d: "Conditions ET, trois suggestions au plus. Le type de besoin choisit les offres.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Cahier des charges en PDF ou image, 10 Mo. Relecteurs avec un lien de 30 jours.",
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
        title="Essayer le template Agence / ESN"
        text="Créer un compte Free puis choisir le template Agence / ESN (tech_agency) dans la famille Tech et services. Type Formulaire, nom par défaut « Funnel agence ». Le template ne crée ni offres ni règles, et ne pose ni le budget ni le forfait ou la régie. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
