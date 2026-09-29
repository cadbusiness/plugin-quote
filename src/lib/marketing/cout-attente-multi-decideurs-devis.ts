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

export const COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS = {
  devis: 40,
  pctMulti: 45,
  decideurs: 3,
  jours: 7,
  minutes: 55,
  taux: 55,
  panier: 12000,
  pctPerdus: 8,
} as const;

export const COUT_ATTENTE_MULTI_DECIDEURS_LABELS = {
  devis: "Devis envoyés / mois",
  pctMulti: "% envoyés à des comptes multi-décideurs",
  decideurs: "Nb décideurs moyen (côté client)",
  jours: "Jours d’attente additionnels vs mono-décideur",
  minutes: "Minutes perdues en relances / clarifications par devis bloqué",
  taux: "Taux horaire chargé (€)",
  panier: "Panier moyen HT (€)",
  pctPerdus: "% deals perdus ou fortement retardés faute de circuit clair",
  concernes: "Devis multi-décideurs concernés / mois",
  jh: "Jours-homme équivalents d’attente / mois",
  heures: "Heures / mois perdues (relances / clarifications)",
  coutTemps: "Coût temps (relances chargées)",
  opp: "Opportunités perdues / retardées indicatives / mois",
  total: "Coût total indicatif mensuel",
} as const;

export type CoutAttenteMultiDecideursInput = {
  devis: number;
  pctMulti: number;
  decideurs: number;
  jours: number;
  minutes: number;
  taux: number;
  panier: number;
  pctPerdus: number;
};

export type CoutAttenteMultiDecideursTone = "ok" | "warn" | "bad";
export type CoutAttenteMultiDecideursAlertTone = CoutAttenteMultiDecideursTone | "neutral";

export type CoutAttenteMultiDecideursResult = {
  devis: number;
  pctMulti: number;
  decideurs: number;
  jours: number;
  minutes: number;
  taux: number;
  panier: number;
  pctPerdus: number;
  concernes: number;
  jh: number;
  heures: number;
  coutTemps: number;
  deals: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutAttenteMultiDecideursAlertTone;
  totalTone: CoutAttenteMultiDecideursTone;
  oppTone: CoutAttenteMultiDecideursTone | "neutral";
  alert: string;
  tip: string;
  concernesLabel: string;
  jhLabel: string;
  heuresLabel: string;
  coutTempsLabel: string;
  dealsLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutAttenteMultiDecideurs(
  input: CoutAttenteMultiDecideursInput,
): CoutAttenteMultiDecideursResult {
  const devis = clamp(finite(input.devis), 0, 100000);
  const pctMulti = clamp(finite(input.pctMulti), 0, 100);
  const decideurs = clamp(finite(input.decideurs, 3), 1, 20);
  const jours = clamp(finite(input.jours), 0, 365);
  const minutes = clamp(finite(input.minutes), 0, 480);
  const taux = clamp(finite(input.taux), 0, 10000);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const pctPerdus = clamp(finite(input.pctPerdus), 0, 100);

  const concernes = round1((devis * pctMulti) / 100);
  // Stock de cycle : devis × jours d’attente / 20 j ouvrés. Pas des heures facturables.
  const jh = round1((concernes * jours) / 20);
  const heures = round1((concernes * minutes) / 60);
  const coutTemps = Math.round(heures * taux);
  const deals = round1(concernes * (pctPerdus / 100));

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(deals * panier);
  }
  const total = coutTemps + (opp ?? 0);

  let alertTone: CoutAttenteMultiDecideursAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (devis <= 0) {
    alert = "Indiquez un volume de devis / mois pour estimer le coût de l’attente multi-décideurs.";
    tip =
      "Même 20-30 devis / mois avec 40 % multi-décideurs révèlent souvent des jours de cycle et des heures de relance.";
  } else if (total >= 25000 || heures >= 18) {
    alertTone = "bad";
    alert = `Friction multi-décideurs élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : lien unique, invitations de relecteurs, badges vu / approuvé / modifs, versions, signature sur la bonne Vn.";
  } else if (total >= 8000 || heures >= 8) {
    alertTone = "warn";
    alert = `Friction multi-décideurs notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez d’abord les Hot / paniers élevés. Mesurez le délai invitation → premier signal (vu, modifs, approuvé).";
  } else {
    alertTone = "ok";
    alert = `Friction multi-décideurs contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez le circuit léger. Surveillez quand même les PDF forwardés et les signatures sur version morte.";
  }

  const totalTone: CoutAttenteMultiDecideursTone = total >= 25000 ? "bad" : total >= 8000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutAttenteMultiDecideursTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 15000 ? "bad" : oppValue >= 5000 ? "warn" : "ok";

  const concernesLabel = fmtNumber(concernes, 1);
  const jhLabel = `${fmtNumber(jh, 1)} j-h`;
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutTempsLabel = fmtEuro(coutTemps);
  const dealsLabel = fmtNumber(deals, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût attente multi-décideurs sur devis (indicatif)",
    `Devis envoyés / mois : ${fmtNumber(devis, 0)}`,
    `% multi-décideurs : ${fmtNumber(pctMulti, 0)} %`,
    `Devis concernés : ${fmtNumber(concernes, 1)}`,
    `Nb décideurs moyen : ${fmtNumber(decideurs, 1)}`,
    `Jours d’attente additionnels : ${fmtNumber(jours, 1)}`,
    `Jours-homme équivalents d’attente / mois : ${fmtNumber(jh, 1)}`,
    `Minutes perdues / devis bloqué : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues (relances) : ${heuresLabel}`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps : ${coutTempsLabel}`,
    `% deals perdus / retardés : ${fmtNumber(pctPerdus, 1)} %`,
    `Deals concernés : ${dealsLabel}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Lien unique (pas de PDF forwardé pour les comptes multi-décideurs)",
    "- Invitations relecteurs (achats / technique / finance)",
    "- Badges vu / approuvé / demande de modifs",
    "- Commentaires ancrés + versions",
    "- Notifications invitation / approbation / modifs / validation",
    "- Signature sur la dernière version propre",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    devis,
    pctMulti,
    decideurs,
    jours,
    minutes,
    taux,
    panier,
    pctPerdus,
    concernes,
    jh,
    heures,
    coutTemps,
    deals,
    opp,
    total,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    concernesLabel,
    jhLabel,
    heuresLabel,
    coutTempsLabel,
    dealsLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
