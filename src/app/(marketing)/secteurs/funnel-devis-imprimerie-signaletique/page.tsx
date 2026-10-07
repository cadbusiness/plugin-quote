import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis imprimerie et signalétique : des demandes avec format, quantité et fichier",
  description:
    "Landing SEO imprimeurs, studios et fabricants de signalétique : funnel de devis impression (support, format, quantité, finition, fichier, pose), template Studio & imprimerie QuoteBuilder tel qu'il existe, prix par lot et fourchette indicative, règles de suggestion, fichiers lourds, relecture et rappel. Sans barème inventé.",
  path: "/secteurs/funnel-devis-imprimerie-signaletique",
});

const FAQ = [
  {
    q: "Existe-t-il un template imprimerie dans QuoteBuilder ?",
    a: "Oui : « Studio & imprimerie », dans la famille Services professionnels, nommé par défaut « Funnel studio ». Il crée l'étape Votre projet, puis Solutions recommandées, Personnalisation et Vos coordonnées.",
  },
  {
    q: "Le template demande-t-il le format et la quantité ?",
    a: "Non. Il demande le type de besoin, un contexte libre et l'échéance. Ajoutez le support, le format, la quantité, l'impression, le papier, la finition et l'état du fichier.",
  },
  {
    q: "Le client peut-il envoyer son fichier d'impression ?",
    a: "Oui, à l'étape Personnalisation (PDF, JPEG, PNG ou WebP) ou plus tard depuis son espace prospect, jusqu'à 10 Mo par fichier. Au-delà, ajoutez une question texte « Lien vers vos fichiers ».",
  },
  {
    q: "Peut-on valider un BAT dans QuoteBuilder ?",
    a: "Non. QuoteBuilder reçoit la demande et la fait circuler dans l'équipe. Le bon à tirer reste dans votre flux de production.",
  },
  {
    q: "Comment afficher des prix d'impression en centimes ?",
    a: "Les montants sous 1 € gardent leurs centimes, mais au-delà ils sont arrondis à l'euro. Vendez par lot, par exemple « lot de 1 000 », et écrivez-le dans le nom du produit.",
  },
  {
    q: "Peut-on faire un prix dégressif selon la quantité ?",
    a: "Pas automatiquement. Créez un produit par palier, ou utilisez une fourchette large.",
  },
  {
    q: "Une enseigne peut-elle avoir une fourchette de prix ?",
    a: "Oui, mais elle dépend tellement du lieu que le type Sur devis est souvent plus honnête, avec une prestation de relevé à prix fixe.",
  },
  {
    q: "Le funnel peut-il poser des questions différentes pour la signalétique ?",
    a: "Non, l'ordre des questions est fixe. Faites des questions facultatives avec « Sans objet », ou créez un funnel par métier.",
  },
  {
    q: "Pourquoi mes dossiers impression sont-ils toujours Cold ?",
    a: "Le score lit des questions que le template ne contient pas, et ignore le champ Contexte. Tous les dossiers reçoivent 30 points. Triez sur l'échéance et la quantité.",
  },
  {
    q: "Faut-il une autorisation pour poser une enseigne ?",
    a: "Dans certains cas, oui, avec le formulaire cerfa n°16308. Vérifiez auprès de la mairie, et demandez la commune dans votre funnel.",
  },
];

export default function ImprimerieSignaletiqueLandingPage() {
  const body = loadPostBody("funnel-devis-imprimerie-signaletique");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis imprimerie et signalétique : des demandes avec format, quantité et fichier",
    url: `${SITE_URL}/secteurs/funnel-devis-imprimerie-signaletique`,
    about: "Imprimerie, signalétique, format, quantité, fichier",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Imprimerie et signalétique
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis imprimerie et signalétique : des demandes avec format, quantité et fichier
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Support, format, quantité, fichier. Le template Studio &amp; imprimerie ne les pose pas : on les ajoute. Un
            brief chiffrable, puis une relecture sur un seul lien.
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
                d: "Ordre fixe : type de besoin, contexte, échéance. Format, quantité et fichier s'ajoutent.",
              },
              {
                href: "/fonctionnalites/catalogue",
                t: "Catalogue",
                d: "Prix fixe, fourchette ou sur devis. Pas de lot. Pas de prix dégressif. Pas de TVA.",
              },
              {
                href: "/fonctionnalites/demandes",
                t: "Demandes",
                d: "Libellé automatique. Dossier Studio & imprimerie : 30 points, Cold. Sept statuts.",
              },
              {
                href: "/fonctionnalites/autopilote",
                t: "Autopilote",
                d: "Reprise après le délai du parcours, une heure par défaut, si un email a été laissé.",
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
        title="Partir du template Studio & imprimerie"
        text="Créer un compte Free puis choisir le template Studio & imprimerie dans la famille Services professionnels. Type Formulaire, nom par défaut « Funnel studio ». Le template ne crée ni produits ni règles, et ne pose pas de question format, quantité ou fichier. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
