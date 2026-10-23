import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title:
    "Funnel de devis logiciel sur mesure : besoin, existant, intégrations et budget, une demande chiffrable avant le premier rendez-vous",
  description:
    "Landing SEO studios, éditeurs et développeurs de logiciels sur mesure : le template Logiciel sur mesure de QuoteBuilder tel qu'il existe, les questions à ajouter (utilisateurs, existant, intégrations, données, hébergement, budget), le forfait par lots, la recette et la garantie corrective, la propriété du code, le contrat RGPD, le catalogue d'approches, les règles Si/Alors, le score Cold et le cahier des charges en PDF. Sans fonction inventée.",
  path: "/secteurs/funnel-devis-logiciel-sur-mesure",
});

const FAQ = [
  {
    q: "Existe-t-il un template logiciel sur mesure dans QuoteBuilder ?",
    a: "Oui, « Logiciel sur mesure », dans la famille Tech & services. Son identifiant est `tech_software`. Il crée un formulaire « Funnel logiciel » en quatre étapes.",
  },
  {
    q: "Quels types de besoin le template propose-t-il ?",
    a: "Nouveau produit, Refonte, Intégration et Autre, en choix visuel obligatoire. Viennent ensuite un champ Contexte facultatif et une Échéance.",
  },
  {
    q: "Le template demande-t-il le nombre d'utilisateurs ?",
    a: "Non. La présentation parle de volume, mais aucune question ne le demande. Ajoutez une liste « Nombre d'utilisateurs » dans le constructeur.",
  },
  {
    q: "Le client peut-il joindre un cahier des charges ?",
    a: "Oui, à l'étape Personnalisation, dans la zone « Plan (PDF ou image) » : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Pas de Word, de tableur ni de zip.",
  },
  {
    q: "Peut-on poser des questions différentes pour une refonte et une intégration ?",
    a: "Non. Le funnel n'a pas de branchement : toutes les questions s'affichent pour tous. Les règles Si/Alors changent seulement les produits suggérés.",
  },
  {
    q: "Pourquoi toutes les demandes sont-elles Cold ?",
    a: "La formule du score part de 30 et ne lit ni le type de besoin, ni le champ Contexte, ni les questions ajoutées. Chaque demande de ce template vaut 30 points. Ce n'est pas réglable.",
  },
  {
    q: "Peut-on montrer nos conditions de garantie au client ?",
    a: "Oui, par un document « Garantie » (lien et libellé) dans la section Mode d'emploi de la fiche produit. Il s'affiche sur la carte produit à l'étape Personnalisation. Il n'apparaît pas sur le PDF.",
  },
  {
    q: "QuoteBuilder gère-t-il le contrat, la cession de droits ou le contrat RGPD ?",
    a: "Non. Ces documents se rédigent dans vos outils, avec votre conseil. QuoteBuilder sert à recevoir une demande complète avant de chiffrer.",
  },
  {
    q: "La DSI peut-elle voir la demande ?",
    a: "Oui, si le client l'invite comme relectrice depuis son espace prospect. Elle reçoit un lien de 30 jours et peut consulter, commenter, indiquer un budget maximum, valider ou demander des modifications.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes, sans carte. Le détail est sur la page [tarifs](https://www.quotebuilder.co/tarifs).",
  },
];

export default function LogicielSurMesureLandingPage() {
  const body = loadPostBody("funnel-devis-logiciel-sur-mesure");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis logiciel sur mesure : besoin, existant, intégrations et budget, une demande chiffrable avant le premier rendez-vous",
    url: `${SITE_URL}/secteurs/funnel-devis-logiciel-sur-mesure`,
    about: "Logiciel sur mesure",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            {"Secteur · Logiciel sur mesure"}
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis logiciel sur mesure : besoin, existant, intégrations et budget, une demande chiffrable avant
            le premier rendez-vous
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            {
              "Type de besoin, contexte, échéance. Le template Logiciel sur mesure les pose. Le nombre d'utilisateurs, l'existant et les intégrations s'ajoutent. Une demande chiffrable avant le premier rendez-vous."
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
                href: "/blog/garantie-vices-caches-sav-devis-b2b",
                t: "Garantie et SAV dans un devis B2B",
                d: "Vices cachés, garantie contractuelle, clauses limitatives et coût à prévoir.",
              },
              {
                href: "/outils/calculateur-cout-garantie-sav-devis",
                t: "Calculateur de coût de garantie",
                d: "Provision par vente, part du prix et de la marge. Le calcul se fait dans le navigateur.",
              },
              {
                href: "/secteurs/funnel-devis-agence-web-esn",
                t: "Agence web et ESN",
                d: "Forfait, régie et cession, pour le temps vendu à côté du logiciel sur mesure.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Le client invite un relecteur. Lien de 30 jours, commentaire, budget, validation.",
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
        title="Essayer le template Logiciel sur mesure"
        href="/signup?plan=free"
        text="Créer un compte Free puis choisir le template Logiciel sur mesure (tech_software) dans la famille Tech & services. Type Formulaire, nom par défaut « Funnel logiciel ». Le template ne crée ni produits ni règles, et ne demande pas le nombre d'utilisateurs. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
