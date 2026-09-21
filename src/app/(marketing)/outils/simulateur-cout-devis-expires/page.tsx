import type { Metadata } from "next";
import Link from "next/link";
import { CoutDevisExpiresCalculator } from "@/components/marketing/cout-devis-expires-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Simulateur coût des devis expirés B2B",
  description:
    "Estimez le coût des devis qui expirent sans décision : CA potentiel perdu, heures perdues, coût de re-chiffrage, gain si vous prolongez ou relancez avant expiration. Calcul local dans le navigateur.",
  path: "/outils/simulateur-cout-devis-expires",
});

const FAQ = [
  {
    q: "Le calcul remplace-t-il un historique de pipeline ?",
    a: "Non. C’est un ordre de grandeur : volume ouvert × % d’expiration × panier, plus heures, coût de 1re passe et re-chiffrage. Il sert à prioriser les relances J-5, pas à budgéter une DAF.",
  },
  {
    q: "Que compter dans le coût de chiffrage ?",
    a: "Temps estimateur × coût horaire chargé, ou un forfait interne. Le re-chiffrage, c’est la reprise après expiration (souvent plus courte, parfois quasi un nouveau devis).",
  },
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les calculs restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Comment lier ça à la validité des devis ?",
    a: "Si le CA potentiel ou les heures perdues sont élevés, posez une date de fin visible, un statut expiré, et une relance J-5. Lire validité et expiration des devis B2B.",
  },
];

export default function SimulateurCoutDevisExpiresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simulateur coût des devis expirés B2B",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Estime CA potentiel perdu, heures, coût de re-chiffrage et gain si relance ou prolongation avant expiration des devis.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/simulateur-cout-devis-expires`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Simulateur du coût des devis expirés
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Estimez ce que vous perdez quand des devis expirent sans décision : CA potentiel, heures
            de chiffrage, coût de reprise, et gain si vous relancez ou prolongez avant la date.
            Calcul 100 % dans votre navigateur.{" "}
            <Link
              href="/blog/validite-expiration-devis-b2b"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Validité et expiration des devis B2B
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutDevisExpiresCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les expirés, c’est volume × %. Le CA potentiel multiplie par le panier. Les heures, c’est
          ce volume × heures de chiffrage. Le coût de 1re passe et le re-chiffrage sont des coûts
          internes. Le gain « avant expiration » applique le % évité au CA et aux coûts de reprise.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/validite-expiration-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            validité et expiration
          </Link>
          {" · "}
          <Link
            href="/blog/pourquoi-les-devis-meurent-sans-relance"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            pourquoi les devis meurent sans relance
          </Link>
          {" · "}
          <Link
            href="/outils/cout-devis-non-relance"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            coût d’un devis non relancé
          </Link>
          {" · "}
          <Link
            href="/outils/simulateur-taux-acceptation-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            simulateur taux d’acceptation
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Passez de l’expiration au dossier relancé."
        text="Date de validité visible, statut expiré, relance J-5, versions. Free sans carte."
      />
    </>
  );
}
