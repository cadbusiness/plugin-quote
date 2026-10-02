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

export const COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS = {
  dossiers: 50,
  pctSans: 45,
  minutes: 22,
  pctMorts: 8,
  taux: 60,
  panier: 6000,
} as const;

export const COUT_CONTEXTE_HORS_DOSSIER_LABELS = {
  dossiers: "Dossiers devis / mois",
  pctSans: "% sans notes internes utiles",
  minutes: "Minutes perdues / re-brief",
  pctMorts: "% dossiers morts / clarif faute de contexte",
  taux: "Taux horaire chargé (€)",
  panier: "Panier moyen indicatif (€)",
  fragiles: "Dossiers fragiles / mois (sans notes utiles)",
  heures: "Heures perdues / mois (re-brief)",
  coutTemps: "Coût temps",
  opp: "Opportunités indicatives perdues / mois",
  total: "Coût total indicatif mensuel",
} as const;

export type CoutContexteHorsDossierInput = {
  dossiers: number;
  pctSans: number;
  minutes: number;
  pctMorts: number;
  taux: number;
  panier: number;
};

export type CoutContexteHorsDossierTone = "ok" | "warn" | "bad";
export type CoutContexteHorsDossierAlertTone = CoutContexteHorsDossierTone | "neutral";

export type CoutContexteHorsDossierResult = {
  dossiers: number;
  pctSans: number;
  minutes: number;
  pctMorts: number;
  taux: number;
  panier: number;
  fragiles: number;
  heures: number;
  coutTemps: number;
  morts: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutContexteHorsDossierAlertTone;
  totalTone: CoutContexteHorsDossierTone;
  oppTone: CoutContexteHorsDossierTone | "neutral";
  alert: string;
  tip: string;
  fragilesLabel: string;
  heuresLabel: string;
  coutTempsLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutContexteHorsDossier(
  input: CoutContexteHorsDossierInput,
): CoutContexteHorsDossierResult {
  const dossiers = clamp(finite(input.dossiers), 0, 100000);
  const pctSans = clamp(finite(input.pctSans), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const pctMorts = clamp(finite(input.pctMorts), 0, 100);
  const taux = clamp(finite(input.taux), 0, 10000);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);

  const fragiles = round1((dossiers * pctSans) / 100);
  const heures = round1((fragiles * minutes) / 60);
  const coutTemps = Math.round(heures * taux);
  const morts = round1((dossiers * pctMorts) / 100);

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(morts * panier);
  }
  const total = coutTemps + (opp ?? 0);

  let alertTone: CoutContexteHorsDossierAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (dossiers <= 0) {
    alert = "Indiquez un volume de dossiers / mois pour estimer le coût du contexte hors dossier.";
    tip =
      "Même 40–50 dossiers / mois avec 40 % sans notes utiles révèlent souvent des heures de re-brief évitables.";
  } else if (total >= 25000 || heures >= 30 || fragiles >= 20) {
    alertTone = "bad";
    alert = `Contexte hors dossier lourd · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : notes internes sur chaque dossier avant handoff. Interdiction de coller marge / risque dans le fil prospect.";
  } else if (total >= 8000 || heures >= 12 || fragiles >= 10) {
    alertTone = "warn";
    alert = `Contexte hors dossier notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez d'abord les Hot : 5 lignes de notes après chaque appel. Alerte Slack OK, mémoire = fiche devis.";
  } else {
    alertTone = "ok";
    alert = `Contexte hors dossier plutôt contenu · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez la discipline. Surveillez les pics (congés, gros lots) où le contexte repart dans les têtes.";
  }

  const totalTone: CoutContexteHorsDossierTone = total >= 25000 ? "bad" : total >= 8000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutContexteHorsDossierTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 20000 ? "bad" : oppValue >= 6000 ? "warn" : "ok";

  const fragilesLabel = fmtNumber(fragiles, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutTempsLabel = fmtEuro(coutTemps);
  const oppLabel =
    panier > 0 && opp !== null
      ? `${fmtEuro(opp)} (${fmtNumber(morts, 1)} dossiers)`
      : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût contexte hors dossier devis (indicatif)",
    `Dossiers / mois : ${fmtNumber(dossiers, 0)}`,
    `% sans notes internes utiles : ${fmtNumber(pctSans, 0)} %`,
    `Dossiers fragiles / mois : ${fmtNumber(fragiles, 1)}`,
    `Minutes perdues / re-brief : ${fmtNumber(minutes, 0)}`,
    `Heures perdues / mois : ${fmtNumber(heures, 1)} h`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps : ${fmtEuro(coutTemps)}`,
    `% dossiers morts / clarif faute de contexte : ${fmtNumber(pctMorts, 1)} %`,
    `Dossiers concernés : ${fmtNumber(morts, 1)}`,
    `Panier moyen indicatif : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités indicatives : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Notes internes sur le dossier (équipe), pas dans Slack seul",
    "- Fil prospect = clarifs visibles client (chat plat, sans marge / risque)",
    "- Assignation claire ; relecteurs Valider / Modifications si besoin",
    "- Score Hot / Warm / Cold (formule fixe) + triage urgence équipe",
    "- Statuts CRM : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente",
    "- Gagné / Perdu posés par le commercial (pas Accepté / Signé comme statuts)",
    "",
    "Calcul local · ordre de grandeur, pas une compta officielle · pas de TVA inventée. Notes internes = champ/notes dossier équipe, pas un chat interne inventé ni des commentaires ancrés.",
  ].join("\n");

  return {
    dossiers,
    pctSans,
    minutes,
    pctMorts,
    taux,
    panier,
    fragiles,
    heures,
    coutTemps,
    morts,
    opp,
    total,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    fragilesLabel,
    heuresLabel,
    coutTempsLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
