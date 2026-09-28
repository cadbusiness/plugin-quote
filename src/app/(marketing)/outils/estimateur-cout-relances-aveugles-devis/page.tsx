import type { Metadata } from "next";
import Link from "next/link";
import { CoutRelancesAveuglesEstimator } from "@/components/marketing/cout-relances-aveugles-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des relances à l’aveugle sur devis",
  description:
    "Estimez le coût des relances devis B2B faites sans regarder la fiche : heures, opportunités mal priorisées, timing. Calcul 100 % local.",
  path: "/outils/estimateur-cout-relances-aveugles-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, panier et taux horaire restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "La somme de trois ordres de grandeur : le temps chargé des relances faites sans signal utile, les opportunités mal priorisées si un panier et un écart de conversion sont renseignés, et l’impact timing (hypothèse de 25 % du panier sur les deals où la relance est trop tôt ou trop tard).",
  },
  {
    q: "Pourquoi opportunités et impact timing disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas l’écart de conversion ni le timing nuisible en euros. Devis relancés sans signal, relances, heures et coût temps restent affichés.",
  },
  {
    q: "Comment relier ça au devis en ligne ?",
    a: "Envoyez un lien, regardez la dernière consultation sur la fiche, suivez les relecteurs, et relancez sur une validation ou une demande de modifications. Lire l’article devis en ligne, dernière consultation et relecteurs.",
  },
];

export default function EstimateurCoutRelancesAveuglesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût des relances à l’aveugle sur devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures perdues, opportunités mal priorisées et impact timing quand les devis B2B sont relancés sans regarder la fiche.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-relances-aveugles-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des relances à l’aveugle sur devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de devis, part relancée sans signal utile, rythme de relances et taux. L’outil
            estime les relances, les heures, le coût temps, les opportunités mal priorisées et le
            total indicatif. Ce n’est pas un taux de mails ouverts. Calcul 100 % dans votre
            navigateur.{" "}
            <Link
              href="/blog/suivi-ouverture-lecture-devis-en-ligne-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Dernière consultation, relecteurs et relances
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutRelancesAveuglesEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les devis relancés sans signal = devis envoyés × part relancée sans regarder un signal
          utile (dernière consultation, statut des relecteurs, validation ou demande de
          modifications). Les relances aveugles / mois = ces devis × relances moyennes. Les heures =
          relances × minutes, ramenées en heures. Le coût temps = ces heures × le taux horaire
          chargé. Si le panier est renseigné, les opportunités = ces devis × écart de conversion (en
          points) × panier. L’écart mesure le gain si les dossiers qui ont un signal passent devant.
          L’impact timing = ces devis × part de deals où le timing a nui × panier × 25 %. Le total
          additionne coût temps, opportunités et impact timing.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/suivi-ouverture-lecture-devis-en-ligne-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            dernière consultation et relecteurs
          </Link>
          {" · "}
          <Link
            href="/blog/relancer-devis-hot-depuis-dossier"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            relancer un devis Hot
          </Link>
          {" · "}
          <Link
            href="/blog/envoyer-devis-lien-securise-vs-pdf-email"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            lien sécurisé vs PDF
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
        title="Relancez sur un signal, pas au feeling."
        text="Lien de devis, dernière consultation sur la fiche, relecteurs et notifications de validation. Free sans carte."
      />
    </>
  );
}
