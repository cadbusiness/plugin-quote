"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { FUNNEL_FAMILIES } from "@/lib/funnels/families";

const TONES = [
  { id: "direct", label: "Direct" },
  { id: "warm", label: "Chaleureux" },
] as const;

type Tone = (typeof TONES)[number]["id"];

export type SequenceStep = {
  when: string;
  audience: "prospect" | "interne";
  subject: string;
  body: string;
};

export function buildSequence({
  company,
  offer,
  familyLabel,
  tone,
}: {
  company: string;
  offer: string;
  familyLabel: string;
  tone: Tone;
}): SequenceStep[] {
  const who = company.trim() || "notre équipe";
  const what = offer.trim() || "votre projet";
  const sector = familyLabel.toLowerCase();
  const vous = tone === "warm";

  return [
    {
      when: "T+0",
      audience: "prospect",
      subject: vous
        ? `${who} : nous avons bien reçu ${what}`
        : `Confirmation : ${what} est entre nos mains`,
      body: vous
        ? `Bonjour,\n\nMerci d’avoir pris le temps de configurer ${what}. Chez ${who}, on a ouvert le dossier : contraintes, volumes et budget indicatif sont déjà là. Un commercial vous répond sous 24 h avec une proposition cadrée, pas un « on vous rappelle ».\n\nEn attendant, votre espace prospect reste ouvert pour ajouter une photo, un plan ou une précision.\n\nÀ très vite,\n${who}`
        : `Bonjour,\n\nVotre demande concernant ${what} est enregistrée. Le dossier contient déjà le brief utile (${sector}). Nous revenons vers vous sous 24 h avec une proposition, pas une demande de précisions.\n\nVous pouvez compléter le dossier depuis le lien reçu.\n\n${who}`,
    },
    {
      when: "T+4 h",
      audience: "interne",
      subject: `Rappel : ${what} encore en statut Nouveau`,
      body: `Le devis « ${what} » n’a pas changé de statut depuis 4 heures. Score et réponses sont dans la fiche. Relancer maintenant évite que le prospect reparte sur un autre fournisseur.\n\nAssigner ou passer en Contacté depuis le pipeline.`,
    },
    {
      when: "T+24 h",
      audience: "prospect",
      subject: vous
        ? `Où en est ${what} ? Une mise au point`
        : `${what} : point d’étape à 24 h`,
      body: vous
        ? `Bonjour,\n\nOn voulait juste confirmer que ${what} est en étude de notre côté. Si une contrainte a bougé (délai, charge, lieu), répondez à cet e-mail ou déposez-la dans l’espace prospect, ça évite un devis à côté.\n\nSinon, on vous envoie la proposition comme prévu.\n\n${who}`
        : `Bonjour,\n\n${what} est en cours d’étude. Toute contrainte nouvelle (délai, volume, site) peut être ajoutée au dossier. Sinon, la proposition part comme convenu.\n\n${who}`,
    },
    {
      when: "T+3 j",
      audience: "prospect",
      subject: vous
        ? `On peut encore ajuster ${what}`
        : `Relance : ${what} est toujours ouvert`,
      body: vous
        ? `Bonjour,\n\nTrois jours après votre configuration, ${what} n’a pas encore abouti. C’est fréquent : le bon devis demande souvent plusieurs allers-retours, pas un PDF unique.\n\nDites-nous simplement si le besoin est toujours là, reporté, ou si un point bloque (prix, délai, variante). On reprend à partir du dossier, sans tout redemander.\n\n${who}`
        : `Bonjour,\n\n${what} est toujours ouvert de notre côté. Si le besoin a changé, répondez en une phrase. Sinon, nous pouvons renvoyer la proposition ou une variante.\n\n${who}`,
    },
    {
      when: "T+7 j",
      audience: "prospect",
      subject: vous
        ? `Un cas proche de ${what} (${sector})`
        : `Nurturing : retour d’expérience ${sector}`,
      body: vous
        ? `Bonjour,\n\nSur des projets ${sector} comme ${what}, le point qui fait souvent basculer la décision n’est pas le prix catalogue : c’est le brief (charge, délais, options réellement livrables).\n\nSi vous voulez, on reprend votre dossier 15 minutes, ou on classe sans suite, sans relance supplémentaire.\n\n${who}`
        : `Bonjour,\n\nPour les projets ${sector}, un brief complet réduit les allers-retours. Votre dossier ${what} est toujours disponible. Répondez « on continue » ou « plus tard », on adapte le suivi.\n\n${who}`,
    },
    {
      when: "T+30 j",
      audience: "prospect",
      subject: vous
        ? `${what} : on referme, ou on reprend ?`
        : `Réactivation : ${what} (J+30)`,
      body: vous
        ? `Bonjour,\n\nUn mois a passé depuis ${what}. On peut classer le dossier, ou le rouvrir si le projet revient dans le calendrier. Un oui / non suffit.\n\nMerci,\n${who}`
        : `Bonjour,\n\nDossier ${what} : clôture ou reprise. Répondez pour réactiver le suivi.\n\n${who}`,
    },
  ];
}

