import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis laboratoire et façonnage : des demandes de fabrication à façon chiffrables",
  description:
    "Landing SEO laboratoires, façonniers cosmétiques et fabricants à façon : funnel de devis (type de besoin, contrainte, volume, échéance, MOQ, conditionnement, formule), template Labos & fabrication de QuoteBuilder tel qu'il existe, prix par lot, règles de suggestion, fichiers, relecture R&D et qualité, cadre du règlement cosmétique. Sans barème inventé.",
  path: "/secteurs/funnel-devis-laboratoire-faconnage-cosmetique",
});

const FAQ = [
  {
    q: "Existe-t-il un template laboratoire dans QuoteBuilder ?",
    a: "Oui : « Labos & fabrication », dans la famille Industrie & fabrication, nommé par défaut « Funnel labo ». Il crée l'étape Votre fabrication, puis Solutions recommandées, Personnalisation et Vos coordonnées.",
  },
  {
    q: "Le template demande-t-il si le client a déjà une formule ?",
    a: "Non. Ajoutez une liste « J'ai ma formule », « Partir d'une base existante », « À développer ».",
  },
  {
    q: "Peut-on choisir plusieurs contraintes ?",
    a: "La « Contrainte principale » du template est à choix unique. Ajoutez une question à choix multiple pour les exigences complémentaires.",
  },
  {
    q: "Peut-on bloquer les demandes sous notre minimum de commande ?",
    a: "Non. Annoncez le minimum dans le sous-titre de l'étape et dans le nom des prestations.",
  },
  {
    q: "Le prospect peut-il envoyer un cahier des charges ?",
    a: "Oui, à l'étape Personnalisation ou depuis son espace prospect, en PDF ou en image jusqu'à 10 Mo.",
  },
  {
    q: "Peut-on faire signer un accord de confidentialité dans le funnel ?",
    a: "Non. Indiquez dans le sous-titre que la formule détaillée viendra après accord, et demandez d'abord une liste d'ingrédients.",
  },
  {
    q: "Peut-on gérer un prix dégressif selon le volume ?",
    a: "Pas automatiquement. Créez une prestation par palier ou par lot, ou utilisez une fourchette.",
  },
  {
    q: "Les prix sont-ils HT ?",
    a: "QuoteBuilder ne gère pas la TVA et n'affiche ni HT ni TTC. Précisez « HT » dans le nom ou la description des prestations.",
  },
  {
    q: "Le score aide-t-il à trier les demandes de façonnage ?",
    a: "Non. Le template ne contient aucune question lue par le score : chaque dossier reçoit 30 points, Cold.",
  },
  {
    q: "Le funnel vérifie-t-il la conformité réglementaire du produit ?",
    a: "Non. Il recueille les informations utiles à votre conseil, par exemple qui sera la personne responsable au sens du règlement cosmétique.",
  },
];

export default function LaboratoireFaconnageLandingPage() {
  const body = loadPostBody("funnel-devis-laboratoire-faconnage-cosmetique");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis laboratoire et façonnage : des demandes de fabrication à façon chiffrables",
    url: `${SITE_URL}/secteurs/funnel-devis-laboratoire-faconnage-cosmetique`,
    about: "Laboratoire, façonnage cosmétique, formule, volume, conditionnement",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Laboratoire et façonnage
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis laboratoire et façonnage : des demandes de fabrication à façon chiffrables
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de besoin, contrainte, volume, échéance. Le template Labos &amp; fabrication les pose. Formule,
            contenant et minimum de commande s&apos;ajoutent. Un brief chiffrable, puis une relecture R&amp;D.
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
                d: "Ordre fixe : type de besoin, contrainte, volume, échéance. Formule et contenant s'ajoutent.",
              },
              {
                href: "/fonctionnalites/catalogue",
                t: "Catalogue",
                d: "Prix fixe, fourchette ou sur devis. Pas de prix dégressif. Pas de TVA.",
              },
              {
                href: "/fonctionnalites/demandes",
                t: "Demandes",
                d: "Dossier Labos & fabrication : 30 points, Cold. Sept statuts.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Fichiers PDF ou image, 10 Mo. Le cahier des charges peut arriver après l'envoi.",
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
        title="Partir du template Labos & fabrication"
        text="Créer un compte Free puis choisir le template Labos & fabrication dans la famille Industrie & fabrication. Type Formulaire, nom par défaut « Funnel labo ». Le template ne crée ni produits ni règles. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
