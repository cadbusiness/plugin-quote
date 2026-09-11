import type { Metadata } from "next";
import Link from "next/link";
import { LegalDraftBanner } from "@/components/marketing/legal-draft-banner";
import { COMPANY, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions d’utilisation",
  description: `Conditions d’utilisation de ${COMPANY.product}, brouillon édité par ${COMPANY.legalName} (Dublin). À valider par un avocat.`,
  path: "/legal/cgu",
});

export default function CguPage() {
  return (
    <article className="px-6 pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Légal</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
          Conditions d’utilisation
        </h1>
        <p className="mt-3 text-sm text-mk-faint">Dernière mise à jour : 11 septembre 2026 · Brouillon</p>
        <div className="mt-6">
          <LegalDraftBanner />
        </div>

        <div className="mt-10 space-y-8 text-[16px] leading-7 text-mk-muted">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-mk-ink">1. Éditeur</h2>
            <p className="mt-3">
              Le service {COMPANY.product} est édité par {COMPANY.legalName}, société de droit
              irlandais dont le siège est à {COMPANY.city}, {COMPANY.country}. Numéro
              d’enregistrement : [à compléter]. Adresse postale : [à compléter]. Contact :{" "}
              <a className="font-medium text-mk-accent" href={`mailto:${COMPANY.email}`}>
                {COMPANY.email}
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-mk-ink">2. Objet</h2>
            <p className="mt-3">
              {COMPANY.product} est un logiciel en ligne de parcours de devis B2B : funnels,
              catalogue, pipeline, relances, intégrations. Il prépare des demandes de devis. Il
              n’encaisse pas de paiements pour le compte des clients, sauf mention contraire écrite
              dans une commande ultérieure.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-mk-ink">3. Compte</h2>
            <p className="mt-3">
              L’accès au dashboard suppose un compte. Vous êtes responsable des identifiants, des
              contenus (catalogue, e-mails, données prospects) et du respect des lois applicables à
              votre activité. Le plan Free est limité (funnel, wizard, soumissions). Les plans
              payants sont décrits sur{" "}
              <Link href="/tarifs" className="font-medium text-mk-accent hover:underline">
                /tarifs
              </Link>
              . Les prix annuels de référence sont 39 / 79 / 159 € par mois (Starter / Pro /
              Agency), hors taxes le cas échéant, [régime TVA à confirmer].
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-mk-ink">4. Données des prospects</h2>
            <p className="mt-3">
              Lorsque vous utilisez un funnel, vous êtes responsable de traitement pour les données
              que vos prospects saisissent. {COMPANY.legalName} agit comme sous-traitant selon la{" "}
              <Link href="/legal/confidentialite" className="font-medium text-mk-accent hover:underline">
                politique de confidentialité
              </Link>{" "}
              et un DPA [à joindre]. Vous devez informer vos prospects et recueillir les bases
              légales nécessaires.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-mk-ink">5. Disponibilité et responsabilité</h2>
            <p className="mt-3">
              Le service est fourni « en l’état ». [Clause de disponibilité / SLA à rédiger].
              {COMPANY.legalName} ne saurait être responsable des devis que vous émettez, des
              relances que vous activez, ni des décisions commerciales de vos prospects. Plafond de
              responsabilité : [à compléter].
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-mk-ink">6. Droit applicable</h2>
            <p className="mt-3">
              Droit irlandais, tribunaux de Dublin, sauf disposition impérative contraire [à
              valider, clients UE / consommateurs].
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
