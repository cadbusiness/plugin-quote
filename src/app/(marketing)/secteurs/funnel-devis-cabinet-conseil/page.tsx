import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title:
    "Funnel de devis cabinet de conseil : audit, accompagnement, management de transition, une demande cadrée avant le premier rendez-vous",
  description:
    "Landing SEO cabinets de conseil et consultants indépendants : template Conseil de QuoteBuilder, questions à ajouter (périmètre, livrable, format, budget, décideurs, confidentialité), catalogue de missions et de jours, règles Si/Alors par type de mission, score Cold, documents en PDF, relecteurs direction et achats, conditions de paiement d'une mission. Sans fonction inventée.",
  path: "/secteurs/funnel-devis-cabinet-conseil",
});

const FAQ = [
  {
    q: "Existe-t-il un template cabinet de conseil dans QuoteBuilder ?",
    a: "Oui. Le template « Conseil », identifiant tech_consulting, dans la famille Tech & services. Il crée un formulaire nommé « Funnel conseil », en quatre étapes : Votre mission, Solutions recommandées, Personnalisation, Vos coordonnées.",
  },
  {
    q: "Quels types de mission le template propose-t-il ?",
    a: "Audit / diagnostic, Accompagnement, Management de transition et Autre, en choix visuel obligatoire. Viennent ensuite un champ Contexte facultatif et une Échéance. Les missions elles-mêmes viennent de votre catalogue, via des règles que vous écrivez.",
  },
  {
    q: "Peut-on poser des questions différentes pour un audit et pour une mission de transition ?",
    a: "Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les missions suggérées. Posez des questions compréhensibles dans tous les cas, laissez facultatives celles qui ne concernent qu'un type de mission, ou créez un second funnel.",
  },
  {
    q: "Pourquoi les demandes sont-elles Cold ?",
    a: "La formule part de 30 et ne lit ni le type de mission, ni le champ Contexte (clé notes), ni l'échéance, ni les questions ajoutées dans le constructeur. Tel quel, chaque demande vaut 30 points, donc cold. Ce n'est pas un réglage.",
  },
  {
    q: "Le client peut-il joindre un cahier des charges ?",
    a: "Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Pas de Word ni de tableur. Plus tard, le contact principal peut ajouter un fichier depuis « Compléter la demande » sur son espace prospect.",
  },
  {
    q: "Peut-on chiffrer des jours de conseil ?",
    a: "Oui, avec un produit à prix fixe par jour et la quantité en jours. Le montant de la ligne est le prix unitaire multiplié par la quantité. Si vos tarifs diffèrent selon le profil, créez un produit par profil.",
  },
  {
    q: "La direction financière ou les achats peuvent-ils voir la demande ?",
    a: "Oui, si le client les invite comme relecteurs depuis son espace prospect. Chacun reçoit un lien de 30 jours. Ils peuvent consulter, commenter, indiquer un budget maximum, valider ou demander des modifications. Ce n'est pas une signature.",
  },
  {
    q: "QuoteBuilder rédige-t-il la proposition ou la lettre de mission ?",
    a: "Non. QuoteBuilder recueille la demande et produit un récapitulatif indicatif, avec un pied de page fixe, « Document indicatif, non contractuel. ». La proposition, la lettre de mission et l'accord de confidentialité se rédigent hors de QuoteBuilder.",
  },
  {
    q: "Faut-il demander des informations confidentielles dans le funnel ?",
    a: "Non. Le sujet, le périmètre, l'échéance et le budget suffisent pour un premier échange. Les comptes, l'organigramme nominatif ou un projet de cession viennent après, une fois la confidentialité organisée.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et dix demandes au total. Le détail des plans est sur la page Tarifs.",
  },
];

export default function CabinetConseilLandingPage() {
  const body = loadPostBody("funnel-devis-cabinet-conseil");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis cabinet de conseil : audit, accompagnement, management de transition, une demande cadrée avant le premier rendez-vous",
    url: `${SITE_URL}/secteurs/funnel-devis-cabinet-conseil`,
    about: "Cabinet de conseil, audit, accompagnement, management de transition",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Cabinet de conseil
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis cabinet de conseil : audit, accompagnement, management de transition, une demande cadrée
            avant le premier rendez-vous
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de mission, contexte, échéance. Le template Conseil les pose. Périmètre, livrable, format et budget
            s&apos;ajoutent. Un brief avant le premier rendez-vous, puis une proposition rédigée à part.
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
                href: "/blog/conditions-paiement-penalites-retard-devis-b2b",
                t: "Conditions de paiement",
                d: "Délai, pénalités de retard et indemnité de 40 €. Ce qu'il faut écrire avant la mission.",
              },
              {
                href: "/outils/calculateur-penalites-retard-paiement",
                t: "Calculateur de pénalités",
                d: "Échéance, jours de retard, taux par semestre et indemnité. Le calcul se fait dans le navigateur.",
              },
              {
                href: "/blog/regles-suggestion-produits-funnel-devis-b2b",
                t: "Règles Si/Alors",
                d: "Conditions ET, trois suggestions au plus. Le type de mission choisit les offres.",
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
        title="Essayer le template Conseil"
        href="/signup?plan=free"
        text="Créer un compte Free puis choisir le template Conseil (tech_consulting) dans la famille Tech & services. Type Formulaire, nom par défaut « Funnel conseil ». Le template ne crée ni offres ni règles, et ne pose ni le périmètre, ni le livrable, ni le budget. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
