import type { Metadata } from "next";
import Link from "next/link";
import { CoutCampagnesEmailSansSegmentationCalculator } from "@/components/marketing/cout-campagnes-email-sans-segmentation-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/estimateur-cout-campagnes-email-sans-segmentation";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des campagnes email sans segmentation",
  description:
    "Estimez le temps et les affaires qu'une campagne email coûte quand elle part vers une liste brute de demandeurs de devis : contacts mal ciblés, heures, plaintes, chevauchement avec l'Autopilote. Calcul 100 % local.",
  path: PATH,
});

export default function EstimateurCoutCampagnesEmailSansSegmentationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût des campagnes email sans segmentation",
    url: `${SITE_URL}${PATH}`,
    description:
      "Estime le temps et les affaires qu'une campagne email coûte quand elle part vers une liste brute. Calcul local dans le navigateur.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: { "@type": "Organization", name: "QuoteBuilder", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des campagnes email sans segmentation
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Dix hypothèses : le nombre de campagnes, la taille de la liste, la part envoyée sans segment, le temps de
            préparation, les plaintes, la part déjà suivie par l&apos;Autopilote, votre taux horaire, votre panier et
            la part d&apos;affaires qui refroidissent. Le calcul reste dans le navigateur.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutCampagnesEmailSansSegmentationCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pour lire vos chiffres</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Contacts touchés : campagnes par mois multipliées par la taille de la liste. Contacts mal ciblés : ces
          contacts multipliés par la part sans segment. La part déjà en parcours Autopilote est affichée à part. Elle
          n&apos;est pas ajoutée aux mal ciblés.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Heures perdues : minutes de préparation multipliées par le nombre de campagnes, plus les plaintes
          multipliées par les minutes de traitement, le tout divisé par 60. Le coût de ce temps est ces heures
          multipliées par le coût horaire.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les affaires refroidies appliquent votre pourcentage aux contacts mal ciblés. Les opportunités multiplient
          ces affaires par le panier. Le coût mensuel additionne le temps et ces opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le calcul ne sait pas si votre segment est juste. Il ne distingue pas non plus une plainte d&apos;un
          désabonnement. Les appels et les visites restent à compter à part.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/segments-campagnes-email-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            segments et campagnes email
          </Link>
          {" · "}
          <Link
            href="/blog/autopilote-workflows-relance-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            l&apos;Autopilote
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            voir la démo
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            créer un compte Free
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>

      <MarketingCta
        title="Écrire au bon groupe, pas à toute la base."
        text="Compte Free sans carte. Les campagnes et les segments sont dans le menu Commercial. La démo rayonnage montre un parcours public, pas une campagne."
      />
    </>
  );
}
