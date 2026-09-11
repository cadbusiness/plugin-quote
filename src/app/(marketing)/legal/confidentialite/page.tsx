import type { Metadata } from "next";
import Link from "next/link";
import { LegalDraftBanner } from "@/components/marketing/legal-draft-banner";
import { COMPANY, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: `Politique de confidentialité ${COMPANY.product} (${COMPANY.legalName}, Dublin). Brouillon RGPD, à valider par un avocat.`,
  path: "/legal/confidentialite",
});

export default function PrivacyPage() {
  return (
    <article className="px-6 pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">Légal</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-[#1A1510]/45">Dernière mise à jour : 11 septembre 2026 · Brouillon</p>
        <div className="mt-6">
          <LegalDraftBanner />
        </div>

        <div className="mt-10 space-y-8 text-[16px] leading-7 text-[#1A1510]/75">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1510]">1. Responsable</h2>
            <p className="mt-3">
              Pour les données des comptes clients (inscription, facturation, logs d’usage) :{" "}
              {COMPANY.legalName}, {COMPANY.city}, {COMPANY.country}. Contact :{" "}
              <a className="font-medium text-[#E85D04]" href={`mailto:${COMPANY.email}`}>
                {COMPANY.email}
              </a>
              . DPO / représentant UE : [à nommer si requis].
            </p>
            <p className="mt-3">
              Pour les données que vos prospects saisissent dans un funnel, vous êtes en principe
              responsable de traitement. {COMPANY.product} héberge et traite ces données sur vos
              instructions. Détails : [DPA / annexes à joindre].
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1510]">2. Données collectées</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Compte : e-mail, mot de passe (hash), organisation, rôle.</li>
              <li>Facturation : [prestataire de paiement à préciser], identifiants de plan.</li>
              <li>Usage : événements funnel, soumissions, journaux techniques.</li>
              <li>Prospects (pour le compte du client) : identité progressive, réponses, fichiers.</li>
              <li>Cookies / mesure : [liste à figer : analytics, session, Ads si connecté].</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1510]">3. Finalités et bases</h2>
            <p className="mt-3">
              Exécution du contrat (fournir le logiciel), intérêt légitime (sécurité, amélioration
              du service), obligation légale (comptabilité), consentement le cas échéant (cookies
              non essentiels, e-mails marketing). [Matrice finalités × bases à valider].
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1510]">4. Destinataires et sous-traitants</h2>
            <p className="mt-3">
              Hébergement et infrastructure : [Vercel / Supabase / e-mail, à lister]. Transferts
              hors UE : [mécanisme SCC / décision d’adéquation à documenter]. Pas de vente de
              données prospects à des tiers à des fins publicitaires.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1510]">5. Durées</h2>
            <p className="mt-3">
              Compte : durée de la relation + [X] mois. Prospects : selon vos instructions et
              votre politique. Sauvegardes : [durée]. Logs : [durée].
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1510]">6. Droits</h2>
            <p className="mt-3">
              Accès, rectification, effacement, limitation, opposition, portabilité, réclamation
              auprès d’une autorité (Irlande : DPC ; France : CNIL, selon le cas). Exercice :{" "}
              {COMPANY.email}. Les prospects de nos clients s’adressent d’abord au commerçant qui
              a déployé le funnel.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1510]">7. Documents liés</h2>
            <p className="mt-3">
              <Link href="/legal/cgu" className="font-medium text-[#E85D04] hover:underline">
                Conditions d’utilisation
              </Link>
              .{" "}
              <Link href="/a-propos" className="font-medium text-[#E85D04] hover:underline">
                À propos de l’éditeur
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
