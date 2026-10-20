export const SEMESTRES: readonly { id: string; label: string; bce: number; legal: number }[] = [
  { id: "2024-1", label: "1er semestre 2024", bce: 4.5, legal: 5.07 },
  { id: "2024-2", label: "2nd semestre 2024", bce: 4.25, legal: 4.92 },
  { id: "2025-1", label: "1er semestre 2025", bce: 3.15, legal: 3.71 },
  { id: "2025-2", label: "2nd semestre 2025", bce: 2.15, legal: 2.76 },
  { id: "2026-1", label: "1er semestre 2026", bce: 2.15, legal: 2.62 },
  { id: "2026-2", label: "2nd semestre 2026", bce: 2.4, legal: 2.75 },
];

export const INDEMNITE = 40;
const DELAI_MAX = 60;

export const DEFAULTS = {
  montant: 12000,
  nbFactures: 1,
  dateFacture: "2026-04-30",
  delaiType: "nets",
  delaiJours: 30,
  dateEcheance: "2026-05-30",
  datePaiement: "2026-10-20",
  tauxMode: "legal",
  tauxContrat: 10,
  bceAutre: 2.65,
} as const;

export type DelaiType = "nets" | "fdm1" | "fdm2" | "date";
export type TauxMode = "legal" | "contrat";
export type PenalitesTone = "ok" | "bad" | "warn" | "neutral";

export type PenalitesInput = {
  montant?: unknown;
  nbFactures?: unknown;
  dateFacture?: unknown;
  delaiType?: unknown;
  delaiJours?: unknown;
  dateEcheance?: unknown;
  datePaiement?: unknown;
  tauxMode?: unknown;
  tauxContrat?: unknown;
  bceAutre?: unknown;
};

export type PenalitesSegment = {
  id: string;
  label: string;
  jours: number;
  bce: number;
  taux: number;
  plancher: number | null;
  provisoire: boolean;
  penalite: number;
};

export type PenalitesResult = {
  montant: number;
  nbFactures: number;
  delaiType: DelaiType;
  delaiJours: number;
  tauxMode: TauxMode;
  tauxContrat: number;
  bceAutre: number;
  facture: number | null;
  echeance: number | null;
  paiement: number | null;
  delaiTotal: number | null;
  delaiEtat: PenalitesTone;
  delaiMsg: string;
  joursRetard: number;
  segments: PenalitesSegment[];
  penalites: number;
  indemnite: number;
  total: number;
  parJour: number | null;
  tauxCourant: number | null;
  provisoire: boolean;
  sousPlancher: boolean;
  plancherMax: number | null;
  etat: PenalitesTone;
  verdict: string;
  conseils: string[];
  recap: string;
};

const DELAI_TYPES: readonly DelaiType[] = ["nets", "fdm1", "fdm2", "date"];

function num(v: unknown, min: number, max: number | null, fallback: number): number {
  let n = v === "" || v == null ? Number.NaN : Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number): string {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

export function fmtEur(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const c = Math.round(Math.abs(n) * 100);
  const neg = n < 0 && c !== 0;
  let txt = groupe(Math.floor(c / 100));
  if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
  return (neg ? "-" : "") + txt + "\u00a0€";
}

export function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const d = Math.round(n * 100);
  const ent = Math.floor(d / 100);
  const dec = d % 100;
  return groupe(ent) + (dec ? "," + String(dec).padStart(2, "0") : "") + "\u00a0%";
}

export function fmtJours(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return groupe(n) + (Math.abs(n) > 1 ? " jours" : " jour");
}

export function parseDate(s: unknown): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? "" : s).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return Math.round(t / 86400000);
}

