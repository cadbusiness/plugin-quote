import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis usinage et sous-traitance : recevoir des demandes de pièces chiffrables",
  description:
    "Landing SEO usinage, mécanique de précision et sous-traitance industrielle : funnel de devis pièces (type de besoin, matière, quantité, échéance, plan), template Pièces & sous-traitance QuoteBuilder, règles de suggestion, relecture technique. Sans barème ni kit inventés.",
  path: "/secteurs/funnel-devis-usinage-sous-traitance-pieces",
});

const FAQ = [
  {
    q: "Existe-t-il un template usinage dans QuoteBuilder ?",
    a: "Oui, « Pièces & sous-traitance » (famille Industrie & fabrication) : étape « Votre pièce » avec type de besoin, matière, volume ou quantité et échéance, puis suggestions, personnalisation et coordonnées. Sans produits ni règles.",
  },
  {
    q: "Le prospect peut-il envoyer son plan ?",
    a: "Oui, à l'étape Personnalisation (PDF ou image, 10 Mo au maximum), ou depuis sa page prospect après l'envoi de la demande.",
  },
  {
    q: "Et un fichier STEP ?",
    a: "Pas à l'étape Personnalisation, qui n'accepte que PDF et images. Le contact principal peut l'ajouter depuis sa page prospect avec « Compléter la demande », jusqu'à 10 Mo.",
  },
  {
    q: "Peut-on afficher des questions différentes pour un prototype et une série ?",
    a: "Non. Les étapes sont dans un ordre fixe pour tous. Le type de besoin sert aux règles de suggestion et au tri. Si les questions diffèrent vraiment, créez deux funnels.",
  },
  {
    q: "Les suggestions peuvent-elles dépendre de la quantité ?",
    a: "Pas avec le champ texte du template. Transformez la quantité en liste ou en nombre pour l'utiliser dans une condition.",
  },
  {
    q: "Le score tient-il compte de la quantité ou de la matière ?",
    a: "Non. Sa formule fixe ne lit aucune des quatre questions du template. Triez avec vos propres critères : plan, matière, échéance.",
  },
  {
    q: "Les prix affichés sont-ils HT ?",
    a: "QuoteBuilder affiche une fourchette indicative min-max en euros entiers, sans gestion de TVA. Votre devis ferme précise le reste.",
  },
  {
    q: "Peut-on proposer un lot « usinage + anodisation » ?",
    a: "Pas sous forme de kit, qui n'existe pas dans QuoteBuilder. Mettez les deux dans la même règle, ou faites de l'anodisation une option.",
  },
  {
    q: "Le bureau des méthodes peut-il relire avant envoi ?",
    a: "Oui, en relecteur « Responsable technique » : lien de 30 jours, validation ou demande de modifications avec commentaire et budget maximum.",
  },
  {
    q: "QuoteBuilder gère-t-il la fabrication ?",
    a: "Non. Il reçoit, structure et suit les demandes de devis. Gammes, ordonnancement et contrôle restent dans vos outils de production.",
  },
];

export default function UsinageSousTraitancePiecesLandingPage() {
  const body = loadPostBody("funnel-devis-usinage-sous-traitance-pieces");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis usinage et sous-traitance : recevoir des demandes de pièces chiffrables",
    url: `${SITE_URL}/secteurs/funnel-devis-usinage-sous-traitance-pieces`,
    about: "Usinage, sous-traitance, pièces, matière, quantité, plan",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Usinage / sous-traitance
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis usinage et sous-traitance : recevoir des demandes de pièces chiffrables
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Type de besoin, matière, quantité, échéance et plan.
            Un brief chiffrable, puis une relecture technique sur un seul lien.
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
                href: "/fonctionnalites/funnel",
                t: "Funnel",
                d: "Questions en ordre fixe : type de besoin, matière, quantité, échéance.",
              },
              {
                href: "/fonctionnalites/catalogue",
                t: "Catalogue",
                d: "Suggestions Si/Alors, 3 blocs max. Pas de kits.",
              },
              {
                href: "/fonctionnalites/demandes",
                t: "Demandes",
                d: "Libellé automatique Hot, Warm ou Cold, et assignation.",
              },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, relances." },
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
        title="Partir du template Pièces & sous-traitance"
        text="Famille Industrie & fabrication : type de besoin, matière, quantité et échéance, dans un ordre fixe. Le template ne crée ni produits ni règles. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
