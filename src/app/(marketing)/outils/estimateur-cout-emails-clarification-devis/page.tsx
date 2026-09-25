import type { Metadata } from "next";
import Link from "next/link";
import { CoutEmailsClarificationEstimator } from "@/components/marketing/cout-emails-clarification-estimator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur coût des e-mails de clarification devis",
  description:
    "Estimez le coût des e-mails RE: RE: pour clarifier un devis B2B : heures perdues, coût temps, opportunités perdues faute de clarté. Calcul 100 % local.",
  path: "/outils/estimateur-cout-emails-clarification-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Volume, taux, minutes et panier restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Que mesure le coût total ?",
    a: "La somme de deux ordres de grandeur : le temps chargé passé à lire, écrire et forwarder les mails de clarification, et les opportunités si un panier et un pourcentage de deals perdus faute de clarté sont renseignés.",
  },
  {
    q: "Pourquoi les opportunités disparaissent si le panier est à 0 ?",
    a: "Sans panier, l’outil ne convertit pas les deals perdus en euros. Devis concernés, mails, heures et coût temps restent affichés dans le récap.",
  },
  {
    q: "Comment relier ça aux commentaires sur le devis ?",
    a: "Un lien sécurisé avec commentaires ancrés par ligne remplace le fil RE: RE: comme salle de décision. Lire commentaires et annotations sur un devis collaboratif, et l’envoi par lien vs PDF.",
  },
];

export default function EstimateurCoutEmailsClarificationDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur coût e-mails de clarification devis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime heures perdues, coût temps et opportunités perdues quand la clarification d’un devis B2B passe par des fils e-mail RE: RE:.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/estimateur-cout-emails-clarification-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Estimateur coût des e-mails de clarification devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Volume de devis, part qui génère des fils RE: RE:, minutes par mail et deals perdus
            faute de clarté. L’outil estime les heures, le coût chargé et les opportunités perdues.
            Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/commentaires-annotations-devis-collaboratif-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Commentaires et annotations sur un devis collaboratif
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutEmailsClarificationEstimator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les devis concernés = devis envoyés × part avec clarification par mail. Les mails du mois
          = ces devis × mails moyens par clarification. Les heures = ces mails × minutes, ramenées
          en heures. Le coût temps = ces heures × le taux horaire chargé. Les deals perdus = devis
          concernés × pourcentage perdu faute de clarté. Si le panier est renseigné, les
          opportunités = ces deals × panier. Le total additionne coût temps et opportunités.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/commentaires-annotations-devis-collaboratif-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            commentaires et annotations
          </Link>
          {" · "}
          <Link
            href="/blog/envoyer-devis-lien-securise-vs-pdf-email"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            lien sécurisé vs PDF
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-cout-aller-retours-brief-photos"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            estimateur aller-retours brief / photos
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
        title="Ramenez la décision dans le devis."
        text="Lien sécurisé, commentaires ancrés, moins de fils RE: RE:. Free sans carte."
      />
    </>
  );
}
