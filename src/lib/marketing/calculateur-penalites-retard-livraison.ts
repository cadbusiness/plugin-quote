export const MODES = ["taux", "fraction", "forfait"] as const;
export const ASSIETTES = ["commande", "partie"] as const;
export const PALIERS_TABLE = [7, 14, 30, 60, 90] as const;

export type Mode = (typeof MODES)[number];
export type Assiette = (typeof ASSIETTES)[number];
export type RetardTone = "ok" | "warn" | "bad" | "neutral";

export const DEFAULTS = {
  montantHT: 48000,
  assiette: "commande",
  montantRetard: 18000,
  datePrevue: "2027-03-01",
  dateReelle: "2027-03-29",
  mode: "taux",
  franchise: 5,
  taux: 1,
  fraction: 3000,
  forfait: 150,
  plafond: 5,
  seuil: 0,
  prejudice: 2000,
} as const;

export type RetardInput = {
  montantHT?: unknown;
  assiette?: unknown;
  montantRetard?: unknown;
  datePrevue?: unknown;
  dateReelle?: unknown;
  mode?: unknown;
  franchise?: unknown;
  taux?: unknown;
  fraction?: unknown;
  forfait?: unknown;
  plafond?: unknown;
  seuil?: unknown;
  prejudice?: unknown;
};

export type PenaliteDue = {
  joursPenalises: number;
  brut: number;
  plafonne: boolean;
  exonere: boolean;
  due: number;
};

export type RetardLigne = {
  jours: number;
  joursPenalises: number;
  due: number;
  pct: number;
  plafonne: boolean;
  courant: boolean;
};

export type RetardResult = {
  montantHT: number;
  assiette: Assiette;
  montantRetard: number;
  assietteMontant: number;
  mode: Mode;
  franchise: number;
  taux: number;
  fraction: number;
  forfait: number;
  plafond: number;
  plafondMontant: number | null;
  seuil: number;
  prejudice: number;
  prevue: number | null;
  reelle: number | null;
  valide: boolean;
  ecart: number | null;
  joursRetard: number | null;
  joursPenalises: number | null;
  parJour: number;
  brut: number | null;
  due: number | null;
  plafonne: boolean;
  exonere: boolean;
  pctCommande: number | null;
  net: number | null;
  joursPlafond: number | null;
  ratio: number | null;
  lignes: RetardLigne[];
  etat: RetardTone;
  verdict: string;
  conseils: string[];
  recap: string;
};

function num(v: unknown, min: number, max: number | null, fallback: number): number {
  let n = v === "" || v == null ? Number.NaN : Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function r6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number): string {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

function isMode(value: unknown): value is Mode {
  return value === "taux" || value === "fraction" || value === "forfait";
}

function isAssiette(value: unknown): value is Assiette {
  return value === "commande" || value === "partie";
}

export function fmtEur(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const c = Math.round(Math.abs(n) * 100);
  const neg = n < 0 && c !== 0;
  let txt = groupe(Math.floor(c / 100));
  if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
  return (neg ? "-" : "") + txt + "\u00a0€";
}

export function fmtNum(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const d = Math.round(Math.abs(n) * 100);
  const neg = n < 0 && d !== 0;
  const ent = Math.floor(d / 100);
  const dec = d % 100;
  let txt = groupe(ent);
  if (dec) txt += "," + (dec % 10 === 0 ? String(dec / 10) : String(dec).padStart(2, "0"));
  return (neg ? "-" : "") + txt;
}

export function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtNum(n) + "\u00a0%";
}

