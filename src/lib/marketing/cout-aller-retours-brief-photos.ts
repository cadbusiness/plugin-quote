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

export const COUT_ALLER_RETOURS_BRIEF_DEFAULTS = {
  demandes: 40,
  sansDocPct: 45,
  minutes: 22,
  deplacPct: 15,
  coutTrajet: 85,
  taux: 55,
  panier: 7200,
  ecartConvPts: 4,
} as const;

export type CoutAllerRetoursBriefInput = {
  demandes: number;
  sansDocPct: number;
  minutes: number;
  deplacPct: number;
  coutTrajet: number;
  taux: number;
  panier: number;
  ecartConvPts: number;
};

export type CoutAllerRetoursTone = "ok" | "warn" | "bad";
export type CoutAllerRetoursAlertTone = CoutAllerRetoursTone | "neutral";

export type CoutAllerRetoursBriefResult = {
  demandes: number;
  sansDocPct: number;
  minutes: number;
  deplacPct: number;
  coutTrajet: number;
  taux: number;
  panier: number;
  ecartConvPts: number;
  dossiers: number;
  heures: number;
  coutFriction: number;
  deplacements: number;
  coutTrajets: number;
  deals: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutAllerRetoursAlertTone;
  totalTone: CoutAllerRetoursTone;
  oppTone: CoutAllerRetoursTone | "neutral";
  alert: string;
  tip: string;
  dossiersLabel: string;
  heuresLabel: string;
  coutFrictionLabel: string;
  deplacementsLabel: string;
  coutTrajetsLabel: string;
  dealsLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutAllerRetoursBrief(input: CoutAllerRetoursBriefInput): CoutAllerRetoursBriefResult {
  const demandes = clamp(finite(input.demandes), 0, 100000);
  const sansDocPct = clamp(finite(input.sansDocPct), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 480);
  const deplacPct = clamp(finite(input.deplacPct), 0, 100);
  const coutTrajet = clamp(finite(input.coutTrajet), 0, 100000);
  const taux = clamp(finite(input.taux), 0, 10000);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const ecartConvPts = clamp(finite(input.ecartConvPts), 0, 50);

  const dossiers = round1((demandes * sansDocPct) / 100);
  const heures = round1((dossiers * minutes) / 60);
  const coutFriction = Math.round(heures * taux);
  const deplacements = round1((dossiers * deplacPct) / 100);
  const coutTrajets = Math.round(deplacements * coutTrajet);
  const deals = round1(dossiers * (ecartConvPts / 100));

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(deals * panier);
  }
  const total = coutFriction + coutTrajets + (opp ?? 0);

  let alertTone: CoutAllerRetoursAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (demandes <= 0) {
    alert = "Indiquez un volume de demandes / mois pour estimer la friction.";
    tip = "Même 20–30 demandes / mois révèlent souvent des heures de rappels « pouvez-vous envoyer une photo ? ».";
  } else if (total >= 15000 || heures >= 12) {
    alertTone = "bad";
    alert = `Friction documents élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : upload photos / plans dans le funnel (optionnel mais valorisé), espace prospect pour les compléments, et SLA plus court quand le brief est documenté.";
  } else if (total >= 5000 || heures >= 5) {
    alertTone = "warn";
    alert = `Friction documents notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez l’upload dès l’entrée + un rappel automatisé « dossier incomplet ». Mesurez les déplacements annulés faute de photo d’accès.";
  } else {
    alertTone = "ok";
    alert = `Friction documents contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez l’incitation « plus vite avec photos ». Surveillez quand même les plans obsolètes et les versions.";
  }

  const totalTone: CoutAllerRetoursTone = total >= 15000 ? "bad" : total >= 5000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutAllerRetoursTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 10000 ? "bad" : oppValue >= 3000 ? "warn" : "ok";

  const dossiersLabel = fmtNumber(dossiers, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutFrictionLabel = fmtEuro(coutFriction);
  const deplacementsLabel = fmtNumber(deplacements, 1);
  const coutTrajetsLabel = fmtEuro(coutTrajets);
  const dealsLabel = fmtNumber(deals, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût aller-retours brief sans photos / plans (indicatif)",
    `Demandes / mois : ${fmtNumber(demandes, 0)}`,
    `% sans photo ni plan : ${fmtNumber(sansDocPct, 0)} %`,
    `Dossiers concernés : ${fmtNumber(dossiers, 1)}`,
    `Minutes perdues / dossier : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues : ${fmtNumber(heures, 1)} h`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût friction temps : ${fmtEuro(coutFriction)}`,
    `% déplacements inutiles (sur dossiers sans doc) : ${fmtNumber(deplacPct, 0)} %`,
    `Déplacements inutiles / mois : ${fmtNumber(deplacements, 1)}`,
    `Coût trajet unitaire : ${fmtEuro(coutTrajet)}`,
    `Coût trajets inutiles : ${fmtEuro(coutTrajets)}`,
    `Écart conversion (points) : ${fmtNumber(ecartConvPts, 1)}`,
    `Deals potentiellement récupérés : ${fmtNumber(deals, 1)}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités manquées : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${fmtEuro(total)}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Upload photos / plans dans le funnel (optionnel + SLA différencié)",
    "- Espace prospect pour compléter sans WhatsApp",
    "- Légendes + version courante du plan",
    "- Filtrer les déplacements si accès illisible",
    "- Mesurer % dossiers documentés chaque mois",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    demandes,
    sansDocPct,
    minutes,
    deplacPct,
    coutTrajet,
    taux,
    panier,
    ecartConvPts,
    dossiers,
    heures,
    coutFriction,
    deplacements,
    coutTrajets,
    deals,
    opp,
    total,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    dossiersLabel,
    heuresLabel,
    coutFrictionLabel,
    deplacementsLabel,
    coutTrajetsLabel,
    dealsLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
