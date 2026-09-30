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

export const COUT_PIPELINE_FANTOME_DEFAULTS = {
  ouverts: 85,
  pctFantome: 40,
  age: 75,
  minutes: 25,
  taux: 55,
  panier: 10000,
  pctPerdu: 35,
  pctGagne: 5,
} as const;

export const COUT_PIPELINE_FANTOME_LABELS = {
  ouverts: "Dossiers ouverts dans le pipeline",
  pctFantome: "% sans maj de statut depuis ≥30 jours",
  age: "Âge moyen de ces dossiers fantômes (jours)",
  minutes: "Minutes perdues / mois / dossier fantôme",
  taux: "Taux horaire chargé (€)",
  panier: "Panier moyen HT (€)",
  pctPerdu: "% de fantômes qui auraient dû être Perdu",
  pctGagne: "% qui auraient dû être Gagné (non closés)",
  fantomes: "Dossiers fantômes",
  heures: "Heures / mois perdues (suivi flou)",
  coutTemps: "Coût temps mensuel",
  opp: "Opportunités fantômes (Perdu potentiels × panier)",
  gagne: "Deals Gagné non closés (valeur indicative)",
  total: "Coût total indicatif mensuel (temps + opportunités)",
} as const;

export type CoutPipelineFantomeInput = {
  ouverts: number;
  pctFantome: number;
  age: number;
  minutes: number;
  taux: number;
  panier: number;
  pctPerdu: number;
  pctGagne: number;
};

export type CoutPipelineFantomeTone = "ok" | "warn" | "bad";
export type CoutPipelineFantomeAlertTone = CoutPipelineFantomeTone | "neutral";

