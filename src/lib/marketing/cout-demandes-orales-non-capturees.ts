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

export const COUT_DEMANDES_ORALES_DEFAULTS = {
  orales: 80,
  pctNonCapturees: 45,
  minutes: 25,
  pctFunnel: 60,
  taux: 55,
  pctPerdus: 5,
  panier: 4200,
} as const;

export const COUT_DEMANDES_ORALES_LABELS = {
  orales: "Demandes orales / mois (tél + WhatsApp + SMS)",
  pctNonCapturees: "% non capturées dans un brief structuré",
  minutes: "Minutes perdues par demande non capturée",
  pctFunnel: "% orales qui auraient dû passer par un funnel (optionnel)",
  taux: "Taux horaire chargé (€)",
  pctPerdus: "% deals perdus faute de brief oral perdu",
  panier: "Panier moyen HT (€)",
  nonCap: "Demandes non capturées / mois",
  heures: "Heures perdues / mois (re-qualification)",
  cout: "Coût temps (re-qualification)",
  opp: "Opportunité indicative / mois (deals perdus)",
  total: "Coût total indicatif mensuel",
  versFunnel: "Orales qui auraient pu aller au funnel (indicatif)",
} as const;

export type CoutDemandesOralesInput = {
  orales: number;
  pctNonCapturees: number;
  minutes: number;
  pctFunnel: number;
  taux: number;
  pctPerdus: number;
  panier: number;
};

export type CoutDemandesOralesTone = "ok" | "warn" | "bad";
export type CoutDemandesOralesAlertTone = CoutDemandesOralesTone | "neutral";

export type CoutDemandesOralesResult = {
  orales: number;
  pctNonCapturees: number;
  minutes: number;
  pctFunnel: number;
  taux: number;
  pctPerdus: number;
  panier: number;
  nonCap: number;
  heures: number;
  cout: number;
  deals: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  versFunnel: number;
  alertTone: CoutDemandesOralesAlertTone;
  totalTone: CoutDemandesOralesTone;
  oppTone: CoutDemandesOralesTone | "neutral";
  alert: string;
  tip: string;
  nonCapLabel: string;
  heuresLabel: string;
  coutLabel: string;
  dealsLabel: string;
  oppLabel: string;
  totalLabel: string;
  versFunnelLabel: string;
  recap: string;
};

export function computeCoutDemandesOrales(input: CoutDemandesOralesInput): CoutDemandesOralesResult {
  const orales = clamp(finite(input.orales), 0, 100000);
  const pctNonCapturees = clamp(finite(input.pctNonCapturees), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const pctFunnel = clamp(finite(input.pctFunnel), 0, 100);
  const taux = clamp(finite(input.taux), 0, 10000);
  const pctPerdus = clamp(finite(input.pctPerdus), 0, 100);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);

  const nonCap = round1((orales * pctNonCapturees) / 100);
  const heures = round1((nonCap * minutes) / 60);
  const cout = Math.round(heures * taux);
  const deals = round1(orales * (pctPerdus / 100));
  const versFunnel = round1((orales * pctFunnel) / 100);

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(deals * panier);
  }
  const total = cout + (opp ?? 0);

  let alertTone: CoutDemandesOralesAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (orales <= 0) {
    alert = "Indiquez un volume de demandes orales / mois pour estimer le coût de non-capture.";
    tip =
      "Même 40–60 appels / WhatsApp / mois avec 40 % sans brief révèlent souvent des heures de re-qualification évitables.";
  } else if (total >= 18000 || heures >= 35 || nonCap >= 30) {
    alertTone = "bad";
    alert = `Friction orale élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : script + checklist collable + bascule funnel / préfill le jour même. Ne laissez pas le brief dans WhatsApp ou « dans la tête ».";
  } else if (total >= 6000 || heures >= 12 || nonCap >= 12) {
    alertTone = "warn";
    alert = `Friction orale notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez d'abord le % d'oraux sans checklist. Alignez les questions téléphone sur celles du funnel web.";
  } else {
    alertTone = "ok";
    alert = `Friction orale contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez la discipline de capture. Surveillez les pics (dépannage, saison) où la checklist saute.";
  }

  const totalTone: CoutDemandesOralesTone = total >= 18000 ? "bad" : total >= 6000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutDemandesOralesTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 15000 ? "bad" : oppValue >= 5000 ? "warn" : "ok";

  const nonCapLabel = fmtNumber(nonCap, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutLabel = fmtEuro(cout);
  const dealsLabel = fmtNumber(deals, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);
  const versFunnelLabel = fmtNumber(versFunnel, 1);

  const recap = [
    "Récap coût demandes orales non capturées (indicatif)",
    `Demandes orales / mois (tél+WhatsApp+SMS) : ${fmtNumber(orales, 0)}`,
    `% non capturées en brief structuré : ${fmtNumber(pctNonCapturees, 0)} %`,
    `Demandes non capturées / mois : ${fmtNumber(nonCap, 1)}`,
    `Minutes perdues / demande non capturée : ${fmtNumber(minutes, 0)}`,
    `Heures perdues / mois : ${fmtNumber(heures, 1)} h`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps (re-qualification) : ${fmtEuro(cout)}`,
    `% deals perdus faute de brief oral perdu : ${fmtNumber(pctPerdus, 1)} %`,
    `Deals concernés : ${dealsLabel}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunité indicative : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `% orales qui auraient pu aller au funnel : ${fmtNumber(pctFunnel, 0)} % (${fmtNumber(versFunnel, 1)} demandes)`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Script qualification (type projet, accès, grandeurs utiles, besoin)",
    "- Checklist collée CRM / chat le jour même",
    "- Bascule funnel ou préfill URL (pas de bot WhatsApp inventé)",
    "- Score Hot / Warm / Cold (formule fixe produit) + triage urgence équipe",
    "- Owner + statut CRM clair ; Gagné / Perdu posés par le commercial",
    "- Photos demandées sur le fil ou via le parcours",
    "",
    "Calcul local · QuoteBuilder n'est pas un client WhatsApp. À adapter à votre réalité métier.",
  ].join("\n");

  return {
    orales,
    pctNonCapturees,
    minutes,
    pctFunnel,
    taux,
    pctPerdus,
    panier,
    nonCap,
    heures,
    cout,
    deals,
    opp,
    total,
    versFunnel,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    nonCapLabel,
    heuresLabel,
    coutLabel,
    dealsLabel,
    oppLabel,
    totalLabel,
    versFunnelLabel,
    recap,
  };
}
