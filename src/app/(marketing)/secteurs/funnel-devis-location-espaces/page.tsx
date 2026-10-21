import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title:
    "Funnel de devis location d'espaces : salle de réunion, coworking, salle événementielle, une demande de réservation complète avant le devis",
  description:
    "Landing SEO centres d'affaires, coworkings et loueurs de salles : template Location d’espaces de QuoteBuilder tel qu'il existe, questions à ajouter (nombre de personnes, horaires, configuration, services, date ferme, récurrence), capacité et ERP, catalogue d'espaces et de services, règles Si/Alors, score Cold, option, acompte et annulation. Sans fonction inventée.",
  path: "/secteurs/funnel-devis-location-espaces",
});

const FAQ = [
  {
    q: "Existe-t-il un template location de salles dans QuoteBuilder ?",
    a: "Oui. Le template « Location d’espaces », identifiant services_spaces, dans la famille Services professionnels. Il crée un formulaire nommé « Funnel espaces », en quatre étapes : Votre réservation, Solutions recommandées, Personnalisation, Vos coordonnées.",
  },
  {
    q: "Quelles questions le template pose-t-il ?",
    a: "Le type d'espace (Coworking / bureau, Salle de réunion, Salle événementielle, Autre), obligatoire ; la durée (1 jour, Quelques jours, 1 mois et +), obligatoire ; et un champ texte facultatif « Date ou lieu ». Les espaces eux-mêmes viennent de votre catalogue, via des règles que vous écrivez.",
  },
  {
    q: "Le template demande-t-il le nombre de personnes ?",
    a: "Non, malgré le mot « jauge » dans le sous-titre de l'étape. Ajoutez une question Mesure « Nombre de personnes ». Vous pourrez ensuite écrire des règles avec « est au moins » et « est au plus ».",
  },
  {
    q: "Peut-on louer à l'heure ou à la demi-journée ?",
    a: "Oui, en modifiant la liste « Durée » dans le constructeur, et en créant des produits « demi-journée ». Le template livré ne propose que 1 jour, Quelques jours et 1 mois et +.",
  },
  {
    q: "QuoteBuilder vérifie-t-il la disponibilité des salles ?",
    a: "Non. QuoteBuilder n'a pas de planning ni de calendrier. L'étape « Espaces disponibles » montre les produits que vos règles suggèrent selon les réponses. La disponibilité se vérifie dans votre planning, après la demande.",
  },
  {
    q: "Peut-on afficher un prix par personne pour le déjeuner ?",
    a: "Oui. Mettez le prix d'une personne sur le produit : la quantité choisie sert de nombre de personnes, et le montant de la ligne est prix × quantité.",
  },
  {
    q: "Pourquoi les demandes sont-elles Cold ?",
    a: "La formule part de 30 et ne lit ni le type d'espace (clé category), ni la durée, ni le champ « Date ou lieu », ni les questions ajoutées. Tel quel, chaque demande vaut 30 points, donc cold. Ce n'est pas un réglage.",
  },
  {
    q: "Le client peut-il envoyer un programme ou un plan de salle ?",
    a: "Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Plus tard, le contact principal peut ajouter un fichier depuis « Compléter la demande » sur son espace prospect.",
  },
  {
    q: "QuoteBuilder gère-t-il l'acompte et les frais d'annulation ?",
    a: "Non. QuoteBuilder n'encaisse rien, n'émet pas de facture et ne calcule pas de frais d'annulation. Écrivez l'acompte et le barème dans votre proposition, annoncez-les dans la description des produits, et faites le calcul avec le calculateur de frais d'annulation.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et dix demandes au total. Le détail des plans est sur la page Tarifs.",
  },
];

export default function LocationEspacesLandingPage() {
  const body = loadPostBody("funnel-devis-location-espaces");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis location d'espaces : salle de réunion, coworking, salle événementielle, une demande de réservation complète avant le devis",
    url: `${SITE_URL}/secteurs/funnel-devis-location-espaces`,
    about: "Location d'espaces, salle de réunion, coworking, salle événementielle",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            {"Secteur · Location d'espaces"}
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            {
              "Funnel de devis location d'espaces : salle de réunion, coworking, salle événementielle, une demande de réservation complète avant le devis"
            }
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            {
              "Type d'espace, durée, date ou lieu. Le template Location d’espaces les pose. Le nombre de personnes, les horaires et la configuration s'ajoutent. Une demande de réservation complète avant le devis."
            }
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
                href: "/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale",
                t: "Annulation d'une commande",
                d: "Arrhes, acompte, dédit et clause pénale. Ce qu'il faut écrire avant la réservation.",
              },
              {
                href: "/outils/calculateur-frais-annulation-commande",
                t: "Calculateur de frais d'annulation",
                d: "Palier, indemnité, acompte ou arrhes, solde et perte. Le calcul se fait dans le navigateur.",
              },
              {
                href: "/blog/regles-suggestion-produits-funnel-devis-b2b",
                t: "Règles Si/Alors",
                d: "Conditions ET, trois suggestions au plus. Le type d'espace choisit les salles.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Programme ou plan de salle en PDF ou image, 10 Mo.",
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
        title="Essayer le template Location d’espaces"
        href="/signup?plan=free"
        text="Créer un compte Free puis choisir le template Location d’espaces (services_spaces) dans la famille Services professionnels. Type Formulaire, nom par défaut « Funnel espaces ». Le template ne crée ni espaces ni règles, et ne pose pas le nombre de personnes. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
