import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis palettes et caisses bois : format, charge, quantité, destination et NIMP 15, une demande chiffrable avant le premier appel",
  description: "Landing SEO palettiers, fabricants de caisses bois et emballeurs industriels : les questions à poser avant de chiffrer (palette, caisse ou calage, format, dimensions, poids de la charge, quantité, fréquence, destination, traitement NIMP 15, manutention, livraison ou mise en caisse sur site), montage à partir du template Emballages (industry_packaging), score Cold 30, prix affichés en euros entiers et vente par lot, marquage NIMP 15 et traitement thermique 56 °C pendant 30 minutes. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-palettes-caisses-bois-export",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template palettes ou caisses bois ?", a: "Non. Partez du template « Emballages », dans la famille Industrie & fabrication, nommé par défaut « Funnel emballages ». Il a un choix « Caisse bois » mais pas de choix « Palette » : ajoutez-le." },
  { q: "Le funnel peut-il calculer le prix d'une caisse à partir des dimensions ?", a: "Non. Le funnel ne fait aucun calcul entre les réponses. Il recueille les dimensions et le poids ; le prix sort de votre outil de chiffrage." },
  { q: "Puis-je afficher un prix unitaire de palette à 9,40 € ?", a: "Vous pouvez le saisir, mais le prospect verra « 9 € » : au-delà de 1 €, les prix s'affichent en euros entiers. Vendez par lot (lot de 100 palettes) ou affichez une fourchette." },
  { q: "Pourquoi mes demandes sortent-elles toutes Cold ?", a: "Parce que la formule du score lit des clés et des valeurs que ce template n'utilise pas. Toutes les demandes sortent à 30 points. Triez sur la destination, la date et la quantité." },
  { q: "Puis-je poser les questions sur les caisses seulement à ceux qui demandent une caisse ?", a: "Non. Il n'y a pas de branchement conditionnel : toutes les questions s'affichent dans le même ordre. Rendez-les facultatives et prévoyez un choix « Sans objet »." },
  { q: "Une règle peut-elle dépendre du poids de la charge ?", a: "Oui, si le poids est une question de type Mesure : « Poids de la charge est au moins 1 000 ». Pas si c'est un Texte." },
  { q: "Le prospect peut-il m'envoyer un plan d'encombrement ?", a: "Oui, en PDF ou en image (JPEG, PNG, WebP), jusqu'à 10 Mo, par la zone « Plan (PDF ou image) » ou plus tard depuis son espace prospect. Pas de fichier 3D." },
  { q: "Quand faut-il le marquage NIMP 15 ?", a: "Selon le ministère de l'Agriculture, avant toute exportation vers un pays tiers qui applique la norme et pour toute importation depuis un pays tiers. Le traitement thermique HT se fait à 56 °C pendant 30 minutes au cœur du bois, et la marque est apposée par un opérateur autorisé." },
  { q: "Mon équipe peut-elle joindre le devis signé au dossier ?", a: "Non. L'équipe ne peut pas joindre de fichier au dossier ; les fichiers viennent du prospect. Une note interne indique où le devis signé est rangé." },
  { q: "Free suffit-il pour tester ?", a: "Oui. Le plan Free permet de monter le funnel et de voir l'interface, sans carte bancaire." },
];

export default function FunnelDevisPalettesCaissesBoisExportPage() {
  const body = loadPostBody("funnel-devis-palettes-caisses-bois-export");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis palettes et caisses bois : format, charge, quantité, destination et NIMP 15, une demande chiffrable avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-palettes-caisses-bois-export`,
    description: "Landing SEO palettiers, fabricants de caisses bois et emballeurs industriels : les questions à poser avant de chiffrer (palette, caisse ou calage, format, dimensions, poids de la charge, quantité, fréquence, destination, traitement NIMP 15, manutention, livraison ou mise en caisse sur site), montage à partir du template Emballages (industry_packaging), score Cold 30, prix affichés en euros entiers et vente par lot, marquage NIMP 15 et traitement thermique 56 °C pendant 30 minutes. Sans template inventé ni fonction inventée.",
    about: "Palettes et caisses bois",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Palettes et caisses bois"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis palettes et caisses bois : format, charge, quantité, destination et NIMP 15, une demande chiffrable avant le premier appel"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO palettiers, fabricants de caisses bois et emballeurs industriels : les questions à poser avant de chiffrer (palette, caisse ou calage, format, dimensions, poids de la charge, quantité, fréquence, destination, traitement NIMP 15, manutention, livraison ou mise en caisse sur site), montage à partir du template Emballages (industry_packaging), score Cold 30, prix affichés en euros entiers et vente par lot, marquage NIMP 15 et traitement thermique 56 °C pendant 30 minutes. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/frais-port-franco-incoterms-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/verificateur-pret-main-oeuvre-devis", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/secteurs/funnel-devis-emballage-conditionnement", t: "Secteur voisin", d: "Un autre funnel du même geste commercial." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez type, format, dimensions, poids, quantité, destination et traitement dans un ordre fixe. QuoteBuilder n'a pas de template palettes ou caisses bois : partez d'Emballages. Le plan Free suffit pour voir l'interface, sans carte. "} />
    </>
  );
}