function ymd(day: number): { y: number; m: number; d: number } {
  const dt = new Date(day * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export function fmtDate(day: number | null): string {
  if (day == null) return "n/a";
  const p = ymd(day);
  return String(p.d).padStart(2, "0") + "/" + String(p.m).padStart(2, "0") + "/" + p.y;
}

export function finDeMois(day: number): number {
  const p = ymd(day);
  return Math.round(Date.UTC(p.y, p.m, 0) / 86400000);
}

export function semestreDe(day: number): {
  id: string;
  label: string;
  debut: number;
  fin: number;
  bce: number | null;
  legal: number | null;
  provisoire: boolean;
} {
  const p = ymd(day);
  const half = p.m <= 6 ? 1 : 2;
  const debut = Math.round(Date.UTC(p.y, half === 1 ? 0 : 6, 1) / 86400000);
  const fin = Math.round(Date.UTC(p.y, half === 1 ? 6 : 12, 0) / 86400000);
  const id = p.y + "-" + half;
  const known = SEMESTRES.find((item) => item.id === id) ?? null;
  return {
    id,
    label: known ? known.label : (half === 1 ? "1er" : "2nd") + " semestre " + p.y,
    debut,
    fin,
    bce: known ? known.bce : null,
    legal: known ? known.legal : null,
    provisoire: !known,
  };
}

export function computePenalites(input: PenalitesInput = {}): PenalitesResult {
  const montant = num(input.montant, 0, 1e9, 0);
  const nbFactures = Math.floor(num(input.nbFactures, 1, 1000, 1));
  const rawType = String(input.delaiType ?? "");
  const delaiType: DelaiType = DELAI_TYPES.includes(rawType as DelaiType) ? (rawType as DelaiType) : "nets";
  const delaiJours = Math.floor(num(input.delaiJours, 0, 365, 0));
  const tauxMode: TauxMode = input.tauxMode === "contrat" ? "contrat" : "legal";
  const tauxContrat = num(input.tauxContrat, 0, 100, 0);
  const bceAutre = num(input.bceAutre, 0, 20, 0);
  const facture = parseDate(input.dateFacture);
  const paiement = parseDate(input.datePaiement);

  let echeance: number | null = null;
  if (delaiType === "date") echeance = parseDate(input.dateEcheance);
  else if (facture != null) {
    if (delaiType === "nets") echeance = facture + delaiJours;
    else if (delaiType === "fdm1") echeance = finDeMois(facture) + 45;
    else echeance = finDeMois(facture + 45);
  }
  const delaiTotal = facture != null && echeance != null ? echeance - facture : null;

  let delaiEtat: PenalitesTone = "ok";
  let delaiMsg = "";
  if (delaiTotal == null) {
    delaiEtat = "neutral";
    delaiMsg = "Renseignez la date de la facture et le délai pour obtenir l'échéance.";
  } else if (delaiTotal < 0) {
    delaiEtat = "bad";
    delaiMsg = "L'échéance tombe avant la date de la facture : vérifiez les dates.";
  } else if (delaiType === "nets" && delaiJours > DELAI_MAX) {
    delaiEtat = "bad";
    delaiMsg =
      "Un délai de " +
      delaiJours +
      " jours après la facture dépasse le maximum de 60 jours entre professionnels, hors secteurs à délai spécifique.";
  } else if (delaiType === "fdm1" || delaiType === "fdm2") {
    delaiEtat = "warn";
    delaiMsg =
      "45 jours fin de mois : possible seulement si c'est écrit au contrat et que ce n'est pas abusif pour le fournisseur. Convenez aussi de la méthode de calcul : les deux méthodes ne donnent pas la même échéance.";
  } else if (delaiType === "date" && delaiTotal > DELAI_MAX) {
    delaiEtat = "warn";
    delaiMsg =
      "L'échéance tombe " +
      delaiTotal +
      " jours après la facture. Au-delà de 60 jours, ce n'est possible qu'avec un délai de 45 jours fin de mois écrit au contrat, ou dans un secteur à délai spécifique.";
  } else {
    delaiMsg =
      "Délai de " +
      delaiTotal +
      " jours après la facture : dans la limite de 60 jours. Il doit figurer dans vos CGV et sur la facture.";
  }

  const joursRetard = echeance != null && paiement != null ? Math.max(0, paiement - echeance) : 0;
  const segments: PenalitesSegment[] = [];
  if (joursRetard > 0 && echeance != null && paiement != null) {
    let d = echeance + 1;
    while (d <= paiement) {
      const s = semestreDe(d);
      const fin = Math.min(s.fin, paiement);
      const jours = fin - d + 1;
      const bce = s.provisoire || s.bce == null ? bceAutre : s.bce;
      const taux = tauxMode === "legal" ? r6(bce + 10) : tauxContrat;
      const plancher = s.legal == null ? null : r6(s.legal * 3);
      segments.push({
        id: s.id,
        label: s.label,
        jours,
        bce,
        taux,
        plancher,
        provisoire: s.provisoire,
        penalite: r6(montant * taux / 100 * jours / 365),
      });
      d = fin + 1;
    }
  }

  let penalites = 0;
  for (const sg of segments) penalites += montant * sg.taux / 100 * sg.jours / 365;
  penalites = r6(penalites);
  const indemnite = joursRetard > 0 && montant > 0 ? INDEMNITE * nbFactures : 0;
  const total = r6(penalites + indemnite);
  const provisoire = segments.some((sg) => sg.provisoire);
  const sousPlancher =
    tauxMode === "contrat" && segments.some((sg) => sg.plancher != null && tauxContrat < sg.plancher);
  let plancherMax: number | null = null;
  for (const sg of segments) {
    if (sg.plancher != null && (plancherMax == null || sg.plancher > plancherMax)) plancherMax = sg.plancher;
  }

  let tauxCourant: number | null = null;
  if (paiement != null) {
    const sp = semestreDe(paiement);
    const bceP = sp.provisoire || sp.bce == null ? bceAutre : sp.bce;
    tauxCourant = tauxMode === "legal" ? r6(bceP + 10) : tauxContrat;
  }
  const parJour = tauxCourant == null ? null : r6(montant * tauxCourant / 100 / 365);

  let etat: PenalitesTone;
  let verdict: string;
  const resume =
    fmtJours(joursRetard) +
    " de retard : " +
    fmtEur(penalites) +
    " de pénalités et " +
    fmtEur(indemnite) +
    " d'indemnité forfaitaire, soit " +
    fmtEur(total) +
    " à réclamer en plus des " +
    fmtEur(montant) +
    " dus.";
  if (delaiEtat === "neutral") {
    etat = "neutral";
    verdict = delaiMsg;
  } else if (delaiEtat === "bad") {
    etat = "bad";
    verdict = delaiMsg;
  } else if (montant <= 0) {
    etat = "neutral";
    verdict = "Saisissez le montant restant dû pour calculer les pénalités.";
  } else if (paiement == null) {
    etat = "neutral";
    verdict = "Saisissez la date du paiement, ou la date du jour si la facture n'est pas payée.";
  } else if (joursRetard === 0) {
    etat = "neutral";
    verdict = "Facture payée à l'échéance ou avant : aucune pénalité ni indemnité.";
  } else if (sousPlancher) {
    etat = "bad";
    verdict =
      "Votre taux contractuel de " +
      fmtPct(tauxContrat) +
      " est sous le plancher légal de " +
      fmtPct(plancherMax) +
      " (trois fois le taux de l'intérêt légal). Corrigez vos CGV avant de réclamer ce montant.";
  } else if (provisoire) {
    etat = "warn";
    verdict = resume + " Une partie du retard tombe sur un semestre dont le taux n'est pas dans le tableau : vérifiez le taux BCE retenu.";
  } else if (delaiEtat === "warn") {
    etat = "warn";
    verdict = resume + " Vérifiez que le délai est bien écrit au contrat.";
  } else {
    etat = "ok";
    verdict = resume;
  }

  const conseils: string[] = [];
  if (joursRetard > 0 && montant > 0) {
    conseils.push(
      "Les pénalités sont exigibles sans rappel, dès le lendemain de l'échéance. Elles ne se paient pas seules pour autant : envoyez le calcul par écrit avec votre relance.",
    );
    conseils.push(
      "L'indemnité de 40 € est due une fois par facture payée en retard, même en cas de paiement partiel. Elle n'est pas soumise à la TVA. Si vos frais réels de recouvrement sont plus élevés, une indemnisation complémentaire peut être demandée sur justificatifs.",
    );
    if (segments.length > 1 && tauxMode === "legal") {
      conseils.push(
        "Le retard couvre " +
          segments.length +
          " semestres : chaque jour prend le taux de son semestre. Ne prenez pas le dernier taux annoncé par la BCE pour toute la période.",
      );
    }
    if (tauxMode === "contrat" && !sousPlancher) {
      conseils.push(
        "Votre taux contractuel ne s'applique que s'il est écrit dans vos CGV ou au contrat, et accepté avant la commande. Sinon, c'est le taux légal.",
      );
    }
    if (tauxMode === "legal") {
      conseils.push(
        "Pas de taux écrit dans vos CGV ? C'est le taux BCE + 10 points qui s'applique. Vous pouvez écrire un autre taux, jamais sous trois fois le taux de l'intérêt légal.",
      );
    }
  }
  if (delaiType === "fdm1" || delaiType === "fdm2") {
    conseils.push(
      "Facture du " +
        fmtDate(facture) +
        " : échéance le " +
        fmtDate(facture == null ? null : finDeMois(facture) + 45) +
        " en « fin du mois puis 45 jours », le " +
        fmtDate(facture == null ? null : finDeMois(facture + 45)) +
        " en « 45 jours puis fin du mois ». Écrivez la méthode dans vos conditions.",
    );
  }
  conseils.push(
    "Ces conditions se décident avant la commande, pas au moment de la relance : écrivez le délai, le taux des pénalités et l'indemnité de 40 € dans vos CGV et dans le devis que le client accepte.",
  );

  let tauxTxt: string;
  if (tauxMode === "legal") {
    const uniques: string[] = [];
    for (const sg of segments) {
      const t = fmtPct(sg.taux);
      if (!uniques.includes(t)) uniques.push(t);
    }
    tauxTxt = "Taux : BCE + 10 points" + (uniques.length ? " (" + uniques.join(" puis ") + ")" : "");
  } else {
    tauxTxt = "Taux : contractuel, " + fmtPct(tauxContrat);
  }
  const delaiTxt =
    delaiType === "nets"
      ? delaiJours + " jours nets"
      : delaiType === "fdm1"
        ? "45 jours fin de mois, fin du mois puis 45 jours"
        : delaiType === "fdm2"
          ? "45 jours fin de mois, 45 jours puis fin du mois"
          : "échéance saisie";
  const recap = [
    "Pénalités de retard de paiement (B2B)",
    "Montant dû : " + fmtEur(montant) + " TTC, " + nbFactures + (nbFactures > 1 ? " factures" : " facture"),
    "Facture du " + fmtDate(facture) + ", échéance le " + fmtDate(echeance) + " (" + delaiTxt + ")",
    "Paiement le " + fmtDate(paiement) + " : " + fmtJours(joursRetard) + " de retard",
    tauxTxt,
    "Pénalités : " + fmtEur(penalites),
    "Indemnité forfaitaire : " + fmtEur(indemnite) + (indemnite > 0 ? " (" + nbFactures + " × 40\u00a0€)" : ""),
    "Total à réclamer : " + fmtEur(total),
    "Calcul : quotebuilder.co/outils/calculateur-penalites-retard-paiement",
  ].join("\n");

  return {
    montant,
    nbFactures,
    delaiType,
    delaiJours,
    tauxMode,
    tauxContrat,
    bceAutre,
    facture,
    echeance,
    paiement,
    delaiTotal,
    delaiEtat,
    delaiMsg,
    joursRetard,
    segments,
    penalites,
    indemnite,
    total,
    parJour,
    tauxCourant,
    provisoire,
    sousPlancher,
    plancherMax,
    etat,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: PenalitesInput = {}): string {
  return computePenalites(input).recap;
}
