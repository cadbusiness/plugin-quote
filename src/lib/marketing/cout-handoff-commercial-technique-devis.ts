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

export const COUT_HANDOFF_DEFAULTS = {
  devis: 60,
  pctSales: 40,
  minutes: 35,
  pctEvitables: 55,
  taux: 65,
  pctRetrav: 6,
  panier: 5500,
} as const;

export const COUT_HANDOFF_LABELS = {
  devis: "Devis / mois concernés par un handoff commercial→technique",
  pctSales: "% de handoffs « sales » (brief incomplet)",
  minutes: "Minutes perdues par mauvais handoff",
  pctEvitables: "% de handoffs évitables avec funnel+photos (optionnel)",
  taux: "Taux horaire chargé (€)",
  pctRetrav: "% de devis retravaillés / annulés faute de brief transmis",
  panier: "Panier moyen indicatif (€)",
  mauvais: "Mauvais handoffs / mois",
  heures: "Heures perdues / mois (re-qualif + reprise)",
  cout: "Coût temps",
  opp: "Opportunités indicatives perdues / mois",
  total: "Coût total indicatif mensuel",
  evitables: "Handoffs qui auraient pu être évités (indicatif)",
} as const;

export type CoutHandoffInput = {
  devis: number;
  pctSales: number;
  minutes: number;
  pctEvitables: number;
  taux: number;
  pctRetrav: number;
  panier: number;
};

export type CoutHandoffTone = "ok" | "warn" | "bad";
export type CoutHandoffAlertTone = CoutHandoffTone | "neutral";

export type CoutHandoffResult = {
  devis: number;
  pctSales: number;
  minutes: number;
  pctEvitables: number;
  taux: number;
  pctRetrav: number;
  panier: number;
  mauvais: number;
  heures: number;
  cout: number;
  deals: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  evitables: number;
  alertTone: CoutHandoffAlertTone;
  totalTone: CoutHandoffTone;
  oppTone: CoutHandoffTone | "neutral";
  alert: string;
  tip: string;
  mauvaisLabel: string;
  heuresLabel: string;
  coutLabel: string;
  dealsLabel: string;
  oppLabel: string;
  totalLabel: string;
  evitablesLabel: string;
  recap: string;
};

export function computeCoutHandoff(input: CoutHandoffInput): CoutHandoffResult {
  const devis = clamp(finite(input.devis), 0, 100000);
  const pctSales = clamp(finite(input.pctSales), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const pctEvitables = clamp(finite(input.pctEvitables), 0, 100);
  const taux = clamp(finite(input.taux), 0, 10000);
  const pctRetrav = clamp(finite(input.pctRetrav), 0, 100);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);

  const mauvais = round1((devis * pctSales) / 100);
  const heures = round1((mauvais * minutes) / 60);
  const cout = Math.round(heures * taux);
  const deals = round1(devis * (pctRetrav / 100));
  const evitables = round1((mauvais * pctEvitables) / 100);

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(deals * panier);
  }
  const total = cout + (opp ?? 0);

  let alertTone: CoutHandoffAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (devis <= 0) {
    alert = "Indiquez un volume de devis / mois concernés par un handoff pour estimer le coût.";
    tip =
      "Même 40–60 devis / mois avec 35–40 % de handoffs sales révèlent souvent des heures de re-qualif évitables.";
  } else if (total >= 20000 || heures >= 40 || mauvais >= 25) {
    alertTone = "bad";
    alert = `Friction handoff élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : checklist handoff obligatoire + funnel avec photos avant assignation technique. Pas de brief « dans Slack ».";
  } else if (total >= 7000 || heures >= 14 || mauvais >= 12) {
    alertTone = "warn";
    alert = `Friction handoff notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez d'abord le % de handoffs sans photos / grandeurs. Alignez les questions commerciales sur celles du funnel.";
  } else {
    alertTone = "ok";
    alert = `Friction handoff contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez la discipline de brief. Surveillez les pics (saison, gros lots) où la checklist saute.";
  }

  const totalTone: CoutHandoffTone = total >= 20000 ? "bad" : total >= 7000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutHandoffTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 15000 ? "bad" : oppValue >= 5000 ? "warn" : "ok";

  const mauvaisLabel = fmtNumber(mauvais, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutLabel = fmtEuro(cout);
  const dealsLabel = fmtNumber(deals, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);
  const evitablesLabel = fmtNumber(evitables, 1);

  const recap = [
    "Récap coût handoff commercial → technique (indicatif)",
    `Devis / mois concernés par un handoff : ${fmtNumber(devis, 0)}`,
    `% handoffs « sales » (brief incomplet) : ${fmtNumber(pctSales, 0)} %`,
    `Mauvais handoffs / mois : ${fmtNumber(mauvais, 1)}`,
    `Minutes perdues / mauvais handoff : ${fmtNumber(minutes, 0)}`,
    `Heures perdues / mois : ${fmtNumber(heures, 1)} h`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps : ${fmtEuro(cout)}`,
    `% devis retravaillés / annulés faute de brief : ${fmtNumber(pctRetrav, 1)} %`,
    `Devis concernés : ${dealsLabel}`,
    `Panier moyen indicatif : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités indicatives : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `% handoffs évitables avec funnel+photos : ${fmtNumber(pctEvitables, 0)} % (${fmtNumber(evitables, 1)} handoffs)`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Brief funnel (type, grandeurs, accès, besoin rédigé)",
    "- Photos demandées avant assignation technique",
    "- Checklist handoff cochée (pas de note Slack seule)",
    "- Score Hot / Warm / Cold (formule fixe) + triage urgence équipe",
    "- Owner technique + statut CRM clair ; Gagné / Perdu posés par le commercial",
    "- Relecteurs Valider / Modifications si multi-décideurs (chat fil plat)",
    "",
    "Calcul local · ordre de grandeur, pas une compta officielle · pas de TVA inventée. À adapter à votre réalité métier.",
  ].join("\n");

  return {
    devis,
    pctSales,
    minutes,
    pctEvitables,
    taux,
    pctRetrav,
    panier,
    mauvais,
    heures,
    cout,
    deals,
    opp,
    total,
    evitables,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    mauvaisLabel,
    heuresLabel,
    coutLabel,
    dealsLabel,
    oppLabel,
    totalLabel,
    evitablesLabel,
    recap,
  };
}
