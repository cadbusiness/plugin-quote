import type { Metadata } from "next";
import Link from "next/link";
import { CoutAccesMalCadresEquipeDevisCalculator } from "@/components/marketing/cout-acces-mal-cadres-equipe-devis-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/estimateur-cout-acces-mal-cadres-equipe-devis";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur du coût des accès mal cadrés dans une équipe devis",
  description:
    "Estimez ce que coûtent chaque mois des Admins en trop qui modifient funnels et catalogue, et des commerciaux bloqués qui attendent un accès ou un Admin. Heures perdues, affaires refroidies, mise en ordre des rôles amortie. Calcul 100 % local.",
  path: PATH,
});

export default function EstimateurCoutAccesMalCadresEquipeDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur du coût des accès mal cadrés dans une équipe devis",
    url: `${SITE_URL}${PATH}`,
    description:
      "Estime ce que coûtent chaque mois des Admins en trop qui modifient funnels et catalogue, et des commerciaux bloqués qui attendent un accès. Calcul local.",
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
            Estimateur du coût des accès mal cadrés dans une équipe devis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Deux fuites se cachent derrière des rôles mal répartis : des Admins qui n&apos;en ont pas besoin et qui
            modifient un funnel, le catalogue ou une automatisation par erreur, et des commerciaux qui attendent un
            accès, un collègue ou un Admin pour répondre à un prospect. Renseignez vos hypothèses : le calcul dit ce
            que ces deux fuites coûtent chaque mois, et ce qu&apos;une répartition propre Propriétaire, Admin,
            Commercial vous évite.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <CoutAccesMalCadresEquipeDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pour lire vos chiffres</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Incidents de configuration : comptes Admin en trop multipliés par les incidents par Admin et par mois. Les
          heures de correction multiplient ces incidents par les heures pour en repérer et corriger un.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Heures de blocage : blocages par mois multipliés par les minutes perdues, divisés par 60. Le coût de ce
          temps additionne les heures de correction et de blocage, puis les multiplie par le coût horaire.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les affaires refroidies appliquent les points de signature perdus aux demandes où le prospect attend sa
          réponse. Le chiffre d&apos;affaires manqué multiplie ces affaires par le panier moyen.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          La mise en ordre est une dépense unique, divisée par 12, puis multipliée par le coût horaire. Le coût
          mensuel évité retire cette part du coût du temps et du chiffre d&apos;affaires manqué. Les heures nettes ne
          descendent pas sous zéro.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le calcul suppose qu&apos;une fois les rôles remis en ordre, les incidents venant des Admins en trop et les
          blocages disparaissent. C&apos;est une borne haute : une erreur de configuration reste possible chez un
          Admin légitime.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/roles-permissions-equipe-demande-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Rôles et permissions d&apos;équipe
          </Link>
          {" · "}
          <Link href="/fonctionnalites/equipe" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Équipe et rôles dans QuoteBuilder
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
        title="Donner à chacun le rôle qu'il utilise."
        text="Compte Free sans carte. Trois rôles : Propriétaire, Admin, Commercial. La démo rayonnage montre le parcours public."
      />
    </>
  );
}