export type CoutPipelineFantomeResult = {
  ouverts: number;
  pctFantome: number;
  age: number;
  minutes: number;
  taux: number;
  panier: number;
  pctPerdu: number;
  pctGagne: number;
  fantomes: number;
  heures: number;
  coutTemps: number;
  perdusPot: number;
  gagnePot: number;
  /** Null quand le panier est à 0 : les opportunités Perdu ne sont pas monétisées. */
  opp: number | null;
  /** Null quand le panier est à 0 : les Gagné non closés ne sont pas monétisés. */
  gagneVal: number | null;
  total: number;
  alertTone: CoutPipelineFantomeAlertTone;
  totalTone: CoutPipelineFantomeTone;
  oppTone: CoutPipelineFantomeTone | "neutral";
  gagneTone: CoutPipelineFantomeTone | "neutral";
  alert: string;
  tip: string;
  fantomesLabel: string;
  heuresLabel: string;
  coutTempsLabel: string;
  oppLabel: string;
  gagneLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutPipelineFantome(input: CoutPipelineFantomeInput): CoutPipelineFantomeResult {
  const ouverts = clamp(finite(input.ouverts), 0, 100000);
  const pctFantome = clamp(finite(input.pctFantome), 0, 100);
  const age = clamp(finite(input.age), 0, 3650);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const taux = clamp(finite(input.taux), 0, 10000);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const pctPerdu = clamp(finite(input.pctPerdu), 0, 100);
  const pctGagne = clamp(finite(input.pctGagne), 0, 100);

  const fantomes = round1((ouverts * pctFantome) / 100);
  const heures = round1((fantomes * minutes) / 60);
  const coutTemps = Math.round(heures * taux);
  const perdusPot = round1((fantomes * pctPerdu) / 100);
  const gagnePot = round1((fantomes * pctGagne) / 100);

  let opp: number | null = null;
  let gagneVal: number | null = null;
  if (panier > 0) {
    opp = Math.round(perdusPot * panier);
    gagneVal = Math.round(gagnePot * panier);
  }
  const total = coutTemps + (opp ?? 0);

  let alertTone: CoutPipelineFantomeAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (ouverts <= 0) {
    alert = "Indiquez un nombre de dossiers ouverts pour estimer le coût des fantômes.";
    tip =
      "Même 40-60 dossiers avec 30 % sans maj depuis 30 jours révèlent souvent des heures de suivi flou et des Perdu non posés.";
  } else if (total >= 80000 || heures >= 40 || fantomes >= 30 || pctFantome >= 45) {
    alertTone = "bad";
    alert = `Pipeline fantôme lourd · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : revue hebdo qui force Gagné / Perdu, distinguer En cours (ballon chez vous) et En attente (chez le client), supprimer les colonnes Accepté / Signé du CRM.";
  } else if (total >= 25000 || heures >= 15 || fantomes >= 12 || pctFantome >= 25) {
    alertTone = "warn";
    alert = `Pipeline fantôme notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Traitez d’abord les fantômes > 45 jours : sortie ou prochaine action datée. Posez les Perdu avec un motif court pour libérer de la capacité.";
  } else {
    alertTone = "ok";
    alert = `Pipeline plutôt tenu · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez le rituel. Surveillez l’âge moyen En cours / En attente et le ratio Gagné/(Gagné+Perdu).";
  }

  const totalTone: CoutPipelineFantomeTone = total >= 80000 ? "bad" : total >= 25000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutPipelineFantomeTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 100000 ? "bad" : oppValue >= 30000 ? "warn" : "ok";
  const gagneValue = gagneVal ?? 0;
  const gagneTone: CoutPipelineFantomeTone | "neutral" =
    panier <= 0 ? "neutral" : gagneValue >= 30000 ? "warn" : "ok";

  const fantomesLabel = fmtNumber(fantomes, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutTempsLabel = fmtEuro(coutTemps);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const gagneLabel = panier > 0 && gagneVal !== null ? fmtEuro(gagneVal) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût pipeline fantôme devis (indicatif)",
    `Dossiers ouverts : ${fmtNumber(ouverts, 0)}`,
    `% sans maj statut ≥30 j : ${fmtNumber(pctFantome, 0)} %`,
    `Dossiers fantômes : ${fmtNumber(fantomes, 1)}`,
    `Âge moyen fantômes : ${fmtNumber(age, 0)} j`,
    `Minutes / mois / fantôme : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues : ${heuresLabel}`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps mensuel : ${coutTempsLabel}`,
    `% fantômes → Perdu potentiels : ${fmtNumber(pctPerdu, 0)} % (${fmtNumber(perdusPot, 1)} dossiers)`,
    `% fantômes → Gagné non closés : ${fmtNumber(pctGagne, 0)} % (${fmtNumber(gagnePot, 1)} dossiers)`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités fantômes (Perdu) : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Valeur Gagné non closés : ${panier > 0 && gagneVal !== null ? fmtEuro(gagneVal) : "n/a"}`,
    `Coût total indicatif (temps + opportunités Perdu) : ${totalLabel}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- 7 statuts CRM seulement : Commencée, Nouveau, Contacté, En cours, En attente, Gagné, Perdu",
    "- Accepté / Signé ne sont pas des statuts CRM",
    "- En cours = ballon chez vous ; En attente = chez le client / tiers + date",
    "- Gagné / Perdu posés par le commercial (pas de signature prospect auto)",
    "- Score Hot / Warm / Cold = triage, pas un statut (formule fixe, pas de SLA produit)",
    "- Revue hebdo : forcer les sorties sur les fantômes > 30-45 j",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    ouverts,
    pctFantome,
    age,
    minutes,
    taux,
    panier,
    pctPerdu,
    pctGagne,
    fantomes,
    heures,
    coutTemps,
    perdusPot,
    gagnePot,
    opp,
    gagneVal,
    total,
    alertTone,
    totalTone,
    oppTone,
    gagneTone,
    alert,
    tip,
    fantomesLabel,
    heuresLabel,
    coutTempsLabel,
    oppLabel,
    gagneLabel,
    totalLabel,
    recap,
  };
}
