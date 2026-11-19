import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis découpe laser, tôlerie et pliage : matière, épaisseur, quantité, fichiers, une demande chiffrable avant le premier appel",
  description: "Landing SEO ateliers de découpe laser, de tôlerie fine et de pliage de tôle : les questions à poser avant de chiffrer (opérations, matière, épaisseur, nombre de références, quantité par référence, fichiers DXF ou STEP, tolérances, finition, matière fournie, livraison ou pose), montage à partir du template Pièces & sous-traitance (industry_parts), score Cold 30, plans en PDF par la zone d'upload, normes ISO 9013 et ISO 2768-1, tri des chutes de métal et mention déchets quand il y a pose. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-decoupe-laser-tolerie-pliage",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template découpe laser ou tôlerie ?", a: "Non. Le plus proche est le template « Pièces & sous-traitance », dans la famille Industrie & fabrication, nommé par défaut « Funnel pièces ». Il pose le type de besoin, la matière, le volume ou la quantité et l'échéance. On le renomme et on lui ajoute les questions de tôlerie." },
  { q: "Le prospect peut-il m'envoyer ses fichiers DXF ou STEP par le funnel ?", a: "Non. La zone « Plan (PDF ou image) » accepte les fichiers PDF, JPEG, PNG et WebP jusqu'à 10 Mo, comme « Compléter la demande » dans l'espace prospect. Demandez un plan coté en PDF, et organisez l'envoi des DXF ou STEP au premier échange." },
  { q: "Le funnel peut-il calculer un prix à partir de l'épaisseur et de la quantité ?", a: "Non. Il n'y a pas de calcul entre les réponses. Les prix du catalogue sont en euros entiers, fixes, en fourchette ou « Sur devis ». Le prix ferme sort de votre logiciel de chiffrage." },
  { q: "Pourquoi mes demandes de découpe sortent-elles toutes Cold ?", a: "Parce que la formule de score est fixe et lit des clés que ce template n'utilise pas de la façon attendue. Les demandes sortent à 30 points, Cold, quelle que soit la série. Triez avec une règle d'équipe : plan joint, matière et épaisseur connues, quantité, échéance." },
  { q: "Puis-je afficher les questions de pliage seulement à ceux qui en veulent ?", a: "Non. Le funnel n'a pas de branchement conditionnel : toutes les questions s'affichent à tous, dans un ordre fixe. Rendez facultatives les questions qui ne concernent qu'une partie des demandes. Les règles Si/Alors choisissent seulement les produits suggérés." },
  { q: "Une règle peut-elle dépendre de l'épaisseur ?", a: "Oui, si l'épaisseur est une question de type Mesure. Une condition « au moins » ou « au plus » fonctionne sur une réponse numérique. Elle ne fonctionne pas sur un champ Texte." },
  { q: "Mon équipe peut-elle joindre les DXF reçus par e-mail au dossier ?", a: "Non. L'équipe ne peut pas joindre de fichier au dossier : seuls les envois du prospect y figurent. Notez dans une note interne que les fichiers ont été reçus et où ils sont rangés." },
  { q: "Mon devis de découpe doit-il porter une mention déchets ?", a: "Pas s'il s'agit de pièces découpées et livrées. La mention de l'article L541-21-2-3 du code de l'environnement vise les devis de travaux de construction, de rénovation ou de démolition de bâtiments, et de jardinage. Si vous posez vos pièces sur un bâtiment, traitez le devis comme concerné." },
  { q: "Que dit la norme ISO 9013 ?", a: "La norme ISO 9013:2017, amendée en 2024, classe la qualité des coupes thermiques (dont la découpe laser) et fixe des tolérances. Quand un plan y renvoie, la classe indiquée compte pour le chiffrage. La question « Tolérances » du funnel sert à le savoir." },
  { q: "Free suffit-il pour tester ?", a: "Oui. Le plan Free permet de monter le funnel et de voir l'interface, sans carte bancaire. Starter commence dès 39 € et Pro dès 79 € par mois en annuel." },
];

export default function FunnelDevisDecoupeLaserToleriePliagePage() {
  const body = loadPostBody("funnel-devis-decoupe-laser-tolerie-pliage");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis découpe laser, tôlerie et pliage : matière, épaisseur, quantité, fichiers, une demande chiffrable avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-decoupe-laser-tolerie-pliage`,
    description: "Landing SEO ateliers de découpe laser, de tôlerie fine et de pliage de tôle : les questions à poser avant de chiffrer (opérations, matière, épaisseur, nombre de références, quantité par référence, fichiers DXF ou STEP, tolérances, finition, matière fournie, livraison ou pose), montage à partir du template Pièces & sous-traitance (industry_parts), score Cold 30, plans en PDF par la zone d'upload, normes ISO 9013 et ISO 2768-1, tri des chutes de métal et mention déchets quand il y a pose. Sans template inventé ni fonction inventée.",
    about: "Découpe laser, tôlerie et pliage",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Découpe laser et tôlerie"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis découpe laser, tôlerie et pliage : matière, épaisseur, quantité, fichiers, une demande chiffrable avant le premier appel"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO ateliers de découpe laser, de tôlerie fine et de pliage de tôle : les questions à poser avant de chiffrer (opérations, matière, épaisseur, nombre de références, quantité par référence, fichiers DXF ou STEP, tolérances, finition, matière fournie, livraison ou pose), montage à partir du template Pièces & sous-traitance (industry_parts), score Cold 30, plans en PDF par la zone d'upload, normes ISO 9013 et ISO 2768-1, tri des chutes de métal et mention déchets quand il y a pose. Sans template inventé ni fonction inventée."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover">Créer ce funnel</Link>
            <Link href="/secteurs" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mk-ink ring-1 ring-mk-border">Tous les secteurs</Link>
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
              { href: "/blog/mention-dechets-devis-travaux-bordereau-depot-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-mention-dechets-devis-travaux", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/secteurs/funnel-devis-usinage-sous-traitance-pieces", t: "Secteur voisin", d: "Un autre funnel du même geste commercial." },
              { href: "/fonctionnalites/espace-prospect", t: "Espace prospect", d: "Le dossier, les pièces et les relances, sur un seul lien." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl bg-white p-4 ring-1 ring-mk-border hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)]">
                <p className="font-semibold">{item.t}</p>
                <p className="mt-1 text-sm text-mk-muted">{item.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <MarketingFaq items={FAQ} />
      <MarketingCta title="Essayer gratuitement" text={" Posez opérations, matière, épaisseur, références, quantités et fichiers dans un ordre fixe. QuoteBuilder n'a pas de template découpe laser : partez de Pièces & sous-traitance. Le plan Free suffit pour voir l'interface, sans carte. "} />
    </>
  );
}
