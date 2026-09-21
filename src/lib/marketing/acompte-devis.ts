function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const JALON_LABELS = [
  "Jalon 1 · signature / commande (acompte)",
  "Jalon 2 · commande matière / livraison",
  "Jalon 3 · début / fin de pose",
  "Jalon 4 · réception / solde",
] as const;

export type AcompteMode = "pct" | "fixe";

export type AcompteDevisInput = {
  ht: number;
  tva: number;
  mode: AcompteMode;
  pct: number;
  fixe: number;
  jalons: number;
  delai: number;
};

export type AcompteJalon = {
  label: string;
  amount: number;
};

export type AcompteDevisResult = {
  ttc: number;
  acompte: number;
  reste: number;
  pctReel: number;
  delai: number;
  nJalons: number;
  jalons: AcompteJalon[];
  demarrage: string;
  tip: string;
  recap: string;
};

function fmtEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function fmtNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function buildAcompteJalons(ttc: number, acompte: number, nJalons: number): AcompteJalon[] {
  const n = Math.max(1, Math.min(4, Math.round(nJalons)));
  const parts: AcompteJalon[] = [];
  if (n === 1) {
    parts.push({ label: JALON_LABELS[0], amount: round2(acompte) });
    const reste = round2(ttc - acompte);
    if (reste > 0) parts.push({ label: "Solde à réception", amount: reste });
    return parts;
  }
  parts.push({ label: JALON_LABELS[0], amount: round2(acompte) });
  const reste = round2(ttc - acompte);
  const autres = n - 1;
  if (autres <= 0) return parts;
  const base = round2(reste / autres);
  let allocated = 0;
  for (let i = 1; i < n; i++) {
    const isLast = i === n - 1;
    const amount = isLast ? round2(reste - allocated) : base;
    if (!isLast) allocated = round2(allocated + amount);
    const label = isLast
      ? `${JALON_LABELS[Math.min(i, 3)].replace(/ · .*/, "")} · solde / réception`
      : JALON_LABELS[Math.min(i, 3)];
    parts.push({ label, amount });
  }
  return parts;
}

export function acompteDevisTip({
  ht,
  pctReel,
  ttc,
  nJalons,
}: {
  ht: number;
  pctReel: number;
  ttc: number;
  nJalons: number;
}): string {
  if (ht === 0) {
    return "Indiquez un montant HT pour obtenir l’acompte et le reste dû.";
  }
  if (pctReel < 20 && ttc >= 3000) {
    return "Sous 20 % sur un panier moyen/élevé, le risque matière et créneau reste élevé. Beaucoup d’équipes pose/fab visent plutôt 30–40 % à la commande.";
  }
  if (pctReel >= 50) {
    return "Acompte élevé : utile si matière spécifique ou nouveau compte. Vérifiez que le texte du devis explique le déclencheur (signature vs commande matière).";
  }
  if (nJalons >= 3) {
    return `Échéancier en ${fmtNumber(nJalons, 0)} jalons : gardez un lien avec des événements réels (commande matière, livraison, réception), pas seulement des lignes de confort.`;
  }
  return "Affichez acompte TTC + reste dû sur le devis, et bloquez le lancement atelier tant que l’acompte n’est pas confirmé (sauf dérogation écrite).";
}

export function computeAcompteDevis(input: AcompteDevisInput): AcompteDevisResult {
  const ht = clamp(input.ht, 0, Number.MAX_SAFE_INTEGER);
  const tva = clamp(input.tva, 0, 100);
  const pct = clamp(input.pct, 0, 100);
  const fixe = clamp(input.fixe, 0, Number.MAX_SAFE_INTEGER);
  const nJalons = clamp(Number.isFinite(input.jalons) ? input.jalons : 3, 1, 4);
  const delai = clamp(Number.isFinite(input.delai) ? input.delai : 5, 0, 365);

  const ttc = round2(ht * (1 + tva / 100));
  const acompte = input.mode === "fixe" ? round2(Math.min(fixe, ttc)) : round2((ttc * pct) / 100);
  const reste = round2(Math.max(0, ttc - acompte));
  const pctReel = ttc > 0 ? (acompte / ttc) * 100 : 0;
  const jalons = buildAcompteJalons(ttc, acompte, nJalons);
  const demarrage =
    delai === 0 ? "dès encaissement (J0)" : `sous ${fmtNumber(delai, 0)} j après encaissement`;

  const lines = [
    "Récap acompte devis (indicatif)",
    `Total HT : ${fmtEuro(ht)}`,
    `TVA ${fmtNumber(tva, 1)} % · Total TTC : ${fmtEuro(ttc)}`,
    `Acompte : ${fmtEuro(acompte)} (${fmtNumber(pctReel, 1)} %)`,
    `Reste dû : ${fmtEuro(reste)}`,
    `Démarrage indicatif : ${delai === 0 ? "dès encaissement" : `J+${fmtNumber(delai, 0)} après encaissement`}`,
    "",
    "Jalons :",
    ...jalons.map((part, index) => `${index + 1}. ${part.label} · ${fmtEuro(part.amount)}`),
    "",
    "Calcul local · à adapter à votre grille métier / CGV.",
  ];

  return {
    ttc,
    acompte,
    reste,
    pctReel,
    delai,
    nJalons,
    jalons,
    demarrage,
    tip: acompteDevisTip({ ht, pctReel, ttc, nJalons }),
    recap: lines.join("\n"),
  };
}