export function FollowupSequenceGenerator() {
  const [company, setCompany] = useState("Atelier Nord");
  const [offer, setOffer] = useState("le rayonnage de la réserve");
  const [familyId, setFamilyId] = useState("racking");
  const [tone, setTone] = useState<Tone>("direct");

  const family = FUNNEL_FAMILIES.find((item) => item.id === familyId) ?? FUNNEL_FAMILIES[0]!;
  const steps = useMemo(
    () => buildSequence({ company, offer, familyLabel: family.label, tone }),
    [company, offer, family.label, tone],
  );

  const allText = steps
    .map((step) => `[${step.when} · ${step.audience}]\nObjet : ${step.subject}\n\n${step.body}`)
    .join("\n\n---\n\n");

  return (
    <div>
      <form
        className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:grid-cols-2 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="block text-sm font-semibold">
          Nom de l’entreprise
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mk-border bg-mk-band px-3.5 py-2.5 text-sm font-normal outline-none focus:border-mk-accent/50 focus:ring-2 focus:ring-mk-accent/20"
          />
        </label>
        <label className="block text-sm font-semibold">
          Intitulé du projet
          <input
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mk-border bg-mk-band px-3.5 py-2.5 text-sm font-normal outline-none focus:border-mk-accent/50 focus:ring-2 focus:ring-mk-accent/20"
          />
        </label>
        <label className="block text-sm font-semibold">
          Secteur
          <select
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mk-border bg-mk-band px-3.5 py-2.5 text-sm font-normal outline-none focus:border-mk-accent/50"
          >
            {FUNNEL_FAMILIES.filter((item) => item.id !== "custom").map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="text-sm font-semibold">
          <legend>Ton</legend>
          <div className="mt-1.5 flex gap-2">
            {TONES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTone(item.id)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium ${
                  tone === item.id
                    ? "bg-mk-dark text-white"
                    : "bg-mk-bg text-mk-muted ring-1 ring-mk-border"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      </form>

      <div className="mt-4 flex justify-end">
        <CopyButton text={allText} label="Copier toute la séquence" />
      </div>

      <ol className="mt-6 space-y-4">
        {steps.map((step) => (
          <li key={step.when} className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-mk-dark px-2.5 py-1 text-[11px] font-semibold text-white">
                  {step.when}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    step.audience === "interne"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {step.audience === "interne" ? "Équipe" : "Prospect"}
                </span>
              </div>
              <CopyButton text={`Objet : ${step.subject}\n\n${step.body}`} />
            </div>
            <p className="mt-4 text-sm font-semibold">{step.subject}</p>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-[14px] leading-6 text-mk-muted">
              {step.body}
            </pre>
          </li>
        ))}
      </ol>
    </div>
  );
}
