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

function rangeText(low: number, high: number) {
  return low === high ? fmtEuro(low) : `${fmtEuro(low)} à ${fmtEuro(high)}`;
}

export const DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS = {
  demandes: 60,
  pctHB: 25,
  minutes: 45,
  taux: 55,
  pctEvit: 50,
  minutesApres: 5,
  pMin: 28,
  pMax: 38,
  qty: 120,
} as const;

export const DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS = {
  demandes: "Demandes de devis / mois",
  pctHB: "% des demandes qui s'arrêtent au prix",
  minutes: "Minutes passées par dossier hors budget",
  taux: "Taux horaire chargé (€)",
  pctEvit: "% de ces dossiers écartés ou recadrés plus tôt",
  minutesApres: "Minutes restantes par dossier écarté",
  pMin: "Prix min unitaire (€)",
  pMax: "Prix max unitaire (€)",
  qty: "Quantité",
  hb: "Dossiers hors budget / mois",
  heures: "Heures passées sur ces dossiers / mois",
  cout: "Coût indicatif / mois",
  an: "Sur 12 mois (indicatif)",
  evit: "Dossiers écartés ou recadrés plus tôt / mois (hypothèse)",
  rec: "Temps et coût récupérables / mois",
  anRec: "Récupérable sur 12 mois (indicatif)",
  ligne: "Montant de la ligne (prix × quantité)",
} as const;

export type DemandesHorsBudgetFourchetteInput = {
  demandes: number;
  pctHB: number;
  minutes: number;
  taux: number;
  pctEvit: number;
  minutesApres: number;
  pMin: number;
  /** null ou NaN : champ vide, le prix max suit le prix min (prix fixe). */
  pMax: number | null;
  qty: number;
};

export type DemandesHorsBudgetFourchetteTone = "ok" | "warn" | "bad" | "neutral";

export type DemandesHorsBudgetFourchetteResult = {
  demandes: number;
  pctHB: number;
  minutes: number;
  taux: number;
  pctEvit: number;
  minutesApres: number;
  pMin: number;
  pMax: number;
  qty: number;
  unitLow: number;
  unitHigh: number;
  hb: number;
  hHB: number;
  cHB: number;
  anHB: number;
  evit: number;
  hRec: number;
  cRec: number;
  anRec: number;
  lineLow: number;
  lineHigh: number;
  alertTone: DemandesHorsBudgetFourchetteTone;
  coutTone: DemandesHorsBudgetFourchetteTone;
  recTone: DemandesHorsBudgetFourchetteTone;
  alert: string;
  tip: string;
  hbLabel: string;
  heuresLabel: string;
  coutLabel: string;
  anLabel: string;
  evitLabel: string;
  recLabel: string;
  anRecLabel: string;
  ligneLabel: string;
  recap: string;
};

