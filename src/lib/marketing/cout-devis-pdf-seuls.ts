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

export const COUT_DEVIS_PDF_SEULS_DEFAULTS = {
  devis: 35,
  jamaisPct: 25,
  obsoletesPct: 18,
  minutes: 14,
  taux: 55,
  panier: 6500,
  convPdf: 14,
  convLien: 18,
} as const;

export type CoutDevisPdfSeulsInput = {
  devis: number;
  jamaisPct: number;
  obsoletesPct: number;
  minutes: number;
  taux: number;
  panier: number;
  convPdf: number;
  convLien: number;
};

export type CoutDevisPdfTone = "ok" | "warn" | "bad";
export type CoutDevisPdfAlertTone = CoutDevisPdfTone | "neutral";

export type CoutDevisPdfSeulsResult = {
  devis: number;
  jamaisPct: number;
  obsoletesPct: number;
  minutes: number;
  taux: number;
  panier: number;
  convPdf: number;
  convLien: number;
  heures: number;
  coutFriction: number;
  fantomes: number;
  deals: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutDevisPdfAlertTone;
  totalTone: CoutDevisPdfTone;
  oppTone: CoutDevisPdfTone | "neutral";
  alert: string;
  tip: string;
  heuresLabel: string;
  coutFrictionLabel: string;
  fantomesLabel: string;
  dealsLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutDevisPdfSeuls(input: CoutDevisPdfSeulsInput): CoutDevisPdfSeulsResult {
  const devis = clamp(finite(input.devis), 0, 100000);
  const jamaisPct = clamp(finite(input.jamaisPct), 0, 100);
  const obsoletesPct = clamp(finite(input.obsoletesPct), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 480);
  const taux = clamp(finite(input.taux), 0, 10000);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const convPdf = clamp(finite(input.convPdf), 0, 100);
  const convLien = clamp(finite(input.convLien), 0, 100);

  const heures = round1((devis * minutes) / 60);
  const coutFriction = Math.round(heures * taux);
  const fantomes = round1(devis * Math.min(1, (jamaisPct + obsoletesPct * 0.7) / 100));
  const ecartConv = Math.max(0, (convLien - convPdf) / 100);
  const deals = round1(devis * ecartConv);

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(deals * panier);
  }
  const total = coutFriction + (opp ?? 0);

  let alertTone: CoutDevisPdfAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (devis <= 0) {
    alert = "Indiquez un volume de devis PDF / mois pour estimer la friction.";
    tip = "Même 15–20 devis / mois révèlent souvent des heures de renvoi de pièces jointes.";
  } else if (total >= 15000 || heures >= 12) {
    alertTone = "bad";
    alert = `Friction PDF élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : passer les devis Hot en lien sécurisé, garder le PDF en export, et relancer sur ouverture réelle plutôt que « avez-vous reçu ? ».";
  } else if (total >= 5000 || heures >= 5) {
    alertTone = "warn";
    alert = `Friction PDF notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez 20 % des envois en lien + espace prospect. Mesurez les renvois de PJ et le délai de première ouverture.";
  } else {
    alertTone = "ok";
    alert = `Friction PDF contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez le lien comme canal principal. Surveillez quand même les versions obsolètes et la validité affichée.";
  }

  const totalTone: CoutDevisPdfTone = total >= 15000 ? "bad" : total >= 5000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutDevisPdfTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 10000 ? "bad" : oppValue >= 3000 ? "warn" : "ok";

  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutFrictionLabel = fmtEuro(coutFriction);
  const fantomesLabel = fmtNumber(fantomes, 1);
  const dealsLabel = fmtNumber(deals, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût devis PDF seuls (indicatif)",
    `Devis / mois en PDF : ${fmtNumber(devis, 0)}`,
    `% jamais ouverts : ${fmtNumber(jamaisPct, 0)} %`,
    `% versions / PJ foireuses : ${fmtNumber(obsoletesPct, 0)} %`,
    `Minutes ressaisie / devis : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues : ${heuresLabel}`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût friction : ${coutFrictionLabel}`,
    `Devis fantômes estimés : ${fantomesLabel}`,
    `Conv. PDF : ${fmtNumber(convPdf, 1)} % → conv. lien : ${fmtNumber(convLien, 1)} %`,
    `Deals potentiellement récupérés : ${dealsLabel}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités manquées : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Lien d’abord, PDF en téléchargement dans l’espace",
    "- Une seule source de vérité (plus de v3_final)",
    "- Relances basées sur ouverture / activité",
    "- Validité visible sur la page devis",
    "- Signature / acceptation sur la version courante",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    devis,
    jamaisPct,
    obsoletesPct,
    minutes,
    taux,
    panier,
    convPdf,
    convLien,
    heures,
    coutFriction,
    fantomes,
    deals,
    opp,
    total,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    heuresLabel,
    coutFrictionLabel,
    fantomesLabel,
    dealsLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
