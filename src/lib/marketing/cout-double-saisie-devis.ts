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

export const COUT_DOUBLE_SAISIE_DEFAULTS = {
  demandes: 40,
  minutes: 18,
  pctPerte: 35,
  pctMort: 40,
  taux: 55,
  panier: 8500,
} as const;

export const COUT_DOUBLE_SAISIE_LABELS = {
  demandes: "Demandes / mois en double saisie",
  minutes: "Minutes perdues / demande",
  pctPerte: "% où une info est perdue / déformée",
  pctMort: "% des déformées qui meurent ou repartent en clarification",
  taux: "Taux horaire chargé (€)",
  panier: "Panier moyen HT (€)",
  heures: "Heures / mois perdues (resaisie)",
  coutTemps: "Coût temps mensuel",
  deformes: "Dossiers déformés / mois",
  opp: "Opportunités perdues (indicatif)",
  total: "Coût total indicatif mensuel (temps + opportunités)",
} as const;

export type CoutDoubleSaisieInput = {
  demandes: number;
  minutes: number;
  pctPerte: number;
  pctMort: number;
  taux: number;
  panier: number;
};

export type CoutDoubleSaisieTone = "ok" | "warn" | "bad";
export type CoutDoubleSaisieAlertTone = CoutDoubleSaisieTone | "neutral";

export type CoutDoubleSaisieResult = {
  demandes: number;
  minutes: number;
  pctPerte: number;
  pctMort: number;
  taux: number;
  panier: number;
  heures: number;
  coutTemps: number;
  deformes: number;
  morts: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutDoubleSaisieAlertTone;
  totalTone: CoutDoubleSaisieTone;
  defTone: CoutDoubleSaisieTone;
  oppTone: CoutDoubleSaisieTone | "neutral";
  alert: string;
  tip: string;
  heuresLabel: string;
  coutTempsLabel: string;
  deformesLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutDoubleSaisie(input: CoutDoubleSaisieInput): CoutDoubleSaisieResult {
  const demandes = clamp(finite(input.demandes), 0, 100000);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const pctPerte = clamp(finite(input.pctPerte), 0, 100);
  const pctMort = clamp(finite(input.pctMort), 0, 100);
  const taux = clamp(finite(input.taux), 0, 10000);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);

  const heures = round1((demandes * minutes) / 60);
  const coutTemps = Math.round(heures * taux);
  const deformes = round1((demandes * pctPerte) / 100);
  const morts = round1((deformes * pctMort) / 100);

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(morts * panier);
  }
  const total = coutTemps + (opp ?? 0);

  let alertTone: CoutDoubleSaisieAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (demandes <= 0) {
    alert = "Indiquez un volume de demandes en double saisie pour estimer le coût.";
    tip =
      "Même 20-30 demandes / mois avec 15 minutes de resaisie révèlent souvent des heures perdues et des briefs déformés.";
  } else if (total >= 60000 || heures >= 25 || pctPerte >= 40 || morts >= 8) {
    alertTone = "bad";
    alert = `Double saisie lourde · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : une source unique (funnel, API ou plugin), préfill vendeur pour le téléphone, interdiction Excel parallèle sur le canal n°1.";
  } else if (total >= 20000 || heures >= 10 || pctPerte >= 25 || morts >= 3) {
    alertTone = "warn";
    alert = `Double saisie notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Remplacez le formulaire pauvre par un funnel, branchez WordPress / API, et convertissez WhatsApp via lien préfill le jour même.";
  } else {
    alertTone = "ok";
    alert = `Double saisie plutôt contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Gardez la règle : pas de dossier CRM né d'une resaisie mail. Surveillez le % de Nouveau nés funnel / API / préfill.";
  }

  const totalTone: CoutDoubleSaisieTone = total >= 60000 ? "bad" : total >= 20000 ? "warn" : "ok";
  const defTone: CoutDoubleSaisieTone = deformes >= 15 ? "bad" : deformes >= 6 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutDoubleSaisieTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 80000 ? "bad" : oppValue >= 25000 ? "warn" : "ok";

  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutTempsLabel = fmtEuro(coutTemps);
  const deformesLabel = fmtNumber(deformes, 1);
  const oppLabel =
    panier > 0 && opp !== null
      ? `${fmtEuro(opp)} (${fmtNumber(morts, 1)} dossiers)`
      : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût double saisie devis (indicatif)",
    `Demandes / mois en double saisie : ${fmtNumber(demandes, 0)}`,
    `Minutes perdues / demande : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues : ${fmtNumber(heures, 1)} h`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût temps mensuel : ${fmtEuro(coutTemps)}`,
    `% info perdue / déformée : ${fmtNumber(pctPerte, 0)} % (${fmtNumber(deformes, 1)} dossiers)`,
    `% déformées → mort / clarification : ${fmtNumber(pctMort, 0)} % (${fmtNumber(morts, 1)} dossiers)`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunités perdues (indicatif) : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif (temps + opportunités) : ${fmtEuro(total)}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Sources saines : funnel, /api/leads, plugins, agent chat, lien préfill",
    "- Pas de saisie manuelle devis / pas d'écran import devis (modèle QuoteBuilder)",
    "- Le commercial aide via préfill, il ne retape pas hors funnel",
    "- Pièces jointes = uploads prospect (funnel ou espace prospect)",
    "- Score Hot / Warm / Cold à la soumission (formule fixe, pas de SLA produit)",
    "- Remplacer formulaire pauvre + Excel par une source unique",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    demandes,
    minutes,
    pctPerte,
    pctMort,
    taux,
    panier,
    heures,
    coutTemps,
    deformes,
    morts,
    opp,
    total,
    alertTone,
    totalTone,
    defTone,
    oppTone,
    alert,
    tip,
    heuresLabel,
    coutTempsLabel,
    deformesLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
