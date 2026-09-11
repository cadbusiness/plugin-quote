import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { COMPANY, SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "À propos",
  description:
    "QuoteBuilder est édité par Vinci Liberta LTD (Dublin). Funnel de devis B2B pour PME : parcours prospect, dossier, autopilote de relances.",
  path: "/a-propos",
});

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "À propos de QuoteBuilder",
    url: `${SITE_URL}/a-propos`,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">À propos</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Un éditeur. Un produit. Dublin.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mk-muted sm:text-lg">
            QuoteBuilder est un logiciel de devis B2B. Il est édité par {COMPANY.legalName},
            société enregistrée à {COMPANY.city}, {COMPANY.country}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-6 pb-8">
        <article className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">L’entité</h2>
          <dl className="mt-4 space-y-2 text-[15px] leading-7 text-mk-muted">
            <div className="flex justify-between gap-4">
              <dt className="text-mk-faint">Produit</dt>
              <dd className="font-medium">{COMPANY.product}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mk-faint">Éditeur</dt>
              <dd className="font-medium">{COMPANY.legalName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mk-faint">Siège</dt>
              <dd className="font-medium">
                {COMPANY.city}, {COMPANY.country}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mk-faint">Site canonique</dt>
              <dd className="font-medium">
                <a href={SITE_URL} className="text-mk-accent">
                  www.quotebuilder.co
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mk-faint">Contact</dt>
              <dd className="font-medium">
                <a href={`mailto:${COMPANY.email}`} className="text-mk-accent">
                  {COMPANY.email}
                </a>
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Ce que nous construisons</h2>
          <p className="mt-3 text-[16px] leading-7 text-mk-muted">
            QuoteBuilder est un logiciel de devis B2B, côté PME : cuisinistes, rayonnagistes,
            ateliers, prestataires sur site. Le prospect configure. L’équipe reçoit un dossier
            avec un score. Un autopilote envoie les relances que beaucoup d’équipes n’arrivent
            pas à tenir à la main.
          </p>
          <p className="mt-3 text-[16px] leading-7 text-mk-muted">
            Ce n’est pas un checkout. La boutique native et les funnels préparent un devis. Ils
            n’encaissent pas. Claude sert de couche d’intelligence (chat catalogue, brief). Le
            catalogue, la session et la soumission restent chez le commerçant.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Où lire le produit</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-mk-muted">
            <li>
              <Link href="/comment-ca-marche" className="font-medium text-mk-accent hover:underline">
                Comment ça marche
              </Link>
              {" : "}
              la chaîne offre, funnel, dossier, autopilote.
            </li>
            <li>
              <Link href="/fonctionnalites" className="font-medium text-mk-accent hover:underline">
                Fonctionnalités
              </Link>
              {" : "}
              huit modules reliés.
            </li>
            <li>
              <Link href="/tarifs" className="font-medium text-mk-accent hover:underline">
                Tarifs
              </Link>
              {" : "}
              Free, puis 39 / 79 / 159 € par mois en annuel.
            </li>
            <li>
              <Link href="/blog" className="font-medium text-mk-accent hover:underline">
                Blog
              </Link>{" "}
              et{" "}
              <Link href="/outils" className="font-medium text-mk-accent hover:underline">
                outils
              </Link>
              {" : "}
              relances, widget, sync boutique.
            </li>
          </ul>
        </article>
      </section>

      <MarketingCta title="Essayer le produit" text="Free sans carte. Vinci Liberta LTD, Dublin." />
    </>
  );
}
