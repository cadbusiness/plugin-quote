import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title:
    "Funnel de devis chapiteau et agence événementielle : structure, jauge, terrain et dates, une demande complète avant le devis",
  description:
    "Landing SEO loueurs de chapiteaux, tentes et structures, agences événementielles : le template Chapiteaux & agence de QuoteBuilder tel qu'il existe, les questions à ajouter (nombre de personnes, configuration, terrain, accès, dates de montage), la réglementation CTS, le catalogue de structures et d'options, les règles Si/Alors, le score Cold, la photo du terrain, l'option et l'annulation. Sans fonction inventée.",
  path: "/secteurs/funnel-devis-chapiteau-agence-evenementielle",
});

const FAQ = [
  {
    q: "Existe-t-il un template chapiteau ou agence événementielle dans QuoteBuilder ?",
    a: "Oui, « Chapiteaux & agence », dans la famille « Location & événementiel ». Il crée un funnel de type Formulaire nommé « Funnel événementiel », en quatre étapes : Votre événement, Solutions recommandées, Personnalisation, Vos coordonnées.",
  },
  {
    q: "Quelles questions le template pose-t-il ?",
    a: "Trois questions à la première étape : Type d’événement (Chapiteau / structure, Séminaire / soirée, Privé, Autre), Durée (1 jour, Quelques jours, 1 mois et +) et Date ou lieu, en texte libre facultatif. Les autres étapes proposent les produits, les quantités et options, puis les coordonnées.",
  },
  {
    q: "Le template demande-t-il le nombre de personnes ?",
    a: "Non, malgré le sous-titre « Jauge, lieu et durée ». Ajoutez une question de type Mesure, unité « personnes », requise. C'est elle qui permet de suggérer la bonne structure avec une règle « est au moins » ou « est au plus ».",
  },
  {
    q: "Peut-on demander la date de l'événement avec un calendrier ?",
    a: "Non, il n'existe pas de type de question Date. Ajoutez une question Texte « Date de l'événement », que le client remplit en clair, et une question séparée pour les jours de montage si vous en avez besoin.",
  },
  {
    q: "QuoteBuilder vérifie-t-il la disponibilité des chapiteaux ?",
    a: "Non. QuoteBuilder n'a ni planning, ni calendrier, ni stock. L'étape « Solutions recommandées » propose les produits de votre catalogue selon vos règles. La disponibilité se vérifie dans votre outil de planning, puis se confirme au client.",
  },
  {
    q: "Le client peut-il envoyer une photo du terrain ?",
    a: "Oui. À l'étape Personnalisation, dans la zone « Plan (PDF ou image) », ou dans une question Fichier que vous ajoutez. Après l'envoi, il peut aussi ajouter un fichier depuis son espace prospect. Le scénario d'Autopilote par défaut lui demande d'ailleurs une photo deux jours après sa demande, si le dossier est encore ouvert.",
  },
  {
    q: "Peut-on poser des questions de terrain seulement pour un chapiteau ?",
    a: "Non, le funnel ne branche pas selon les réponses : toutes les questions s'affichent dans le même ordre pour tout le monde. Formulez les questions de terrain pour qu'elles restent compréhensibles, et laissez-les facultatives avec un choix « Je ne sais pas ».",
  },
  {
    q: "Pourquoi toutes les demandes sont-elles Cold ?",
    a: "Le score vient d'une formule fixe qui ne lit pas les questions de ce template ni celles que vous ajoutez. Toutes les demandes sortent à 30 points, Cold. Triez à la main sur la date, le nombre de personnes et le budget.",
  },
  {
    q: "QuoteBuilder gère-t-il l'option, l'acompte et l'annulation ?",
    a: "Non. Il n'y a pas de blocage de date, pas d'encaissement ni de facture. Écrivez vos conditions (durée de l'option, acompte ou arrhes, annulation, météo) dans la description de vos produits et dans votre devis final, et notez l'option posée dans une note interne du dossier.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes, sans carte. Le détail des plans est sur la page [tarifs](https://www.quotebuilder.co/tarifs).",
  }
];

export default function ChapiteauAgenceLandingPage() {
  const body = loadPostBody("funnel-devis-chapiteau-agence-evenementielle");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis chapiteau et agence événementielle : structure, jauge, terrain et dates, une demande complète avant le devis",
    url: `${SITE_URL}/secteurs/funnel-devis-chapiteau-agence-evenementielle`,
    about: "Chapiteaux, tentes, structures et agence événementielle",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            {"Secteur · Chapiteaux et événementiel"}
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis chapiteau et agence événementielle : structure, jauge, terrain et dates, une demande complète avant le devis
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            {
              "Type d'événement, durée, date ou lieu. Le template Chapiteaux & agence les pose. Le nombre de personnes, le terrain et les dates de montage s'ajoutent. Une demande déjà complète avant le devis."
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
                href: "/blog/delai-livraison-penalites-retard-execution-devis-b2b",
                t: "Délai et pénalités de retard",
                d: "Date, franchise, taux et plafond. Ce qu'il faut écrire dans le devis avant la livraison.",
              },
              {
                href: "/outils/calculateur-penalites-retard-livraison",
                t: "Calculateur de pénalités de retard",
                d: "Jours pénalisés, plafond, montant dû et part de la commande. Le calcul se fait dans le navigateur.",
              },
              {
                href: "/blog/regles-suggestion-produits-funnel-devis-b2b",
                t: "Règles Si/Alors",
                d: "Conditions ET, trois suggestions au plus. Le type d'événement choisit les structures.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Photo du terrain ou plan en PDF ou image, 10 Mo.",
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
        title="Essayer le template Chapiteaux & agence"
        href="/signup?plan=free"
        text="Créer un compte Free puis choisir le template Chapiteaux & agence (events_venue) dans la famille Location & événementiel. Type Formulaire, nom par défaut « Funnel événementiel ». Le template ne crée ni structures ni règles, et ne pose pas le nombre de personnes. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
