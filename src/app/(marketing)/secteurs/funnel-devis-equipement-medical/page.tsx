import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const TITLE =
  "Funnel de devis équipement médical : cabinet, clinique, EHPAD, une demande cadrée avant le premier rendez-vous";

const DESCRIPTION =
  "Landing SEO distributeurs et fabricants d'équipement médical : template Équipement médical de QuoteBuilder, questions à ajouter (projet, matériel, nombre de salles ou de lits, échéance, maintenance, décideurs), surface à passer en Mesure pour le score, catalogue, règles Si/Alors, plan du local en PDF, relecteurs biomédical et achats, données de santé à ne pas demander. Sans fonction inventée.";

const INTRO =
  "Type d'espace, surface, contraintes. Le template Équipement médical les pose. Projet, matériel, nombre de salles, échéance et maintenance s'ajoutent. Un brief avant le premier rendez-vous, puis un devis rédigé à part.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/secteurs/funnel-devis-equipement-medical",
});

const FAQ = [
  {
    q: "Existe-t-il un template équipement médical dans QuoteBuilder ?",
    a: "Oui. Le template « Équipement médical », identifiant health_equipment, dans la famille Santé et bien-être. Il crée un formulaire nommé « Funnel équipement médical », en quatre étapes.",
  },
  {
    q: "Quelles questions le template pose-t-il ?",
    a: "Le type d'espace en choix visuel obligatoire (Cabinet, Clinique / bloc, Domicile / EHPAD, Autre), la surface ou le volume en texte facultatif, et les contraintes en choix multiple facultatif (Accès / livraison, Norme ou agrément, Hauteur limitée, Aucune particulière). Les produits viennent de votre catalogue, via des règles que vous écrivez.",
  },
  {
    q: "Le template demande-t-il une échéance ?",
    a: "Non. Il n'a pas de question d'échéance. Ajoutez une liste « Échéance » à la première étape, par exemple Dès que possible, Dans le mois, Ce trimestre, Je me renseigne.",
  },
  {
    q: "Pourquoi la surface ne compte-t-elle pas dans le score ?",
    a: "Parce qu'elle est posée en texte et que le client écrit souvent « 80 m² ». Le score lit la clé surface comme un nombre : seul un nombre seul est pris en compte. Passez la question en type Mesure dans le constructeur, la clé surface est conservée.",
  },
  {
    q: "Peut-on poser des questions différentes pour un cabinet et pour un EHPAD ?",
    a: "Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les produits suggérés. Posez des questions compréhensibles dans tous les cas, laissez facultatives celles qui ne concernent qu'un type d'espace, ou faites deux funnels.",
  },
  {
    q: "Le client peut-il joindre un plan du local ?",
    a: "Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Pas de DWG ni de zip. Plus tard, le contact principal peut ajouter un fichier, dans les mêmes formats, depuis « Compléter la demande » sur son espace prospect.",
  },
  {
    q: "Le service biomédical ou les achats peuvent-ils voir la demande ?",
    a: "Oui, si le client les invite comme relecteurs depuis son espace prospect. Chacun reçoit un lien de 30 jours. Ils peuvent consulter, commenter, indiquer un budget maximum, valider ou demander des modifications. Ce n'est pas une signature.",
  },
  {
    q: "Peut-on proposer un contrat de maintenance dans le funnel ?",
    a: "Oui, comme un produit du catalogue, avec une fourchette et une description qui dit ce qu'il comprend. Le contrat lui-même, ses conditions et la répartition des responsabilités se rédigent hors de QuoteBuilder.",
  },
  {
    q: "Faut-il demander des informations sur les patients ?",
    a: "Non. Le devis n'en a pas besoin. Demandez le type de matériel, les dimensions, l'accès et la date, et écrivez « sans information sur les patients » dans le libellé des champs texte. Les notes internes restent factuelles, sans donnée de santé.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes. Le détail des plans est sur la page Tarifs.",
  },
];

export default function EquipementMedicalLandingPage() {
  const body = loadPostBody("funnel-devis-equipement-medical");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/secteurs/funnel-devis-equipement-medical`,
    about: "Équipement médical, cabinet, clinique, EHPAD",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Équipement médical
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{TITLE}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{INTRO}</p>
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
                href: "/blog/analyser-devis-perdus-motifs-perte-b2b",
                t: "Devis perdus",
                d: "Noter le motif, compter les pertes, puis une revue trimestrielle.",
              },
              {
                href: "/outils/analyseur-motifs-devis-perdus",
                t: "Analyseur",
                d: "Taux de gain, répartition des motifs, et ce que rapporterait d'en récupérer une partie.",
              },
              {
                href: "/blog/regles-suggestion-produits-funnel-devis-b2b",
                t: "Règles Si/Alors",
                d: "Conditions ET, trois suggestions au plus. Le type d'espace choisit les produits.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Plan du local en PDF ou image, 10 Mo. Relecteurs avec un lien de 30 jours.",
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
        title="Essayer le template Équipement médical"
        text="Créer un compte Free puis choisir le template Équipement médical (health_equipment) dans la famille Santé et bien-être. Type Formulaire, nom par défaut « Funnel équipement médical ». Le template ne crée ni produits ni règles, et ne pose ni l'échéance ni la maintenance. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
