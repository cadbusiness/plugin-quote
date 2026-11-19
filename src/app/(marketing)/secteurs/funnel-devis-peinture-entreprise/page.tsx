import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis peinture entreprise : site, supports, surface, contraintes chantier, une demande chiffrable avant la visite",
  description: "Landing SEO entreprises de peinture professionnelle : questions avant visite, NAF 43.34Z, absence de template peinture, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-peinture-entreprise",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template peinture ?", a: "Non. Il n'y a pas de template peinture. On part de « Aménagement industriel » (`fitout`)." },
  { q: "Puis-je renommer « Entrepôt / logistique » en « Entrepôt à peindre » ?", a: "Oui. Gardez la valeur `warehouse`. Changez seulement le libellé." },
  { q: "Pourquoi toutes les demandes sortent Cold ?", a: "Parce que la formule ne lit presque rien du questionnaire fitout : au mieux +5 pour une vraie contrainte, soit 35, sous le seuil warm de 45. Ajoutez un texte de besoin long côté contact si vous voulez faire monter le score, ou ignorez la pastille et triez à la main." },
  { q: "Puis-je poser la question façade seulement pour l'extérieur ?", a: "Non. Pas de branchement conditionnel. Posez la question à tout le monde, ou acceptez qu'elle apparaisse toujours." },
  { q: "Le prospect peut-il envoyer des photos des murs ?", a: "Oui, via « Plan (PDF ou image) » en personnalisation, ou plus tard dans l'espace prospect. Formats PDF, JPEG, PNG, WebP, 10 Mo." },
  { q: "L'équipe peut-elle joindre le CCTP au dossier ?", a: "Non. Seuls les fichiers du prospect apparaissent. Gardez le CCTP dans votre GED et référencez-le en note interne." },
  { q: "Quel lien pour l'espace prospect ?", a: "https://www.quotebuilder.co/fonctionnalites/espace-prospect" },
  { q: "Les prix peuvent-ils être au m² avec décimales ?", a: "Les prix catalogue sont en euros entiers dans le produit. Structurez vos lignes (forfait zone, prix au m² arrondi) en conséquence." },
  { q: "Free suffit-il pour tester ?", a: "Oui : 1 funnel, 10 soumissions. Ensuite Starter ou Pro selon le volume." },
  { q: "Où voir une démo de funnel ?", a: "https://www.quotebuilder.co/c/demo/rayonnage (démo rayonnage, pour voir le parcours visiteur). Compte : https://www.quotebuilder.co/signup?plan=free" },
];

export default function FunnelDevisPeintureEntreprisePage() {
  const body = loadPostBody("funnel-devis-peinture-entreprise");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis peinture entreprise : site, supports, surface, contraintes chantier, une demande chiffrable avant la visite",
    url: `${SITE_URL}/secteurs/funnel-devis-peinture-entreprise`,
    description: "Landing SEO entreprises de peinture professionnelle : questions avant visite, NAF 43.34Z, absence de template peinture, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée.",
    about: "Peinture entreprise",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Peinture"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis peinture entreprise : site, supports, surface, contraintes chantier, une demande chiffrable avant la visite"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO entreprises de peinture professionnelle : questions avant visite, NAF 43.34Z, absence de template peinture, montage à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/clause-resolutoire-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-clause-resolutoire", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/score-demande-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={"Posez type de site, surface, intérieur ou extérieur, support et délai dans un ordre fixe. Il n’y a pas de template peinture. Le plan Free suffit pour voir l’interface, sans carte."} />
    </>
  );
}
