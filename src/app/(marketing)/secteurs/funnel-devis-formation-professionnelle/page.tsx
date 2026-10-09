import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis formation professionnelle : des demandes avec objectif, public, format et financement",
  description:
    "Landing SEO organismes de formation et formateurs B2B : funnel de demande de devis formation (intra, inter, distanciel), template Formation de QuoteBuilder tel qu'il existe, questions à ajouter (participants, niveau, dates, financement), catalogue de programmes, prix par participant ou par session, règles de suggestion, convention et devis approuvé (article D6353-1), Qualiopi. Sans barème inventé.",
  path: "/secteurs/funnel-devis-formation-professionnelle",
});

const FAQ = [
  {
    q: "Existe-t-il un template formation dans QuoteBuilder ?",
    a: "Oui, le template « Formation », dans la famille Services professionnels. Il crée un formulaire nommé « Funnel formation » en quatre étapes.",
  },
  {
    q: "Le template demande-t-il le nombre de participants ?",
    a: "Non. Il demande le format, un contexte et une échéance. Ajoutez une question de type nombre pour les participants.",
  },
  {
    q: "Peut-on afficher un prix par participant ?",
    a: "Oui. Mettez le prix d'une place sur le produit : la quantité choisie par le prospect sert de nombre de participants, et le montant de la ligne est prix × quantité.",
  },
  {
    q: "Peut-on faire un tarif dégressif selon le nombre de participants ?",
    a: "Non, il n'y a pas de prix dégressif. Utilisez une fourchette large, un produit « forfait groupe » distinct, ou une règle qui le propose au-delà d'un nombre de participants.",
  },
  {
    q: "Le funnel peut-il poser des questions différentes pour l'intra et l'inter ?",
    a: "Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les programmes suggérés. Formulez des questions valables dans les deux cas.",
  },
  {
    q: "Le récapitulatif peut-il servir de convention de formation ?",
    a: "Non. Il n'a ni signature, ni validité, ni TVA. L'article D6353-1 permet qu'un devis approuvé tienne lieu de convention s'il contient les mentions prévues : c'est votre devis définitif qui doit les porter.",
  },
  {
    q: "Le client peut-il envoyer un cahier des charges ?",
    a: "Oui, par la zone « Plan (PDF ou image) » de l'étape Personnalisation, en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo.",
  },
  {
    q: "Pourquoi mes dossiers formation sont-ils toujours Cold ?",
    a: "Le score lit des questions que le template ne contient pas et ignore le champ Contexte. Tous les dossiers reçoivent 30 points. Triez sur l'échéance et le nombre de participants.",
  },
  {
    q: "QuoteBuilder gère-t-il la TVA ou l'exonération des formations ?",
    a: "Non. QuoteBuilder ne gère pas la TVA : aucun montant HT ou TTC, aucune mention d'exonération. Traitez-la dans votre devis et votre convention.",
  },
  {
    q: "Faut-il être certifié Qualiopi pour utiliser ce funnel ?",
    a: "Non, le funnel fonctionne pour tout organisme. La certification concerne les prestataires financés par les fonds publics ou mutualisés visés par l'article L6316-1 du Code du travail.",
  },
];

export default function FormationProfessionnelleLandingPage() {
  const body = loadPostBody("funnel-devis-formation-professionnelle");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis formation professionnelle : des demandes avec objectif, public, format et financement",
    url: `${SITE_URL}/secteurs/funnel-devis-formation-professionnelle`,
    about: "Formation professionnelle, intra, inter, participants, financement",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Formation professionnelle
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis formation professionnelle : des demandes avec objectif, public, format et financement
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Format, contexte, échéance. Le template Formation les pose. Participants, niveau et financement
            s&apos;ajoutent. Un brief chiffrable, puis un devis qui peut tenir lieu de convention.
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
                d: "Ordre fixe : format, contexte, échéance. Participants et financement s'ajoutent.",
              },
              {
                href: "/fonctionnalites/catalogue",
                t: "Catalogue",
                d: "Prix fixe, fourchette ou sur devis. Quantité × prix. Pas de dégressif. Pas de TVA.",
              },
              {
                href: "/fonctionnalites/demandes",
                t: "Demandes",
                d: "Dossier Formation : 30 points, Cold. Sept statuts.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Cahier des charges en PDF ou image, 10 Mo, zone « Plan (PDF ou image) ».",
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
        title="Partir du template Formation"
        text="Créer un compte Free puis choisir le template Formation dans la famille Services professionnels. Type Formulaire, nom par défaut « Funnel formation ». Le template ne crée ni programmes ni règles, et ne pose pas le nombre de participants. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
