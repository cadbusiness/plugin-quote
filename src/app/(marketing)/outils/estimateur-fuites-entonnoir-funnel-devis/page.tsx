import type { Metadata } from "next";
import Link from "next/link";
import { FuitesEntonnoirFunnelDevisCalculator } from "@/components/marketing/fuites-entonnoir-funnel-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur des fuites d'un entonnoir de devis B2B",
  description:
    "Saisissez les sept marches de votre entonnoir de devis (visiteurs, commencé, email, complété, devis, rappelé, gagné). L'outil calcule le taux de passage de chaque marche, repère la plus faible et la plus coûteuse, et estime ce que rapporterait quelques points gagnés sur la marche de votre choix. Vos chiffres, calcul 100 % local.",
  path: "/outils/estimateur-fuites-entonnoir-funnel-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les sept marches, le montant moyen et l'hypothèse restent dans votre navigateur. Rien n'est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le taux de passage ?",
    a: "Le nombre de la marche suivante divisé par le nombre de la marche précédente, sur la même période. Les demandes envoyées / visiteurs et les affaires gagnées / visiteurs sont calculées à part.",
  },
  {
    q: "L'hypothèse est-elle une prévision ?",
    a: "Non. Elle ajoute des points au taux d'une marche et suppose que les taux en aval restent ceux que vous avez saisis. Ce sont vos chiffres, pas un benchmark ni un conseil financier.",
  },
  {
    q: "Où lire les sept marches dans QuoteBuilder ?",
    a: "Dans le rapport PDF de la page Statistiques, rubrique Tunnel de conversion. À l'écran, l'onglet Vue montre Visiteurs, Devis, Rappel et Signé. Rappelé compte Contacté, En cours, En attente ou Gagné. Signé compte Gagné.",
  },
];

export default function EstimateurFuitesEntonnoirFunnelDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur des fuites d'un entonnoir de devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Calcule le taux de passage de chaque marche d'un entonnoir de devis B2B (visiteurs, commencé, email, complété, devis, rappelé, gagné), repère la marche la plus faible et la plus coûteuse, et estime l'effet de quelques points gagnés sur une marche. Calcul local sur vos chiffres.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-fuites-entonnoir-funnel-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur des fuites d&apos;un entonnoir de devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Recopiez les sept marches de votre entonnoir sur une même période : visiteurs, parcours commencés, emails
            laissés, parcours complétés, demandes envoyées, demandes rappelées, affaires gagnées. L&apos;outil calcule le
            taux de passage de chaque marche, repère la plus faible et celle qui perd le plus de monde, puis estime ce
            que rapporteraient quelques points gagnés sur la marche de votre choix, à taux constants en aval. Ce sont
            vos chiffres, pas un benchmark. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/mesurer-funnel-devis-b2b-entonnoir-statistiques"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Mesurer un funnel de devis
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <FuitesEntonnoirFunnelDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Chaque taux de passage est le nombre de la marche suivante divisé par le nombre de la marche précédente. Les
          perdus sont l&apos;écart entre les deux. La marche la plus faible est le plus petit taux. La marche qui perd le
          plus de monde est le plus grand écart, parmi les marches qui ont un volume. Une marche saisie au-dessus de la
          précédente est ramenée à la valeur précédente.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          L&apos;hypothèse ajoute des points au taux choisi, plafonnés à 100 %, puis applique les taux que vous avez
          saisis aux marches suivantes. Si une marche en amont ou en aval est à zéro, l&apos;hypothèse n&apos;est pas
          calculable. Ce n&apos;est pas une prévision : plus de parcours commencés peut aussi faire entrer des demandes
          moins qualifiées.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Côté QuoteBuilder, les sept marches sont dans le Tunnel de conversion du rapport PDF de la page Statistiques.
          À l&apos;écran, l&apos;onglet Vue montre Visiteurs, Devis, Rappel et Signé. Rappelé ne compte pas une demande
          passée directement Perdu. Le chiffre d&apos;affaires de la page Statistiques est une estimation à partir des
          prix du catalogue, pas un montant signé.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            compte Free
          </Link>
          {" · "}
          <Link
            href="/blog/mesurer-funnel-devis-b2b-entonnoir-statistiques"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            mesurer un funnel de devis
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-imprimerie-signaletique"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel devis imprimerie et signalétique
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-demandes-devis-abandonnees-funnel"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            estimateur des demandes abandonnées
          </Link>
          {" · "}
          <Link
            href="/outils/simulateur-taux-conversion-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            simulateur de taux de conversion
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/stats"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Statistiques
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Lire les sept marches dans le rapport PDF."
        text="Page Statistiques, bouton Rapport PDF, Tunnel de conversion. Compte Free sans carte. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
