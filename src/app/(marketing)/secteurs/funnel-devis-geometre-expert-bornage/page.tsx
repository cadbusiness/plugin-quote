import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title:
    "Funnel de devis géomètre-expert : bornage, division, topographie, une demande avec la parcelle avant le premier appel",
  description:
    "Landing SEO géomètres-experts et cabinets de topographie : template Géomètre de QuoteBuilder, questions à ajouter (parcelle, motif, bornes, voisins), catalogue de prestations, règles Si/Alors par type de levé, score Cold, extrait cadastral en PDF, relecteurs. Sans fonction inventée.",
  path: "/secteurs/funnel-devis-geometre-expert-bornage",
});

const FAQ = [
  {
    q: "Existe-t-il un template géomètre dans QuoteBuilder ?",
    a: "Oui. Le template « Géomètre », identifiant property_surveyor, dans la famille Immobilier et construction. Il crée un formulaire nommé « Funnel géomètre », en quatre étapes.",
  },
  {
    q: "Quels types de levé le template propose-t-il ?",
    a: "Bornage / division, Topographie, Copropriété et Autre, en choix visuel obligatoire. Viennent ensuite un champ Contexte facultatif et une Échéance. Les prestations elles-mêmes viennent de votre catalogue, via des règles que vous écrivez.",
  },
  {
    q: "Peut-on poser des questions différentes pour un bornage et pour un plan topographique ?",
    a: "Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les prestations suggérées. Posez des questions compréhensibles dans tous les cas, ou faites deux funnels.",
  },
  {
    q: "Pourquoi les demandes sont-elles Cold ?",
    a: "La formule part de 30 et ne lit pas le type de levé, ni le champ Contexte (clé notes), ni l'échéance. Tel quel, chaque demande vaut 30 points, donc cold. Une question dont la clé est surface peut faire bouger le score. Ce n'est pas un réglage.",
  },
  {
    q: "Le client peut-il joindre un extrait cadastral ?",
    a: "Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Plus tard, le contact principal peut ajouter un fichier depuis « Compléter la demande » sur son espace prospect.",
  },
  {
    q: "Un cabinet de topographie peut-il utiliser ce template ?",
    a: "Oui, mais les plans de bornage et de division sont réservés aux géomètres-experts inscrits à l'Ordre par la loi du 7 mai 1946. Un cabinet qui n'est pas inscrit retire le choix Bornage / division et le remplace par ses propres prestations.",
  },
  {
    q: "QuoteBuilder vérifie-t-il la parcelle ou le cadastre ?",
    a: "Non. Il enregistre ce que le client écrit. Il ne consulte pas le cadastre, ne vérifie pas que le demandeur est propriétaire et ne retrouve pas d'ancien bornage.",
  },
  {
    q: "Les voisins peuvent-ils être invités sur la demande ?",
    a: "Le client peut inviter des relecteurs, avec un lien de 30 jours. Mais la convocation des voisins et le procès-verbal de bornage se font hors de QuoteBuilder, selon vos procédures. Ce ne sont pas des relecteurs.",
  },
  {
    q: "Les options changent-elles le prix ?",
    a: "Non. Le montant d'une ligne est le prix unitaire multiplié par la quantité. Une variante qui coûte plus cher est un autre produit, ou une fourchette plus large.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes. Le détail des plans est sur la page Tarifs.",
  },
];

export default function GeometreExpertBornageLandingPage() {
  const body = loadPostBody("funnel-devis-geometre-expert-bornage");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis géomètre-expert : bornage, division, topographie, une demande avec la parcelle avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-geometre-expert-bornage`,
    about: "Géomètre-expert, bornage, division, topographie",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Géomètre-expert
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis géomètre-expert : bornage, division, topographie, une demande avec la parcelle avant le
            premier appel
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de levé, contexte, échéance. Le template Géomètre les pose. Parcelle, motif et voisins
            s&apos;ajoutent. Un brief technique, puis un devis rédigé à part.
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
                href: "/blog/devis-payant-etude-prealable-b2b",
                t: "Devis payant",
                d: "Annoncer l'étude avant le chiffrage, la déduire ou non, et ce que ça change sur les demandes.",
              },
              {
                href: "/outils/calculateur-devis-payant-etude-prealable",
                t: "Calculateur",
                d: "Études facturées, temps récupéré, contrats perdus. Le bilan se calcule dans le navigateur.",
              },
              {
                href: "/blog/regles-suggestion-produits-funnel-devis-b2b",
                t: "Règles Si/Alors",
                d: "Conditions ET, trois suggestions au plus. Le type de levé choisit les prestations.",
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
        title="Essayer le template Géomètre"
        text="Créer un compte Free puis choisir le template Géomètre (property_surveyor) dans la famille Immobilier et construction. Type Formulaire, nom par défaut « Funnel géomètre ». Le template ne crée ni prestations ni règles, et ne pose pas la parcelle. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