export function computeDemandesHorsBudgetFourchette(
  input: DemandesHorsBudgetFourchetteInput,
): DemandesHorsBudgetFourchetteResult {
  const demandes = clamp(finite(input.demandes), 0, 100000);
  const pctHB = clamp(finite(input.pctHB), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const taux = clamp(finite(input.taux), 0, 10000);
  const pctEvit = clamp(finite(input.pctEvit), 0, 100);
  const minutesApres = Math.min(minutes, clamp(finite(input.minutesApres), 0, 24 * 60));

  const hb = round1((demandes * pctHB) / 100);
  const hHB = round1((hb * minutes) / 60);
  const cHB = Math.round(hHB * taux);
  const anHB = cHB * 12;
  const evit = round1((hb * pctEvit) / 100);
  const hRec = round1((evit * (minutes - minutesApres)) / 60);
  const cRec = Math.round(hRec * taux);
  const anRec = cRec * 12;

  const pMin = clamp(finite(input.pMin), 0, 10000000);
  const pMaxRaw = input.pMax == null || Number.isNaN(input.pMax) ? Number.NaN : input.pMax;
  const pMax = Number.isFinite(pMaxRaw) ? clamp(pMaxRaw, 0, 10000000) : pMin;
  const unitLow = Math.min(pMin, pMax);
  const unitHigh = Math.max(pMin, pMax);
  const qty = Math.max(1, Math.round(clamp(finite(input.qty, 1), 1, 100000)));
  const lineLow = Math.round(unitLow * qty);
  const lineHigh = Math.round(unitHigh * qty);

  let alertTone: DemandesHorsBudgetFourchetteTone = "neutral";
  let alert: string;
  let tip: string;
  if (demandes <= 0) {
    alert = "Indiquez un volume de demandes / mois pour estimer le temps passé sur les dossiers hors budget.";
    tip = "Partez du mois dernier : combien de demandes, et combien se sont arrêtées quand le prix a été évoqué ?";
  } else if (pctHB <= 0) {
    alert = "Aucune demande hors budget sur ces hypothèses : rien à récupérer de ce côté.";
    tip =
      "Une fourchette reste utile pour aider l'acheteur à faire valider son budget en interne, même si vos demandes sont déjà bien ciblées.";
  } else {
    if (cHB >= 2000) {
      alertTone = "bad";
      alert = `Enjeu important · environ ${fmtEuro(cHB)} / mois passés sur des dossiers hors budget (indicatif, selon vos hypothèses).`;
    } else if (cHB >= 500) {
      alertTone = "warn";
      alert = `Enjeu notable · environ ${fmtEuro(cHB)} / mois passés sur des dossiers hors budget (indicatif, selon vos hypothèses).`;
    } else {
      alert = `Enjeu modeste · environ ${fmtEuro(cHB)} / mois passés sur des dossiers hors budget (indicatif, selon vos hypothèses).`;
    }
    if (cRec > 0) {
      tip = `Avec votre hypothèse de ${fmtNumber(pctEvit, 0)} %, une fourchette affichée dès la demande libérerait environ ${fmtNumber(hRec, 1)} h / mois. Partez de vos derniers devis signés pour poser des fourchettes par unité (par convive, par m², par jour), et précisez HT dans la description.`;
    } else {
      tip =
        "Sans dossier écarté plus tôt, pas de temps récupéré sur ces hypothèses. Testez une valeur prudente, puis comparez avec le mois suivant l'affichage des fourchettes.";
    }
  }

  const coutTone: DemandesHorsBudgetFourchetteTone = cHB >= 2000 ? "bad" : cHB >= 500 ? "warn" : "neutral";
  const recTone: DemandesHorsBudgetFourchetteTone = cRec > 0 ? "ok" : "neutral";

  const hbLabel = fmtNumber(hb, 1);
  const heuresLabel = `${fmtNumber(hHB, 1)} h`;
  const coutLabel = fmtEuro(cHB);
  const anLabel = fmtEuro(anHB);
  const evitLabel = fmtNumber(evit, 1);
  const recLabel = `${fmtNumber(hRec, 1)} h · ${fmtEuro(cRec)}`;
  const anRecLabel = fmtEuro(anRec);
  const ligneLabel = rangeText(lineLow, lineHigh);

  const recap = [
    "Récap demandes hors budget et fourchette indicative (indicatif)",
    `Demandes / mois : ${fmtNumber(demandes, 0)} (${fmtNumber(pctHB, 0)} % s'arrêtent au prix)`,
    `Dossiers hors budget / mois : ${fmtNumber(hb, 1)}`,
    `Heures : ${fmtNumber(hHB, 1)} h (${fmtNumber(minutes, 0)} min par dossier)`,
    `Coût : ${fmtEuro(cHB)} / mois (${fmtEuro(taux)} / h)`,
    `Sur 12 mois : ${fmtEuro(anHB)}`,
    `Hypothèse fourchette : ${fmtNumber(pctEvit, 0)} % écartés ou recadrés plus tôt, ${fmtNumber(minutesApres, 0)} min restantes`,
    `Dossiers écartés plus tôt : ${fmtNumber(evit, 1)} / mois`,
    `Récupérable : ${fmtNumber(hRec, 1)} h · ${fmtEuro(cRec)} / mois · ${fmtEuro(anRec)} sur 12 mois`,
    `Aperçu ligne : ${fmtNumber(qty, 0)} × ${rangeText(unitLow, unitHigh)} = ${rangeText(lineLow, lineHigh)}`,
    `Statut : ${alert}`,
    "",
    "Checklist fourchette dans QuoteBuilder :",
    "- Chaque produit : Prix fixe, Fourchette ou Sur devis (champs prix min / prix max)",
    "- Unité dans le nom ou la description (par convive, par m², par jour)",
    "- Mention HT à écrire vous-même : pas de gestion de TVA",
    "- Montant de ligne (fiche devis, espace prospect, PDF) = prix × quantité",
    "- Fourchette indicative du dossier = fourchette de la règle si saisie, sinon somme des lignes",
    "- Fourchette de règle : à saisir dans l'édition de la règle, page Règles",
    "- Une fourchette de règle remplace la somme des lignes : la garder cohérente avec les montants",
    "- Le score ne lit pas les prix ; le devis définitif reste dans votre outil",
    "",
    "Calcul local · vos hypothèses, pas un benchmark · fourchette indicative, pas un devis.",
  ].join("\n");

  return {
    demandes,
    pctHB,
    minutes,
    taux,
    pctEvit,
    minutesApres,
    pMin,
    pMax,
    qty,
    unitLow,
    unitHigh,
    hb,
    hHB,
    cHB,
    anHB,
    evit,
    hRec,
    cRec,
    anRec,
    lineLow,
    lineHigh,
    alertTone,
    coutTone,
    recTone,
    alert,
    tip,
    hbLabel,
    heuresLabel,
    coutLabel,
    anLabel,
    evitLabel,
    recLabel,
    anRecLabel,
    ligneLabel,
    recap,
  };
}