export function fmtJours(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtNum(n) + (Math.abs(n) >= 2 ? " jours" : " jour");
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

export function fmtDate(day: number | null): string {
  if (day == null) return "n/a";
  const dt = new Date(day * 86400000);
  return (
    String(dt.getUTCDate()).padStart(2, "0") +
    "/" +
    String(dt.getUTCMonth() + 1).padStart(2, "0") +
    "/" +
    dt.getUTCFullYear()
  );
}

export function penaliteParJour(
  mode: string,
  assietteMontant: number,
  taux: number,
  fraction: number,
  forfait: number,
): number {
  if (mode === "forfait") return r2(forfait);
  if (mode === "fraction") return r2(assietteMontant / fraction);
  return r2((assietteMontant * taux) / 1000);
}

export function penaliteDue(
  joursRetard: number,
  franchise: number,
  parJour: number,
  plafondMontant: number | null,
  seuil: number,
): PenaliteDue {
  const jp = Math.max(0, joursRetard - franchise);
  const brut = r2(parJour * jp);
  const apres = plafondMontant != null ? Math.min(brut, plafondMontant) : brut;
  const exonere = seuil > 0 && apres > 0 && apres <= seuil;
  return {
    joursPenalises: jp,
    brut,
    plafonne: plafondMontant != null && brut > plafondMontant,
    exonere,
    due: exonere ? 0 : r2(apres),
  };
}

export function libelleClause(
  mode: string,
  taux: number,
  fraction: number,
  forfait: number,
  assietteMontant: number,
): string {
  if (mode === "forfait") return fmtEur(forfait) + " HT par jour";
  if (mode === "fraction") return "1/" + groupe(fraction) + " par jour de " + fmtEur(assietteMontant);
  return fmtNum(taux) + "\u00a0‰ par jour de " + fmtEur(assietteMontant);
}

export function computeRetard(input: RetardInput = {}): RetardResult {
  const o = input;
  const montantHT = num(o.montantHT, 0, null, 0);
  const assiette: Assiette = isAssiette(o.assiette) ? o.assiette : "commande";
  const montantRetard = Math.min(num(o.montantRetard, 0, null, 0), montantHT);
  const mode: Mode = isMode(o.mode) ? o.mode : "taux";
  const franchise = Math.round(num(o.franchise, 0, 365, 0));
  const taux = num(o.taux, 0, 100, 0);
  const fraction = num(o.fraction, 1, 100000, 3000);
  const forfait = num(o.forfait, 0, null, 0);
  const plafond = num(o.plafond, 0, 100, 0);
  const seuil = num(o.seuil, 0, null, 0);
  const prejudice = num(o.prejudice, 0, null, 0);
  const prevue = parseDate(o.datePrevue);
  const reelle = parseDate(o.dateReelle);

  const assietteMontant = assiette === "partie" ? montantRetard : montantHT;
  const parJour = penaliteParJour(mode, assietteMontant, taux, fraction, forfait);
  const plafondMontant = plafond > 0 ? r2((montantHT * plafond) / 100) : null;
  const ecart = prevue != null && reelle != null && montantHT > 0 ? reelle - prevue : null;
  const valide = ecart != null;
  const joursRetard = ecart == null ? null : Math.max(0, ecart);

  const res = valide && joursRetard != null ? penaliteDue(joursRetard, franchise, parJour, plafondMontant, seuil) : null;
  const joursPenalises = res ? res.joursPenalises : null;
  const brut = res ? res.brut : null;
  const due = res ? res.due : null;
  const plafonne = res ? res.plafonne : false;
  const exonere = res ? res.exonere : false;
  const pctCommande = valide && due != null ? r6((due / montantHT) * 100) : null;
  const net = valide && due != null ? r2(montantHT - due) : null;
  const joursPlafond =
    plafondMontant != null && parJour > 0 ? Math.ceil(r6(plafondMontant / parJour)) + franchise : null;
  const ratio = valide && prejudice > 0 && due != null ? r6((due / prejudice) * 100) : null;

  const lignes: RetardLigne[] = [];
  if (valide && joursRetard != null && due != null) {
    const durees = [...PALIERS_TABLE] as number[];
    if (joursRetard > 0 && !durees.includes(joursRetard)) durees.push(joursRetard);
    durees.sort((a, b) => a - b);
    for (const j of durees) {
      const p = penaliteDue(j, franchise, parJour, plafondMontant, seuil);
      lignes.push({
        jours: j,
        joursPenalises: p.joursPenalises,
        due: p.due,
        pct: r6((p.due / montantHT) * 100),
        plafonne: p.plafonne,
        courant: j === joursRetard,
      });
    }
  }

  let etat: RetardTone;
  let verdict: string;
  if (!valide || ecart == null || joursRetard == null || joursPenalises == null) {
    etat = "neutral";
    verdict = "Renseignez le montant de la commande et deux dates valides.";
  } else if (ecart < 0) {
    etat = "ok";
    verdict = "Livraison en avance de " + fmtJours(-ecart) + " : aucune pénalité.";
  } else if (joursRetard === 0) {
    etat = "ok";
    verdict = "Livraison à la date convenue : aucune pénalité.";
  } else if (joursPenalises === 0) {
    etat = "ok";
    verdict = "Retard de " + fmtJours(joursRetard) + ", dans la franchise de " + fmtJours(franchise) + " : aucune pénalité.";
  } else if (parJour === 0) {
    etat = "neutral";
    verdict =
      "Retard de " + fmtJours(joursRetard) + ", mais la clause donne 0 € par jour : renseignez un taux, une fraction ou un montant.";
  } else if (exonere) {
    etat = "ok";
    verdict = "Pénalités de " + fmtEur(brut) + ", sous le seuil d'exonération de " + fmtEur(seuil) + " : rien n'est dû.";
  } else if (plafonne) {
    etat = "warn";
    verdict =
      "Plafond atteint : la pénalité s'arrête à " +
      fmtEur(due) +
      " HT (" +
      fmtPct(plafond) +
      " de la commande) depuis le " +
      joursPlafond +
      "e jour de retard. Au-delà, la clause ne compense plus le retard : regardez ce que le contrat prévoit ensuite (mise en demeure, résolution).";
  } else if (ratio != null && ratio > 200) {
    etat = "warn";
    verdict =
      "Pénalité de " +
      fmtEur(due) +
      " HT, plus du double du préjudice estimé (" +
      fmtEur(prejudice) +
      "). Si elle est manifestement excessive, le juge peut la réduire (article 1231-5 du Code civil).";
  } else if (ratio != null && ratio < 25) {
    etat = "warn";
    verdict =
      "Pénalité de " +
      fmtEur(due) +
      " HT, moins d'un quart du préjudice estimé (" +
      fmtEur(prejudice) +
      "). La clause protège peu le client : le juge peut augmenter une pénalité dérisoire, mais mieux vaut un taux juste dès le devis.";
  } else {
    etat = "ok";
    verdict =
      "Pénalité de " + fmtEur(due) + " HT pour " + fmtJours(joursPenalises) + " pénalisés, soit " + fmtPct(pctCommande) + " de la commande.";
  }

  const conseils: string[] = [];
  conseils.push(
    "Écrivez la date ou le délai dans le devis signé, avec son point de départ (signature, acompte reçu, validation des plans), et dites si les jours sont calendaires ou ouvrés.",
  );
  conseils.push(
    "Une pénalité de retard est une clause pénale : sauf inexécution définitive, elle n'est encourue qu'après mise en demeure (article 1231-5 du Code civil). Prévoyez dans la clause qu'elle court « par la seule échéance du terme », et gardez la trace écrite de la date.",
  );
  if (valide && joursPenalises != null && joursPenalises > 0 && !exonere) {
    if (plafonne) {
      conseils.push(
        "Avec ce plafond, chaque jour de retard après le " +
          joursPlafond +
          "e ne coûte plus rien au fournisseur. Côté client, prévoyez ce qui se passe ensuite : mise en demeure avec un délai, puis résolution possible (article 1226 du Code civil).",
      );
    } else if (joursPlafond != null) {
      conseils.push("Le plafond de " + fmtEur(plafondMontant) + " serait atteint au " + joursPlafond + "e jour de retard.");
    }
    if (ratio != null) {
      conseils.push(
        "La pénalité représente " +
          fmtPct(ratio) +
          " du préjudice estimé. Repères de l'outil, pas des seuils juridiques : au-dessus du double, elle se défend mal ; sous le quart, elle protège peu.",
      );
    }
  }
  if (mode !== "forfait" && assiette === "commande") {
    conseils.push(
      "Si une seule partie de la commande est en retard, une assiette « partie en retard » donne une pénalité plus proportionnée. C'est la logique du CCAG Fournitures courantes et services : la valeur de la partie en retard, ou de l'ensemble si le retard le rend inutilisable.",
    );
  }
  conseils.push(
    "Les retards causés par le client (plans validés tard, accès refusé, acompte payé en retard) ou par un cas de force majeure ne doivent pas compter : écrivez que le délai est prolongé d'autant.",
  );
  conseils.push(
    "QuoteBuilder ne calcule pas de pénalités et ne suit pas les dates de livraison : écrivez votre délai et votre clause dans le devis final, et la date convenue dans une note interne du dossier.",
  );

  const recap = [
    "Pénalités de retard de livraison (B2B)",
    "Commande : " + fmtEur(montantHT) + " HT, livraison convenue le " + fmtDate(prevue),
    "Livraison réelle : " + fmtDate(reelle) + ", soit " + (joursRetard == null ? "n/a" : fmtJours(joursRetard) + " de retard"),
    "Franchise : " + fmtJours(franchise) + ", jours pénalisés : " + (joursPenalises == null ? "n/a" : fmtNum(joursPenalises)),
    "Pénalité : " + libelleClause(mode, taux, fraction, forfait, assietteMontant) + " (" + fmtEur(parJour) + " par jour)",
    "Plafond : " + (plafondMontant == null ? "aucun" : fmtPct(plafond) + " de la commande, soit " + fmtEur(plafondMontant)),
    "Pénalité due : " + (due == null ? "n/a" : fmtEur(due) + " HT (" + fmtPct(pctCommande) + " de la commande)"),
    "Préjudice estimé : " + (prejudice > 0 ? fmtEur(prejudice) : "non renseigné"),
    "Calcul : quotebuilder.co/outils/calculateur-penalites-retard-livraison",
  ].join("\n");

  return {
    montantHT,
    assiette,
    montantRetard,
    assietteMontant,
    mode,
    franchise,
    taux,
    fraction,
    forfait,
    plafond,
    plafondMontant,
    seuil,
    prejudice,
    prevue,
    reelle,
    valide,
    ecart,
    joursRetard,
    joursPenalises,
    parJour,
    brut,
    due,
    plafonne,
    exonere,
    pctCommande,
    net,
    joursPlafond,
    ratio,
    lignes,
    etat,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: RetardInput = {}): string {
  return computeRetard(input).recap;
}
