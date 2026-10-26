import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title:
    "Funnel de devis nettoyage et propreté en entreprise : locaux, surface, fréquence, horaires et reprise du personnel, une demande chiffrable avant la visite",
  description:
    "Landing SEO entreprises de propreté et de nettoyage de locaux professionnels : les questions à poser avant la visite (type de locaux, surface, fréquence, horaires, prestations, accès, prestataire en place, durée), la reprise du personnel prévue par la convention collective de la propreté, l'attestation de vigilance, le plan de prévention, la durée et la reconduction du contrat, et comment monter ce funnel dans QuoteBuilder à partir du Questionnaire générique. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-nettoyage-proprete-entreprise",
});

const FAQ = [
  {
    q: "Existe-t-il un template nettoyage dans QuoteBuilder ?",
    a: "Non. On part du « Questionnaire générique », dans la famille « Sur mesure », et on ajoute ses propres questions : type de demande, type de locaux, surface, fréquence, horaires, prestations, accès, prestataire actuel, durée.",
  },
  {
    q: "Quelles questions le Questionnaire générique pose-t-il au départ ?",
    a: "Deux : « Quel est votre projet ? », un champ texte obligatoire, et « Échéance », une liste facultative (Dès que possible, Dans le mois, Ce trimestre, Je me renseigne). Viennent ensuite les produits suggérés, la personnalisation et les coordonnées.",
  },
  {
    q: "Peut-on afficher un prix mensuel ?",
    a: "Pas en tant que tel. Un produit a un prix fixe, une fourchette ou « Sur devis », sans période. Écrivez « par mois » dans le nom ou la description du produit, et calculez le montant du contrat dans votre devis final.",
  },
  {
    q: "Le client peut-il envoyer un plan ou des photos des locaux ?",
    a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Il peut aussi compléter sa demande plus tard depuis son espace prospect.",
  },
  {
    q: "Peut-on poser des questions différentes pour un entretien régulier et une remise en état ?",
    a: "Non, le funnel n'a pas de branchement : toutes les questions s'affichent dans le même ordre. Prévoyez un choix « Ponctuel » ou « Sans objet » dans les listes. Les règles Si/Alors, elles, proposent des produits différents selon le type de demande.",
  },
  {
    q: "Pourquoi toutes les demandes sont-elles Cold ?",
    a: "Parce que la formule du score ne lit pas les questions que vous ajoutez, et que la question texte du Questionnaire générique vaut rarement l'une des valeurs qu'elle reconnaît. C'est la formule, fixe, pas un jugement sur la demande.",
  },
  {
    q: "Dois-je reprendre le personnel du prestataire sortant ?",
    a: "Si vous appliquez la convention collective de la propreté (IDCC 3043), l'article 7.2 oblige l'entreprise entrante à garantir l'emploi du personnel affecté au marché qui remplit ses conditions, notamment six mois d'affectation en CDI à la date d'expiration du contrat. Demandez la liste avant de chiffrer et faites vérifier votre cas.",
  },
  {
    q: "Le client doit-il me demander une attestation de vigilance ?",
    a: "Oui, pour tout contrat d'au moins 5 000 € HT, à la signature puis tous les six mois jusqu'à la fin du contrat (articles L8222-1 et D8222-5 du Code du travail). Le seuil s'apprécie sur le montant global du contrat.",
  },
  {
    q: "QuoteBuilder gère-t-il la durée et la reconduction du contrat ?",
    a: "Non. Il n'y a ni champ durée, ni reconduction, ni préavis. Vous pouvez demander la durée souhaitée dans le funnel et noter les conditions convenues dans une note interne. La clause s'écrit dans votre contrat.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le Questionnaire générique se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes, sans carte. Le détail est sur la page [tarifs](https://www.quotebuilder.co/tarifs).",
  },
];

export default function NettoyagePropreteLandingPage() {
  const body = loadPostBody("funnel-devis-nettoyage-proprete-entreprise");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis nettoyage et propreté en entreprise : locaux, surface, fréquence, horaires et reprise du personnel, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-nettoyage-proprete-entreprise`,
    about: "Nettoyage et propreté, locaux professionnels, surface, fréquence, horaires, reprise du personnel",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Nettoyage et propreté
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis nettoyage et propreté en entreprise : locaux, surface, fréquence, horaires et reprise du
            personnel, une demande chiffrable avant la visite
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de locaux, surface, fréquence, horaires, prestataire en place et durée. Une demande chiffrable avant
            la visite, à partir du Questionnaire générique.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
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
                href: "/blog/reconduction-tacite-preavis-resiliation-devis-b2b",
                t: "Reconduction et préavis",
                d: "Durée, renouvellement, résiliation et rupture brutale dans un devis B2B.",
              },
              {
                href: "/outils/calculateur-preavis-reconduction-tacite",
                t: "Calculateur de préavis",
                d: "Date limite pour dénoncer, fin effective et montant encore engagé.",
              },
              {
                href: "/blog/visite-technique-avant-devis-b2b",
                t: "Visite technique",
                d: "Décider si la visite vaut le déplacement, et arriver avec les bonnes questions.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Lien, code PIN, relecteurs et compléments de demande.",
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
        title="Essayer gratuitement"
        text="Posez type de locaux, surface, fréquence, horaires et prestataire en place dans un ordre fixe. Il n’y a pas de template nettoyage. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
