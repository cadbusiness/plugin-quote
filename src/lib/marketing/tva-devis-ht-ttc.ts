function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export type TvaDevisMode = "ht" | "ttc" | "lines";

export type TvaDevisLine = {
  ht: number;
  ratePct: number;
};

export type TvaDevisInput = {
  mode: TvaDevisMode;
  montant: number;
  /** Taux en % déjà résolu (preset ou personnalisé). Ignoré en mode lignes. */
  ratePct: number;
  lines: readonly TvaDevisLine[];
};

export type TvaBreakdown = {
  ratePct: number;
  tva: number;
};

export type TvaAlertTone = "ok" | "warn" | "neutral";

export type TvaDevisResult = {
  ht: number;
  tva: number;
  ttc: number;
  breakdown: TvaBreakdown[];
  lineTtc: (number | null)[];
  showBreakdown: boolean;
  alertTone: TvaAlertTone;
  alert: string;
  recap: string;
};

export const TVA_RATE_PRESETS = [
  { value: "20", label: "20 %" },
  { value: "10", label: "10 %" },
  { value: "5.5", label: "5,5 %" },
  { value: "2.1", label: "2,1 %" },
  { value: "0", label: "0 % (exonération / hors champ indicatif)" },
  { value: "custom", label: "Taux personnalisé…" },
] as const;

export const TVA_LINE_RATE_PRESETS = [
  { value: 20, label: "20 %" },
  { value: 10, label: "10 %" },
  { value: 5.5, label: "5,5 %" },
  { value: 2.1, label: "2,1 %" },
  { value: 0, label: "0 %" },
] as const;

export const TVA_DEVIS_DEFAULTS = {
  mode: "ht" as const,
  montant: 10000,
  ratePreset: "20" as const,
  customRate: 8.5,
  lines: [
    { ht: 4000, ratePct: 20 },
    { ht: 3000, ratePct: 10 },
    { ht: 0, ratePct: 20 },
  ] satisfies TvaDevisLine[],
};

export const TVA_DEVIS_LABELS = {
  modes: {
    ht: "HT → TTC",
    ttc: "TTC → HT",
    lines: "Plusieurs lignes",
  },
  montantHt: "Montant HT (€)",
  montantTtc: "Montant TTC (€)",
  rate: "Taux de TVA",
  customRate: "Taux personnalisé (%)",
  customHint: "À utiliser seulement si votre expert-comptable vous a indiqué ce taux pour ce cas.",
  linesHint:
    "Saisissez jusqu’à 3 lignes. Laissez le montant à 0 pour ignorer une ligne. Les montants sont toujours en HT ; la TVA et le TTC sont dérivés.",
  lineHt: "Montant HT (€)",
  lineRate: "Taux",
  lineTtc: "TTC ligne",
  totalHt: "Total HT",
  totalTva: "Total TVA",
  totalTtc: "Total TTC",
  disclaimer:
    "Calcul arithmétique indicatif pour comprendre HT / TVA / TTC sur un devis. Ce n’est pas un conseil fiscal. Les taux applicables dépendent de votre situation : vérifiez avec votre expert-comptable. QuoteBuilder n’applique que les taux que vous saisissez : il ne choisit pas le taux légal et ne gère pas l’autoliquidation. Aucune donnée n’est envoyée.",
} as const;

export function resolveTvaRatePct(preset: string, customRate: number) {
  if (preset === "custom") return clamp(Number.isFinite(customRate) ? customRate : 0, 0, 100);
  const parsed = Number.parseFloat(preset);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 100) : 0;
}

function fmtEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function fmtPct(value: number) {
  return (
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0) + " %"
  );
}

function addToMap(map: Map<number, number>, ratePct: number, tva: number) {
  map.set(ratePct, (map.get(ratePct) ?? 0) + tva);
}

