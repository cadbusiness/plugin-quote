import type { Metadata } from "next";
import Link from "next/link";
import { TempsDemandesSuiviDevisClientsCalculator } from "@/components/marketing/temps-demandes-suivi-devis-clients-calculator";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/estimateur-temps-demandes-suivi-devis-clients";

export const metadata: Metadata = pageMetadata({
  title: "Estimateur du temps passé sur les demandes de suivi des clients",
  description:
    "Estimez le temps que votre équipe passe chaque mois à répondre aux clients qui demandent où en est leur devis ou qui réclament une notice, et ce qu'un espace membres en libre-service vous rend, mise en place et entretien déduits. Calcul 100 % local.",
  path: PATH,
});

export default function EstimateurTempsDemandesSuiviDevisClientsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estimateur du temps passé sur les demandes de suivi des clients",
    url: `${SITE_URL}${PATH}`,
    description:
      "Estime le temps passé chaque mois à répondre aux clients qui suivent leurs demandes de devis ou réclament un document, et ce qu'un espace membres en libre-service rend, entretien déduit. Calcul local.",
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
            Estimateur du temps passé sur les demandes de suivi des clients
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            « Où en est mon devis ? », « Vous pouvez me renvoyer le lien ? », « Vous aviez une notice de montage » :
            chaque question est courte, mais elle oblige à retrouver le bon dossier avant de répondre. Renseignez vos
            hypothèses : le calcul dit combien d&apos;heures ces questions prennent chaque mois, et ce qu&apos;un espace
            membres où le client retrouve seul ses demandes et vos documents communs vous rend, mise en place et
            entretien déduits.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <TempsDemandesSuiviDevisClientsCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pour lire vos chiffres</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Questions de suivi par mois : clients multipliés par les questions par client. Les heures de réponse
          multiplient ces questions par les minutes, puis divisent par 60. Les heures de renvoi de documents font le
          même calcul avec les documents renvoyés et les minutes par renvoi. Le coût de ce temps multiplie le total
          d&apos;heures par le coût horaire.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Les questions évitées gardent la part des questions qui portent sur une demande de moins de 30 jours, puis
          la part que le client réglerait seul. Les heures rendues additionnent le temps de ces questions et la même
          part appliquée aux heures de documents. Si aucune heure n&apos;est comptée aujourd&apos;hui, la part du temps
          rendue reste à zéro.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          L&apos;entretien (minutes divisées par 60) et la mise en place divisée par 12 sont retirés du gain. Les
          heures nettes ne descendent pas sous zéro. Le délai de retour divise les heures de mise en place par les
          heures évitées moins l&apos;entretien. Il n&apos;est pas calculé si ce solde est nul ou négatif.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le calcul ne compte que le temps. Il ne prête à l&apos;espace aucun effet sur le taux de signature, et
          suppose que vos clients reçoivent bien le lien de l&apos;espace dans leurs emails. Toutes les valeurs par
          défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/espace-membres-portail-client-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Espace membres : un portail pour tous les devis d&apos;un client
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/espace-prospect"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            L&apos;espace prospect dans QuoteBuilder
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
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Calcul local · aucune donnée envoyée. Résultat indicatif, fondé sur vos hypothèses.
        </p>
      </section>

      <MarketingCta
        title="Retrouver toutes les demandes au même endroit."
        text="Compte Free sans carte. Un Propriétaire ou un Admin publie l'espace membres. La démo rayonnage montre le parcours public."
      />
    </>
  );
}
