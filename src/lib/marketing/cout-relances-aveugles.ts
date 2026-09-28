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

export const COUT_RELANCES_AVEUGLES_DEFAULTS = {
  devis: 40,
  sansSignalPct: 70,
  relancesParDevis: 2.5,
  minutes: 12,
  taux: 55,
  nuirePct: 15,
  panier: 8500,
  ecartConvPts: 4,
} as const;

export const COUT_RELANCES_AVEUGLES_LABELS = {
  devis: "Devis envoyés / mois",
  sansSignalPct: "% de devis relancés sans signal utile",
  relancesParDevis: "Relances aveugles / devis (moyenne)",
  minutes: "Minutes / relance aveugle",
  taux: "Taux horaire chargé (€)",
  nuirePct: "% de deals où timing de relance a nui",
  panier: "Panier moyen HT (€)",
  ecartConvPts: "Écart de conversion si on priorise les dossiers avec un signal (points %)",
  aveugles: "Devis / mois relancés sans signal",
  relancesMois: "Relances aveugles / mois",
  heures: "Heures / mois perdues (relances)",
  coutTemps: "Coût temps (chargé)",
  opp: "Opportunités mal priorisées (indicatif)",
  coutNuire: "Impact timing nuisible (indicatif)",
  total: "Coût total indicatif mensuel",
} as const;

export type CoutRelancesAveuglesInput = {
  devis: number;
  sansSignalPct: number;
  relancesParDevis: number;
  minutes: number;
  taux: number;
  nuirePct: number;
  panier: number;
  ecartConvPts: number;
};

export type CoutRelancesAveuglesTone = "ok" | "warn" | "bad";
export type CoutRelancesAveuglesAlertTone = CoutRelancesAveuglesTone | "neutral";

