"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  MENTION_RGPD_DEFAULTS,
  buildMentions,
  type MentionBasePro,
  type MentionHorsUE,
} from "@/lib/marketing/generateur-mention-rgpd-formulaire-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

export function GenerateurMentionRgpdFormulaireDevisCalculator() {
  const [societe, setSociete] = useState(MENTION_RGPD_DEFAULTS.societe);
  const [adresse, setAdresse] = useState(MENTION_RGPD_DEFAULTS.adresse);
  const [email, setEmail] = useState(MENTION_RGPD_DEFAULTS.email);
  const [dpo, setDpo] = useState(MENTION_RGPD_DEFAULTS.dpo);
  const [url, setUrl] = useState(MENTION_RGPD_DEFAULTS.url);
  const [suivi, setSuivi] = useState(MENTION_RGPD_DEFAULTS.suivi);
  const [prospection, setProspection] = useState(MENTION_RGPD_DEFAULTS.prospection);
  const [basePro, setBasePro] = useState<MentionBasePro>(MENTION_RGPD_DEFAULTS.basePro);
  const [mesure, setMesure] = useState(MENTION_RGPD_DEFAULTS.mesure);
  const [duree, setDuree] = useState(String(MENTION_RGPD_DEFAULTS.duree));
  const [soustraitants, setSoustraitants] = useState(MENTION_RGPD_DEFAULTS.soustraitants);
  const [horsUE, setHorsUE] = useState<MentionHorsUE>(MENTION_RGPD_DEFAULTS.horsUE);
  const [garanties, setGaranties] = useState(MENTION_RGPD_DEFAULTS.garanties);

  const result = useMemo(
    () =>
      buildMentions({
        societe,
        adresse,
        email,
        dpo,
        url,
        suivi,
        prospection,
        basePro,
        mesure,
        duree,
        soustraitants,
        horsUE,
        garanties,
      }),
    [societe, adresse, email, dpo, url, suivi, prospection, basePro, mesure, duree, soustraitants, horsUE, garanties],
  );

  const tooLong = result.courteLength > 320;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Votre entreprise</legend>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Raison sociale</span>
            <input className={fieldClass} value={societe} onChange={(event) => setSociete(event.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Adresse du siège (facultatif)</span>
            <input
              className={fieldClass}
              value={adresse}
              placeholder="12 rue des Artisans, 69000 Lyon"
              onChange={(event) => setAdresse(event.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Email pour exercer ses droits</span>
            <input
              type="email"
              className={fieldClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Email du DPO (facultatif)</span>
            <input
              type="email"
              className={fieldClass}
              value={dpo}
              placeholder="dpo@exemple.fr"
              onChange={(event) => setDpo(event.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Adresse de votre page de confidentialité (facultatif)</span>
            <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} />
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Écrivez-la en entier : dans un sous-titre de funnel, elle s&apos;affiche en texte simple.
            </span>
          </label>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Ce que vous faites des données</legend>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={suivi} onChange={(event) => setSuivi(event.target.checked)} />
            <span>Suivre la demande et relancer le prospect au sujet de son devis</span>
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={prospection}
              onChange={(event) => setProspection(event.target.checked)}
            />
            <span>Lui envoyer plus tard des offres ou une newsletter</span>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Base de la prospection</span>
            <select
              className={fieldClass}
              value={basePro}
              disabled={!prospection}
              onChange={(event) => setBasePro(event.target.value as MentionBasePro)}
            >
              <option value="consentement">Consentement (case cochée par le prospect)</option>
              <option value="interet">Intérêt légitime, professionnels uniquement, avec opposition à tout moment</option>
            </select>
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Pour des particuliers, la prospection par email demande un consentement préalable.
            </span>
          </label>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={mesure} onChange={(event) => setMesure(event.target.checked)} />
            <span>
              Mesurer l&apos;audience du formulaire (Google Analytics, Tag Manager), avec votre outil de consentement
            </span>
          </label>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Conservation et destinataires</legend>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Durée de conservation sans contact (années)</span>
            <input
              type="number"
              min={1}
              max={10}
              step={1}
              className={fieldClass}
              value={duree}
              onChange={(event) => setDuree(event.target.value)}
            />
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Repère CNIL pour un prospect : 3 ans après la collecte ou le dernier contact venant de lui.
            </span>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Prestataires qui traitent les données pour vous</span>
            <input
              className={fieldClass}
              value={soustraitants}
              onChange={(event) => setSoustraitants(event.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Transfert hors de l&apos;Union européenne</span>
            <select
              className={fieldClass}
              value={horsUE}
              onChange={(event) => setHorsUE(event.target.value as MentionHorsUE)}
            >
              <option value="non">Non, ou je ne sais pas encore</option>
              <option value="oui">Oui</option>
            </select>
          </label>
          {horsUE === "oui" ? (
            <label className="mt-4 block">
              <span className="text-sm font-semibold">Garanties prévues</span>
              <input className={fieldClass} value={garanties} onChange={(event) => setGaranties(event.target.value)} />
            </label>
          ) : null}
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
          <h2 className="text-sm font-semibold">Mention courte, près du bouton d&apos;envoi</h2>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-mk-bg p-3 text-sm leading-6 ring-1 ring-mk-border">
            {result.courte}
          </p>
          <p className={`mt-2 text-xs ${tooLong ? "font-semibold text-amber-800" : "text-mk-faint"}`}>
            {result.courteLength} caractères
          </p>
          <div className="mt-3">
            <CopyButton text={result.courte} label="Copier" />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Dans QuoteBuilder : collez-la dans le sous-titre de l&apos;étape Vos coordonnées, depuis l&apos;éditeur du
            parcours.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Texte complet, pour votre page de confidentialité</h2>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-mk-bg p-3 text-sm leading-6 ring-1 ring-mk-border">
            {result.complete}
          </p>
          <div className="mt-3">
            <CopyButton text={result.complete} label="Copier" />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">À ne pas oublier</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-muted">
            {result.rappels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