export function computeTvaDevisHtTtc(input: TvaDevisInput): TvaDevisResult {
  const mode = input.mode;
  const byRate = new Map<number, number>();
  const lineTtc: (number | null)[] = [];
  let ht = 0;
  let tva = 0;
  let ttc = 0;
  let alertTone: TvaAlertTone = "neutral";
  let alert = "";

  if (mode === "lines") {
    const distinct = new Set<number>();
    let linesUsed = 0;
    for (const line of input.lines) {
      const amount = Math.max(0, Number.isFinite(line.ht) ? line.ht : 0);
      const ratePct = clamp(Number.isFinite(line.ratePct) ? line.ratePct : 0, 0, 100);
      const rate = ratePct / 100;
      const lineHt = round2(amount);
      const lineTva = round2(lineHt * rate);
      const lineTotal = round2(lineHt + lineTva);
      lineTtc.push(amount > 0 ? lineTotal : null);
      if (amount > 0) {
        linesUsed += 1;
        ht += lineHt;
        tva += lineTva;
        ttc += lineTotal;
        distinct.add(ratePct);
        addToMap(byRate, ratePct, lineTva);
      }
    }
    ht = round2(ht);
    tva = round2(tva);
    ttc = round2(ttc);
    if (linesUsed === 0) {
      alert = "Saisissez au moins une ligne avec un montant HT pour calculer les totaux.";
    } else if (distinct.size > 1) {
      alertTone = "warn";
      alert =
        "Plusieurs taux sur ce devis : détaillez bien la TVA par taux en bas de page (et le taux sur chaque ligne). Un seul total TVA global sans ventilation embrouille le client.";
    } else {
      alertTone = "ok";
      alert = "Un seul taux sur les lignes renseignées · total cohérent HT + TVA = TTC.";
    }
  } else {
    const ratePct = clamp(Number.isFinite(input.ratePct) ? input.ratePct : 0, 0, 100);
    const rate = ratePct / 100;
    const montant = Math.max(0, Number.isFinite(input.montant) ? input.montant : 0);
    if (mode === "ht") {
      ht = round2(montant);
      tva = round2(ht * rate);
      ttc = round2(ht + tva);
    } else {
      ttc = round2(montant);
      ht = rate === 0 ? ttc : round2(ttc / (1 + rate));
      tva = round2(ttc - ht);
    }
    addToMap(byRate, ratePct, tva);
    if (montant <= 0) {
      alert = "Indiquez un montant pour obtenir HT, TVA et TTC.";
    } else if (ratePct === 0) {
      alertTone = "warn";
      alert =
        "Taux 0 % : vérifiez avec votre expert-comptable si une mention d’exonération / hors champ est nécessaire sur le devis.";
    } else {
      alertTone = "ok";
      alert = `${mode === "ht" ? "HT → TTC" : "TTC → HT"} à ${fmtPct(ratePct)} · contrôlez que ce taux correspond bien à votre cas.`;
    }
  }

  const breakdown = [...byRate.entries()]
    .map(([ratePct, amount]) => ({ ratePct, tva: round2(amount) }))
    .sort((a, b) => b.ratePct - a.ratePct);
  const showBreakdown = breakdown.length > 1 || (breakdown.length === 1 && mode === "lines");

  const modeLabel = TVA_DEVIS_LABELS.modes[mode];
  const recapLines = [
    "Récap TVA devis HT / TTC (indicatif, pas un conseil fiscal)",
    `Mode : ${modeLabel}`,
    `Total HT : ${fmtEuro(ht)}`,
    ...breakdown.map((row) => `TVA ${fmtPct(row.ratePct)} : ${fmtEuro(row.tva)}`),
    `Total TVA : ${fmtEuro(tva)}`,
    `Total TTC : ${fmtEuro(ttc)}`,
    "",
    "Calcul local · les taux applicables se valident avec un expert-comptable.",
  ];

  return {
    ht,
    tva,
    ttc,
    breakdown,
    lineTtc,
    showBreakdown,
    alertTone,
    alert,
    recap: recapLines.join("\n"),
  };
}
