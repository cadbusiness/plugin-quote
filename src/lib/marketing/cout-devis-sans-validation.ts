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

export const COUT_DEVIS_SANS_VALIDATION_DEFAULTS = {
  devis: 35,
  sansValidPct: 55,
  tauxErreur: 30,
  minutes: 45,
  remisePct: 18,
  ecartMarge: 4,
  panier: 8500,
  taux: 55,
  ecartConvPts: 3,
} as const;

export const COUT_DEVIS_SANS_VALIDATION_LABELS = {
  devis: "Devis envoyés / mois",
  sansValidPct: "% envoyés sans relecture interne",
  tauxErreur: "% de ces devis corrigés après envoi",
  minutes: "Minutes perdues / correction",
  remisePct: "% avec remise sauvage ou erreur de marge",
  ecartMarge: "Écart marge moyen sur ces cas (%)",
  panier: "Panier moyen HT (€)",
  taux: "Taux horaire chargé (€)",
  ecartConvPts: "Écart conversion si devis validé (points %)",
  aRisque: "Devis / mois à risque (sans validation)",
  corrections: "Corrections post-envoi / mois",
  heures: "Heures / mois perdues (corrections)",
  coutFriction: "Coût friction (temps chargé)",
  coutMarge: "Coût erreurs / marge (indicatif)",
  opp: "Opportunités manquées indicatives / mois",
  total: "Coût total indicatif mensuel",
} as const;

export type CoutDevisSansValidationInput = {
  devis: number;
  sansValidPct: number;
  tauxErreur: number;
  minutes: number;
  remisePct: number;
  ecartMarge: number;
  panier: number;
  taux: number;
  ecartConvPts: number;
};

export type CoutDevisSansValidationTone = "ok" | "warn" | "bad";
export type CoutDevisSansValidationAlertTone = CoutDevisSansValidationTone | "neutral";

export type CoutDevisSansValidationResult = {
  devis: number;
  sansValidPct: number;
  tauxErreur: number;
  minutes: number;
  remisePct: number;
  ecartMarge: number;
  panier: number;
  taux: number;
  ecartConvPts: number;
  aRisque: number;
  corrections: number;
  heures: number;
  coutFriction: number;
  dossiersMarge: number;
  coutMarge: number;
  deals: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutDevisSansValidationAlertTone;
  totalTone: CoutDevisSansValidationTone;
  oppTone: CoutDevisSansValidationTone | "neutral";
  alert: string;
  tip: string;
  aRisqueLabel: string;
  correctionsLabel: string;
  heuresLabel: string;
  coutFrictionLabel: string;
  dossiersMargeLabel: string;
  coutMargeLabel: string;
  dealsLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutDevisSansValidation(
  input: CoutDevisSansValidationInput,
): CoutDevisSansValidationResult {
  const devis = clamp(finite(input.devis), 0, 100000);
  const sansValidPct = clamp(finite(input.sansValidPct), 0, 100);
  const tauxErreur = clamp(finite(input.tauxErreur), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 480);
  const remisePct = clamp(finite(input.remisePct), 0, 100);
  const ecartMarge = clamp(finite(input.ecartMarge), 0, 50);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const taux = clamp(finite(input.taux), 0, 10000);
  const ecartConvPts = clamp(finite(input.ecartConvPts), 0, 50);

  const aRisque = round1((devis * sansValidPct) / 100);
  const corrections = round1((aRisque * tauxErreur) / 100);
  const heures = round1((corrections * minutes) / 60);
  const coutFriction = Math.round(heures * taux);
  const dossiersMarge = round1((aRisque * remisePct) / 100);
  const coutMarge = Math.round(dossiersMarge * panier * (ecartMarge / 100));
  const deals = round1(aRisque * (ecartConvPts / 100));

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(deals * panier);
  }
  const total = coutFriction + coutMarge + (opp ?? 0);

  let alertTone: CoutDevisSansValidationAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (devis <= 0) {
    alert = "Indiquez un volume de devis / mois pour estimer le coût du gate manquant.";
    tip = "Même 20-30 devis / mois révèlent souvent des heures de V2 et des remises non cadrées.";
  } else if (total >= 20000 || heures >= 15) {
    alertTone = "bad";
    alert = `Friction validation élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : statut « en validation » avant envoi, seuil de remise, checklist courte, SLA Hot en heures.";
  } else if (total >= 6000 || heures >= 6) {
    alertTone = "warn";
    alert = `Friction validation notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Pilotez le gate sur les Hot / paniers élevés d’abord. Mesurez le % de V2 sous 7 jours.";
  } else {
    alertTone = "ok";
    alert = `Friction validation contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez le gate proportionné. Surveillez quand même les remises hors seuil et les mentions manquantes.";
  }

  const totalTone: CoutDevisSansValidationTone = total >= 20000 ? "bad" : total >= 6000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutDevisSansValidationTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 12000 ? "bad" : oppValue >= 4000 ? "warn" : "ok";

  const aRisqueLabel = fmtNumber(aRisque, 1);
  const correctionsLabel = fmtNumber(corrections, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutFrictionLabel = fmtEuro(coutFriction);
  const dossiersMargeLabel = fmtNumber(dossiersMarge, 1);
  const coutMargeLabel = panier > 0 ? fmtEuro(coutMarge) : "non calculé (panier = 0)";
  const dealsLabel = fmtNumber(deals, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût devis envoyés sans validation interne (indicatif)",
    `Devis envoyés / mois : ${fmtNumber(devis, 0)}`,
    `% sans relecture interne : ${fmtNumber(sansValidPct, 0)} %`,
    `Devis à risque : ${fmtNumber(aRisque, 1)}`,
    `% corrigés après envoi : ${fmtNumber(tauxErreur, 0)} %`,
    `Corrections / mois : ${fmtNumber(corrections, 1)}`,
    `Minutes perdues / correction : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues : ${heuresLabel}`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût friction temps : ${coutFrictionLabel}`,
    `% remise sauvage / erreur marge : ${fmtNumber(remisePct, 0)} %`,
    `Écart marge moyen : ${fmtNumber(ecartMarge, 1)} %`,
    `Dossiers marge concernés : ${dossiersMargeLabel}`,
    `Coût erreurs / marge : ${panier > 0 ? fmtEuro(coutMarge) : "n/a"}`,
    `Écart conversion (points) : ${fmtNumber(ecartConvPts, 1)}`,
    `Deals potentiellement récupérés : ${dealsLabel}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités manquées : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Statut brouillon / en validation / prêt avant envoi",
    "- Checklist 10 points (quantités, mentions, docs, marge)",
    "- Seuil de remise + owner manager au-delà",
    "- Commentaires internes séparés de la vue prospect",
    "- Version figée à l’envoi + mesure % V2 sous 7 j",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    devis,
    sansValidPct,
    tauxErreur,
    minutes,
    remisePct,
    ecartMarge,
    panier,
    taux,
    ecartConvPts,
    aRisque,
    corrections,
    heures,
    coutFriction,
    dossiersMarge,
    coutMarge,
    deals,
    opp,
    total,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    aRisqueLabel,
    correctionsLabel,
    heuresLabel,
    coutFrictionLabel,
    dossiersMargeLabel,
    coutMargeLabel,
    dealsLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
