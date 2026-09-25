function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function round1(n: number) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function fmtEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function fmtNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export const COUT_EMAILS_CLARIFICATION_DEFAULTS = {
  devis: 35,
  pctClarif: 55,
  mails: 6,
  minutes: 8,
  taux: 55,
  pctPerdus: 4,
  panier: 7200,
} as const;

export type CoutEmailsClarificationInput = {
  devis: number;
  pctClarif: number;
  mails: number;
  minutes: number;
  taux: number;
  pctPerdus: number;
  panier: number;
};

export type CoutEmailsClarificationTone = "ok" | "warn" | "bad";
export type CoutEmailsClarificationAlertTone = CoutEmailsClarificationTone | "neutral";

export type CoutEmailsClarificationResult = {
  devis: number;
  pctClarif: number;
  mails: number;
  minutes: number;
  taux: number;
  pctPerdus: number;
  panier: number;
  dossiers: number;
  mailsMois: number;
  heures: number;
  coutTemps: number;
  dealsPerdus: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutEmailsClarificationAlertTone;
  totalTone: CoutEmailsClarificationTone;
  oppTone: CoutEmailsClarificationTone | "neutral";
  alert: string;
  tip: string;
  dossiersLabel: string;
  mailsLabel: string;
  heuresLabel: string;
  coutTempsLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutEmailsClarification(
  input: CoutEmailsClarificationInput,
): CoutEmailsClarificationResult {
  const devis = clamp(finite(input.devis), 0, 100000);
  const pctClarif = clamp(finite(input.pctClarif), 0, 100);
  const mails = clamp(finite(input.mails), 0, 200);
  const minutes = clamp(finite(input.minutes), 0, 240);
  const taux = clamp(finite(input.taux), 0, 10000);
  const pctPerdus = clamp(finite(input.pctPerdus), 0, 100);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);

  const dossiers = round1((devis * pctClarif) / 100);
  const mailsMois = round1(dossiers * mails);
  const heures = round1((mailsMois * minutes) / 60);
  const coutTemps = Math.round(heures * taux);
  const dealsPerdus = round1(dossiers * (pctPerdus / 100));

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(dealsPerdus * panier);
  }
  const total = coutTemps + (opp ?? 0);

  let alertTone: CoutEmailsClarificationAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (devis <= 0) {
    alert = "Indiquez un volume de devis / mois pour estimer la friction mail.";
    tip = "Même 20-30 devis / mois révèlent souvent des heures de RE: RE: et de recherche de version.";
  } else if (total >= 15000 || heures >= 12) {
    alertTone = "bad";
    alert = `Friction clarification élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : devis en lien sécurisé, commentaires / annotations ancrés, et clôture des threads avant signature.";
  } else if (total >= 5000 || heures >= 5) {
    alertTone = "warn";
    alert = `Friction clarification notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez les réponses dans le devis partagé. Mesurez mails / devis et % signatures sur la mauvaise version.";
  } else {
    alertTone = "ok";
    alert = `Friction clarification contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez le réflexe « décision dans le devis ». Surveillez les multi-décideurs qui forwardent encore le PDF.";
  }

  const totalTone: CoutEmailsClarificationTone = total >= 15000 ? "bad" : total >= 5000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutEmailsClarificationTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 10000 ? "bad" : oppValue >= 3000 ? "warn" : "ok";

  const dossiersLabel = fmtNumber(dossiers, 1);
  const mailsLabel = fmtNumber(mailsMois, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutTempsLabel = fmtEuro(coutTemps);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût e-mails de clarification devis (indicatif)",
    `Devis / mois : ${fmtNumber(devis, 0)}`,
    `% avec clarification mail : ${fmtNumber(pctClarif, 0)} %`,
    `Devis concernés : ${fmtNumber(dossiers, 1)}`,
    `Mails moyens / clarification : ${fmtNumber(mails, 1)}`,
    `Mails / mois : ${fmtNumber(mailsMois, 1)}`,
    `Minutes / mail : ${fmtNumber(minutes, 0)}`,
    `Heures / mois : ${fmtNumber(heures, 1)} h`,
    `Coût horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps : ${fmtEuro(coutTemps)}`,
    `% deals perdus faute de clarté : ${fmtNumber(pctPerdus, 1)} %`,
    `Deals perdus estimés : ${fmtNumber(dealsPerdus, 1)}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités perdues : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${fmtEuro(total)}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Envoyer le devis en lien sécurisé (pas PDF seul)",
    "- Commentaires / annotations ancrés par ligne",
    "- Notifications owner + BE sur dossiers techniques",
    "- Nouvelle version si le chiffrage change",
    "- Signature seulement si threads critiques résolus",
    "- Mesurer mails de clarification / devis chaque mois",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    devis,
    pctClarif,
    mails,
    minutes,
    taux,
    pctPerdus,
    panier,
    dossiers,
    mailsMois,
    heures,
    coutTemps,
    dealsPerdus,
    opp,
    total,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    dossiersLabel,
    mailsLabel,
    heuresLabel,
    coutTempsLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