export type CoutRelancesAveuglesResult = {
  devis: number;
  sansSignalPct: number;
  relancesParDevis: number;
  minutes: number;
  taux: number;
  nuirePct: number;
  panier: number;
  ecartConvPts: number;
  aveugles: number;
  relancesMois: number;
  heures: number;
  coutTemps: number;
  dealsPriorises: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  dealsNuire: number;
  /** Null quand le panier est à 0 : l’impact timing n’est pas monétisé. */
  coutNuire: number | null;
  total: number;
  alertTone: CoutRelancesAveuglesAlertTone;
  totalTone: CoutRelancesAveuglesTone;
  nuireTone: CoutRelancesAveuglesTone | "neutral";
  alert: string;
  tip: string;
  aveuglesLabel: string;
  relancesMoisLabel: string;
  heuresLabel: string;
  coutTempsLabel: string;
  dealsPriorisesLabel: string;
  oppLabel: string;
  dealsNuireLabel: string;
  coutNuireLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutRelancesAveugles(input: CoutRelancesAveuglesInput): CoutRelancesAveuglesResult {
  const devis = clamp(finite(input.devis), 0, 100000);
  const sansSignalPct = clamp(finite(input.sansSignalPct), 0, 100);
  const relancesParDevis = clamp(finite(input.relancesParDevis), 0, 50);
  const minutes = clamp(finite(input.minutes), 0, 480);
  const taux = clamp(finite(input.taux), 0, 10000);
  const nuirePct = clamp(finite(input.nuirePct), 0, 100);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const ecartConvPts = clamp(finite(input.ecartConvPts), 0, 50);

  const aveugles = round1((devis * sansSignalPct) / 100);
  const relancesMois = round1(aveugles * relancesParDevis);
  const heures = round1((relancesMois * minutes) / 60);
  const coutTemps = Math.round(heures * taux);
  const dealsPriorises = round1(aveugles * (ecartConvPts / 100));
  const dealsNuire = round1(aveugles * (nuirePct / 100));

  let opp: number | null = null;
  let coutNuire: number | null = null;
  if (panier > 0) {
    opp = Math.round(dealsPriorises * panier);
    coutNuire = Math.round(dealsNuire * panier * 0.25);
  }
  const total = coutTemps + (opp ?? 0) + (coutNuire ?? 0);

  let alertTone: CoutRelancesAveuglesAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (devis <= 0) {
    alert = "Indiquez un volume de devis / mois pour estimer le coût des relances sans signal.";
    tip = "Même 20-40 devis / mois révèlent souvent des heures de relances au feeling.";
  } else if (total >= 20000 || heures >= 15) {
    alertTone = "bad";
    alert = `Relances aveugles coûteuses · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Priorité : envoyer un lien, regarder la dernière consultation sur la fiche, inviter les relecteurs, relancer sur une validation ou une demande de modifications.";
  } else if (total >= 6000 || heures >= 6) {
    alertTone = "warn";
    alert = `Friction relances notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Avant d’appeler, ouvrez la fiche : dernière consultation, statut des relecteurs, validation ou modifications.";
  } else {
    alertTone = "ok";
    alert = `Friction relances contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez une règle simple : un regard sur la fiche avant chaque relance, et une réaction quand une validation ou une demande de modifications arrive.";
  }

  const totalTone: CoutRelancesAveuglesTone = total >= 20000 ? "bad" : total >= 6000 ? "warn" : "ok";
  const nuireValue = coutNuire ?? 0;
  const nuireTone: CoutRelancesAveuglesTone | "neutral" =
    panier <= 0 ? "neutral" : nuireValue >= 12000 ? "bad" : nuireValue >= 4000 ? "warn" : "ok";

  const aveuglesLabel = fmtNumber(aveugles, 1);
  const relancesMoisLabel = fmtNumber(relancesMois, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutTempsLabel = fmtEuro(coutTemps);
  const dealsPriorisesLabel = fmtNumber(dealsPriorises, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const dealsNuireLabel = fmtNumber(dealsNuire, 1);
  const coutNuireLabel = panier > 0 && coutNuire !== null ? fmtEuro(coutNuire) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût relances à l’aveugle sur devis (indicatif)",
    `Devis envoyés / mois : ${fmtNumber(devis, 0)}`,
    `% relancés sans signal utile : ${fmtNumber(sansSignalPct, 0)} %`,
    `Devis sans signal : ${fmtNumber(aveugles, 1)}`,
    `Relances aveugles / devis : ${fmtNumber(relancesParDevis, 1)}`,
    `Relances aveugles / mois : ${fmtNumber(relancesMois, 1)}`,
    `Minutes / relance : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues : ${heuresLabel}`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps : ${coutTempsLabel}`,
    `Écart de conversion si priorisation des dossiers avec signal (points) : ${fmtNumber(ecartConvPts, 1)}`,
    `Deals potentiellement mieux priorisés : ${dealsPriorisesLabel}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités mal priorisées : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `% deals timing nuisible : ${fmtNumber(nuirePct, 0)} %`,
    `Impact timing (hypothèse 25 % panier) : ${panier > 0 && coutNuire !== null ? fmtEuro(coutNuire) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Envoyer un lien vers l’espace prospect (PDF téléchargeable dedans si besoin)",
    "- Avant de relancer, ouvrir la fiche : dernière consultation",
    "- Inviter les relecteurs et suivre En attente, Consulté, Validé, Modifications",
    "- Réagir à une validation ou à une demande de modifications",
    "- Aucune visite sur la fiche : vérifier le destinataire et renvoyer le lien",
    "- Ne pas confondre une consultation et une acceptation",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    devis,
    sansSignalPct,
    relancesParDevis,
    minutes,
    taux,
    nuirePct,
    panier,
    ecartConvPts,
    aveugles,
    relancesMois,
    heures,
    coutTemps,
    dealsPriorises,
    opp,
    dealsNuire,
    coutNuire,
    total,
    alertTone,
    totalTone,
    nuireTone,
    alert,
    tip,
    aveuglesLabel,
    relancesMoisLabel,
    heuresLabel,
    coutTempsLabel,
    dealsPriorisesLabel,
    oppLabel,
    dealsNuireLabel,
    coutNuireLabel,
    totalLabel,
    recap,
  };
}
