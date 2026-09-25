import type { Metadata } from "next";
import Link from "next/link";
import { CoutAllerRetoursBriefPhotosEstimator } from "@/components/marketing/cout-aller-retours-brief-photos-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des allers-retours (brief sans photos / plans)",
  description:
    "Estimez le coût des allers-retours quand le brief devis arrive sans plans ni photos : minutes perdues, rappels, déplacements inutiles, opportunités manquées. Calcul 100 % local.",
  path: "/outils/estimateur-cout-aller-retours-brief-photos",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, coût trajet et panier restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "La somme de trois ordres de grandeur : le temps chargé passé à relancer les dossiers sans photo ni plan, le coût des déplacements inutiles sur ces dossiers, et les opportunités si un panier et un écart de conversion sont renseignés.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas l’écart de conversion en euros. Dossiers, heures, friction, trajets et deals restent affichés dans le récap.",
  },
  {
    q: "Comment relier ça aux pièces jointes du devis ?",
    a: "L’upload photos / plans dans le funnel et l’espace prospect réduisent les rappels WhatsApp et les visites à vide. Lire pièces jointes, plans et photos, et l’estimateur de brief incomplet.",
  },
];

export default function EstimateurCoutAllerRetoursBriefPhotosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût aller-retours brief sans photos / plans",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures perdues, déplacements inutiles et opportunités manquées quand les briefs de devis B2B arrivent sans plans ni photos.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-aller-retours-brief-photos`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des allers-retours (brief sans photos / plans)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de demandes, part sans photo ni plan, minutes perdues, déplacements inutiles et
            écart de conversion. L’outil estime les heures, le coût chargé, les trajets et les
            opportunités manquées. Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/pieces-jointes-plans-photos-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Pièces jointes, plans et photos dans un devis
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutAllerRetoursBriefPhotosEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les dossiers sans document = demandes × part sans photo ni plan. Les heures perdues =
          ces dossiers × minutes, ramenées en heures. Le coût de friction = ces heures × le taux
          horaire chargé. Les déplacements inutiles = dossiers sans document × part de visites à
          vide, puis × le coût unitaire du trajet. Si le panier est renseigné, les opportunités =
          dossiers × écart de conversion (en points) × panier. Le total additionne friction, trajets
          et opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/pieces-jointes-plans-photos-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            pièces jointes, plans et photos
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-cout-brief-incomplet"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            estimateur brief incomplet
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/espace-prospect"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            espace prospect
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
        title="Faites arriver les photos et les plans dans le dossier."
        text="Upload dans le funnel, espace prospect, moins de déplacements à vide. Free sans carte."
      />
    </>
  );
}
