"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  CONFIRMATION_EMAIL_DEFAULTS,
  buildConfirmationEmail,
  type ConfirmationEtape,
  type ConfirmationFormat,
  type ConfirmationTone,
  type ConfirmationUnite,
} from "@/lib/marketing/generateur-email-confirmation-demande-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

function checkPrefix(tone: ConfirmationTone) {
  if (tone === "ok") return "OK. ";
  if (tone === "bad") return "À corriger. ";
  if (tone === "warn") return "À vérifier. ";
  return "";
}

function checkClass(tone: ConfirmationTone) {
  if (tone === "ok") return "text-emerald-800";
  if (tone === "warn") return "text-amber-900";
  if (tone === "bad") return "text-rose-800";
  return "text-mk-muted";
}

function alertClass(tone: ConfirmationTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}

export function GenerateurEmailConfirmationDemandeDevisGenerator() {
  const [entreprise, setEntreprise] = useState(CONFIRMATION_EMAIL_DEFAULTS.entreprise);
  const [signataire, setSignataire] = useState(CONFIRMATION_EMAIL_DEFAULTS.signataire);
  const [email, setEmail] = useState(CONFIRMATION_EMAIL_DEFAULTS.email);
  const [telephone, setTelephone] = useState(CONFIRMATION_EMAIL_DEFAULTS.telephone);
  const [delai, setDelai] = useState(String(CONFIRMATION_EMAIL_DEFAULTS.delai));
  const [unite, setUnite] = useState<ConfirmationUnite>(CONFIRMATION_EMAIL_DEFAULTS.unite);
  const [delaiReel, setDelaiReel] = useState(String(CONFIRMATION_EMAIL_DEFAULTS.delaiReel));
  const [etape, setEtape] = useState<ConfirmationEtape>(CONFIRMATION_EMAIL_DEFAULTS.etape);
  const [reprise, setReprise] = useState(CONFIRMATION_EMAIL_DEFAULTS.reprise);
  const [pdf, setPdf] = useState(CONFIRMATION_EMAIL_DEFAULTS.pdf);
  const [fourchette, setFourchette] = useState(CONFIRMATION_EMAIL_DEFAULTS.fourchette);
  const [suivi, setSuivi] = useState(CONFIRMATION_EMAIL_DEFAULTS.suivi);
  const [membres, setMembres] = useState(CONFIRMATION_EMAIL_DEFAULTS.membres);
  const [format, setFormat] = useState<ConfirmationFormat>(CONFIRMATION_EMAIL_DEFAULTS.format);
  const [delaiRassurant, setDelaiRassurant] = useState(String(CONFIRMATION_EMAIL_DEFAULTS.delaiRassurant));

  const result = useMemo(
    () =>
      buildConfirmationEmail({
        entreprise,
        signataire,
        email,
        telephone,
        delai,
        unite,
        delaiReel,
        etape,
        reprise,
        pdf,
        fourchette,
        suivi,
        membres,
        format,
        delaiRassurant,
      }),
    [
      entreprise,
      signataire,
      email,
      telephone,
      delai,
      unite,
      delaiReel,
      etape,
      reprise,
      pdf,
      fourchette,
      suivi,
      membres,
      format,
      delaiRassurant,
    ],
  );

  return (
    <div className="space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">Votre entreprise</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block" htmlFor="entreprise">
            <span className="text-sm font-medium">Nom de l&apos;entreprise</span>
            <input
              id="entreprise"
              maxLength={80}
              className={fieldClass}
              value={entreprise}
              onChange={(event) => setEntreprise(event.target.value)}
            />
          </label>
          <label className="block" htmlFor="signataire">
            <span className="text-sm font-medium">Signature (prénom, service)</span>
            <input
              id="signataire"
              maxLength={80}
              className={fieldClass}
              value={signataire}
              onChange={(event) => setSignataire(event.target.value)}
            />
          </label>
          <label className="block" htmlFor="email">
            <span className="text-sm font-medium">Email joignable</span>
            <input
              id="email"
              maxLength={80}
              className={fieldClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block" htmlFor="telephone">
            <span className="text-sm font-medium">Téléphone</span>
            <input
              id="telephone"
              maxLength={80}
              className={fieldClass}
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
            />
          </label>
        </div>

        <h2 className="mt-8 text-base font-semibold">Délai et prochaine étape</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block" htmlFor="delai">
            <span className="text-sm font-medium">Délai annoncé</span>
            <input
              id="delai"
              type="number"
              min={0}
              max={99}
              step={1}
              className={fieldClass}
              value={delai}
              onChange={(event) => setDelai(event.target.value)}
            />
          </label>
          <label className="block" htmlFor="unite">
            <span className="text-sm font-medium">Unité</span>
            <select
              id="unite"
              className={fieldClass}
              value={unite}
              onChange={(event) => setUnite(event.target.value as ConfirmationUnite)}
            >
              <option value="jours">jours ouvrés</option>
              <option value="heures">heures ouvrées</option>
            </select>
          </label>
          <label className="block" htmlFor="delaiReel">
            <span className="text-sm font-medium">Délai réellement tenu (même unité)</span>
            <input
              id="delaiReel"
              type="number"
              min={0}
              max={99}
              step={1}
              className={fieldClass}
              value={delaiReel}
              onChange={(event) => setDelaiReel(event.target.value)}
            />
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Mesuré sur vos dernières demandes : réception jusqu&apos;au premier contact utile. 0 si vous ne savez pas.
            </span>
          </label>
          <label className="block" htmlFor="etape">
            <span className="text-sm font-medium">Prochaine étape</span>
            <select
              id="etape"
              className={fieldClass}
              value={etape}
              onChange={(event) => setEtape(event.target.value as ConfirmationEtape)}
            >
              <option value="appel">Appel pour valider le besoin</option>
              <option value="email">Email avec nos questions</option>
              <option value="visite">Visite sur site avant chiffrage</option>
              <option value="devis">Envoi du devis chiffré</option>
            </select>
          </label>
        </div>
        <label className="mt-4 block" htmlFor="reprise">
          <span className="text-sm font-medium">Fermeture en cours : date de reprise (facultatif)</span>
          <input
            id="reprise"
            maxLength={40}
            placeholder="4 novembre"
            className={fieldClass}
            value={reprise}
            onChange={(event) => setReprise(event.target.value)}
          />
          <span className="mt-1 block text-[12px] leading-5 text-mk-faint">Laissez vide en temps normal.</span>
        </label>

        <h2 className="mt-8 text-base font-semibold">Contenu du message</h2>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-start gap-2">
            <input id="pdf" type="checkbox" className="mt-1" checked={pdf} onChange={(event) => setPdf(event.target.checked)} />
            <span>Récapitulatif PDF joint</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              id="fourchette"
              type="checkbox"
              className="mt-1"
              checked={fourchette}
              onChange={(event) => setFourchette(event.target.checked)}
            />
            <span>Rappeler la fourchette indicative</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              id="suivi"
              type="checkbox"
              className="mt-1"
              checked={suivi}
              onChange={(event) => setSuivi(event.target.checked)}
            />
            <span>Lien de suivi et code PIN pour compléter la demande</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              id="membres"
              type="checkbox"
              className="mt-1"
              checked={membres}
              onChange={(event) => setMembres(event.target.checked)}
            />
            <span>Lien vers un espace membres publié</span>
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block" htmlFor="format">
            <span className="text-sm font-medium">Variables</span>
            <select
              id="format"
              className={fieldClass}
              value={format}
              onChange={(event) => setFormat(event.target.value as ConfirmationFormat)}
            >
              <option value="quotebuilder">Variables QuoteBuilder</option>
              <option value="neutre">Repères neutres à remplacer</option>
            </select>
          </label>
          <label className="block" htmlFor="delaiRassurant">
            <span className="text-sm font-medium">Délai annoncé dans l&apos;email rassurant (heures)</span>
            <input
              id="delaiRassurant"
              type="number"
              min={0}
              max={999}
              step={1}
              className={fieldClass}
              value={delaiRassurant}
              onChange={(event) => setDelaiRassurant(event.target.value)}
            />
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              QuoteBuilder : « Retour sous 48h » par défaut. 0 si vous n&apos;envoyez pas ce message.
            </span>
          </label>
        </div>
        <p className="mt-4 text-[12px] leading-5 text-mk-faint">
          Les valeurs par défaut sont des exemples, pas des recommandations. Remplacez-les par vos propres informations.
        </p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Objet</h2>
        <p className="mt-4 whitespace-pre-wrap rounded-xl bg-mk-bg px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border">
          {result.subject}
        </p>
        <div className="mt-3">
          <CopyButton text={result.subject} label="Copier" />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Texte du message</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-mk-bg px-3 py-3 font-sans text-sm leading-6 text-mk-ink ring-1 ring-mk-border">
          {result.body}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={result.body} label="Copier" />
          <CopyButton text={result.recap} label="Copier objet et texte" />
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          {result.lines} lignes de texte, {result.words} mots.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Vérifications</h2>
        <p className={`mt-4 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
          {result.verdict.text}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
          {result.checks.map((check) => (
            <li key={`${check.tone}-${check.text}`} className={checkClass(check.tone)}>
              {checkPrefix(check.tone)}
              {check.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Dans QuoteBuilder</h2>
        <p className="mt-3 text-sm leading-6 text-mk-muted">
          Le texte se colle dans Paramètres, rubrique Emails, bloc « Email · prospect_confirm » (réservé aux
          administrateurs). L&apos;email part en texte simple, avec un seul modèle pour tous vos funnels. Envoyez-vous
          une demande de test avant de publier.
        </p>
        <Link
          href="/signup?plan=free"
          className="mt-4 inline-flex rounded-full bg-mk-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
        >
          Créer un compte Free
        </Link>
      </section>
    </div>
  );
}
