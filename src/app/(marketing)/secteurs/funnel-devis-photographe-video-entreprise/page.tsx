import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis photo et vidéo d'entreprise : type de prise de vue, volume, lieu, personnes, usages et droits, une demande chiffrable avant le premier appel",
  description: "Landing SEO pour les photographes et vidéastes qui travaillent pour des entreprises (packshot, reportage industriel, portraits d'équipe, vidéo institutionnelle, événement) : les questions à poser avant de chiffrer (type de prise de vue, volume, lieu et contraintes du site, personnes reconnaissables, supports, durée et diffusion à des tiers), les règles qui comptent (cession de droits d'auteur L131-3 et L131-4, droit à l'image, drone et règlement (UE) 2019/947, plan de prévention, TVA, contribution diffuseur), et comment monter ce funnel dans QuoteBuilder à partir du template Studio & imprimerie. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-photographe-video-entreprise",
});

export const FAQ = [
  { q: "Existe-t-il un template photo ou vidéo dans QuoteBuilder ?", a: "Non. Le template le plus proche est « Studio & imprimerie », dans la famille « Services professionnels ». Il contient un choix « Studio / shooting » et se règle en renommant les choix du type de besoin et en ajoutant des questions sur le volume, le lieu, les personnes et les usages." },
  { q: "Comment chiffrer la cession de droits dans le funnel ?", a: "Créez des produits de cession séparés dans le catalogue (web et réseaux, imprimés et salon, publicité), avec une fourchette ou « Sur devis », et une règle qui les propose selon les supports cochés. Le montant final et la clause s'écrivent dans votre devis détaillé." },
  { q: "Le client peut-il m'envoyer son moodboard ou sa charte graphique ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation : PDF, JPEG, PNG ou WebP, 10 Mo au plus. Il peut aussi l'ajouter plus tard depuis son espace prospect, rubrique « Compléter la demande »." },
  { q: "Et une vidéo de référence ou un dossier de cent photos produits ?", a: "Ils dépassent souvent 10 Mo. Ajoutez une question texte facultative « Lien vers des fichiers lourds » où le client colle un lien de partage." },
  { q: "Le funnel peut-il poser des questions différentes pour la photo et la vidéo ?", a: "Non, il n'a pas de branchement conditionnel : les questions passent dans un ordre fixe. Rendez facultatives les questions propres à la vidéo, avec une réponse « Sans objet », ou créez un second funnel à partir du même template." },
  { q: "Pourquoi toutes mes demandes sont-elles Cold ?", a: "La formule du score lit des questions que ce template ne contient pas (surface, charge, accès, certains types de projet), et ignore le champ Contexte et les questions ajoutées. Tous les dossiers reçoivent 30 points. Triez sur le volume, l'échéance et les supports." },
  { q: "Qui doit faire signer les autorisations de droit à l'image ?", a: "QuoteBuilder ne les gère pas. Le plus simple est que l'entreprise les fasse signer à ses salariés, et que le photographe s'occupe des modèles qu'il recrute. Le devis doit dire qui fait quoi, et la question « Personnes reconnaissables » du funnel permet d'en parler dès le premier appel." },
  { q: "Faut-il mentionner la contribution diffuseur dans le devis ?", a: "Ce n'est pas une mention obligatoire du devis, mais si vous êtes rémunéré en droits d'auteur comme artiste-auteur, une phrase sur la contribution de 1,1 % due par le client évite une surprise. QuoteBuilder ne la calcule pas." },
  { q: "Peut-on afficher un prix par photo dégressif selon le nombre ?", a: "Non. Le montant d'une ligne est le prix unitaire multiplié par la quantité, sans palier. Pour des volumes très différents, créez deux produits (par exemple « Packshot, par produit, jusqu'à 20 » et « Packshot, par produit, à partir de 21 ») et une règle sur le volume pour chacun." },
  { q: "QuoteBuilder envoie-t-il le devis signé ou les photos au client ?", a: "Non. Il recueille la demande, propose des prestations, prépare un récapitulatif PDF marqué « Document indicatif, non contractuel. » et suit le dossier jusqu'au statut Gagné ou Perdu. Le devis, la clause de cession, la signature et la livraison des fichiers se font avec vos outils habituels." },
];

export default function FunnelDevisPhotographeVideoEntreprisePage() {
  const body = loadPostBody("funnel-devis-photographe-video-entreprise");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis photo et vidéo d'entreprise : type de prise de vue, volume, lieu, personnes, usages et droits, une demande chiffrable avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-photographe-video-entreprise`,
    description: "Landing SEO pour les photographes et vidéastes qui travaillent pour des entreprises (packshot, reportage industriel, portraits d'équipe, vidéo institutionnelle, événement) : les questions à poser avant de chiffrer (type de prise de vue, volume, lieu et contraintes du site, personnes reconnaissables, supports, durée et diffusion à des tiers), les règles qui comptent (cession de droits d'auteur L131-3 et L131-4, droit à l'image, drone et règlement (UE) 2019/947, plan de prévention, TVA, contribution diffuseur), et comment monter ce funnel dans QuoteBuilder à partir du template Studio & imprimerie. Sans template inventé ni fonction inventée.",
    about: "Photo et vidéo d'entreprise",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Photo et vidéo"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis photo et vidéo d'entreprise : type de prise de vue, volume, lieu, personnes, usages et droits, une demande chiffrable avant le premier appel"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO pour les photographes et vidéastes qui travaillent pour des entreprises (packshot, reportage industriel, portraits d'équipe, vidéo institutionnelle, événement) : les questions à poser avant de chiffrer (type de prise de vue, volume, lieu et contraintes du site, personnes reconnaissables, supports, durée et diffusion à des tiers), les règles qui comptent (cession de droits d'auteur L131-3 et L131-4, droit à l'image, drone et règlement (UE) 2019/947, plan de prévention, TVA, contribution diffuseur), et comment monter ce funnel dans QuoteBuilder à partir du template Studio & imprimerie. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/cession-droits-auteur-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-clause-cession-droits-auteur", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/outils/estimateur-cout-aller-retours-brief-photos", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez type de prise de vue, volume, lieu, personnes et usages dans un ordre fixe. Il n’y a pas de template photo ou vidéo : partez de Studio & imprimerie. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
