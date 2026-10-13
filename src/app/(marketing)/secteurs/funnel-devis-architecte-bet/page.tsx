import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis architecte et BET : une demande avec le type de mission, pas un appel à vide",
  description:
    "Landing SEO architectes et bureaux d'études : template Architecte / BET de QuoteBuilder, questions à ajouter, catalogue de missions, règles Si/Alors, score Cold, plan PDF, relecteurs. Sans fonction inventée.",
  path: "/secteurs/funnel-devis-architecte-bet",
});

const FAQ = [
  {
    q: "Existe-t-il un template architecte dans QuoteBuilder ?",
    a: "Oui. Le template « Architecte / BET », identifiant property_architect, dans la famille Immobilier et construction. Il crée un formulaire nommé « Funnel architecte », en quatre étapes.",
  },
  {
    q: "Quelles missions le template propose-t-il ?",
    a: "Aucune. Il pose le type de mission (Conception / PC, Suivi de chantier, Étude / BET, Autre), un contexte et une échéance. Les missions viennent de votre catalogue, via des règles que vous écrivez.",
  },
  {
    q: "Peut-on afficher des questions différentes pour le permis et pour le BET ?",
    a: "Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les missions suggérées. Posez des questions compréhensibles dans les quatre cas, ou faites deux funnels.",
  },
  {
    q: "Pourquoi les dossiers sont-ils Cold ?",
    a: "La formule part de 30 et ne lit pas le type de mission, ni le champ Contexte (clé notes), ni l'échéance. Tel quel, chaque demande vaut 30 points, donc cold. Une question dont la clé est surface peut faire bouger le score. Ce n'est pas un réglage.",
  },
  {
    q: "Le client peut-il joindre un plan ?",
    a: "Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Il n'y a pas de champ texte libre sur cette étape. Plus tard, le contact principal peut ajouter un fichier depuis « Compléter la demande ».",
  },
  {
    q: "Les options changent-elles le prix ?",
    a: "Non. Le montant d'une ligne est le prix unitaire multiplié par la quantité. Une option qui doit changer les honoraires est un autre produit, ou une fourchette.",
  },
  {
    q: "Le récapitulatif peut-il servir de contrat de maîtrise d'œuvre ?",
    a: "Non. Il n'a ni signature en ligne, ni date de validité, ni TVA. Le contrat se rédige à part. Les relecteurs ont un lien de 30 jours pour consulter et commenter, pas pour signer à votre place.",
  },
  {
    q: "QuoteBuilder vérifie-t-il l'obligation de recourir à un architecte ?",
    a: "Non. La loi du 3 janvier 1977 et son décret fixent les cas et les seuils. Le funnel peut demander une surface et la qualité du maître d'ouvrage. Il ne conclut pas à votre place.",
  },
  {
    q: "Les notes internes sont-elles modifiables ?",
    a: "On ajoute une note en texte brut. L'écran l'affiche ensuite telle qu'elle a été écrite, sans édition. Elles restent internes à l'équipe.",
  },
  {
    q: "Faut-il un plan Pro pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de soumissions. Le détail des plans est sur la page Tarifs. Le template lui-même n'est pas réservé à un métier payant.",
  },
];

export default function ArchitecteBetLandingPage() {
  const body = loadPostBody("funnel-devis-architecte-bet");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis architecte et BET : une demande avec le type de mission, pas un appel à vide",
    url: `${SITE_URL}/secteurs/funnel-devis-architecte-bet`,
    about: "Architecte, bureau d'études, mission, permis, suivi de chantier",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Architecte / BET
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis architecte et BET : une demande avec le type de mission, pas un appel à vide
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de mission, contexte, échéance. Le template Architecte / BET les pose. Surface, lieu et
            maître d&apos;ouvrage s&apos;ajoutent. Un brief de mission, puis un contrat rédigé à part.
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
                d: "Ordre fixe : type de mission, contexte, échéance. Surface et lieu s'ajoutent.",
              },
              {
                href: "/fonctionnalites/catalogue",
                t: "Catalogue",
                d: "Prix fixe, fourchette ou sur devis. Quantité × prix. Les options ne changent pas le montant.",
              },
              {
                href: "/fonctionnalites/demandes",
                t: "Demandes",
                d: "Dossier Architecte / BET : 30 points, Cold, tant que la formule ne trouve pas ses clés.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Plan en PDF ou image, 10 Mo. Relecteurs avec un lien de 30 jours.",
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
        title="Essayer le template Architecte / BET"
        text="Créer un compte Free puis choisir le template Architecte / BET (property_architect) dans la famille Immobilier et construction. Type Formulaire, nom par défaut « Funnel architecte ». Le template ne crée ni missions ni règles, et ne pose pas la surface. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
