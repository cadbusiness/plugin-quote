export type RevisionTone = "neutral" | "ok" | "warn" | "bad";

export type RevisionEtat = "sansPrix" | "ferme" | "sansPoids" | "valeurs" | "ok";

export type RevisionInput = {
  prix?: number | string | null;
  fixe?: number | string | null;
  marge?: number | string | null;
  w1?: number | string | null;
  i01?: number | string | null;
  i11?: number | string | null;
  w2?: number | string | null;
  i02?: number | string | null;
  i12?: number | string | null;
  w3?: number | string | null;
  i03?: number | string | null;
  i13?: number | string | null;
  seuil?: number | string | null;
  plafond?: number | string | null;
};

export const REVISION_PRIX_DEFAULTS = {
  prix: 24000,
  fixe: 15,
  marge: 25,
  w1: 60,
  i01: 130,
  i11: 136.5,
  w2: 40,
  i02: 110,
  i12: 107.8,
  w3: 0,
  i03: 100,
  i13: 100,
  seuil: 1,
  plafond: 0,
} as const;

export type RevisionIndice = {
  k: number;
  w: number;
  i0: number;
  i1: number;
  used: boolean;
  valide: boolean;
  ratio: number | null;
  variation: number | null;
  poidsPrix: number;
  effet: number | null;
};

export type RevisionVerdict = {
  tone: RevisionTone;
  text: string;
};

export type RevisionResult = {
  prix: number;
  fixe: number;
  variable: number;
  marge: number;
  seuil: number;
  plafond: number;
  indices: RevisionIndice[];
  wSum: number;
  poidsOk: boolean;
  etat: RevisionEtat;
  S: number | null;
  indVar: number | null;
  coefBrut: number | null;
  varBrute: number | null;
  coefApplique: number | null;
  dansSeuil: boolean;
  plafonne: boolean;
  prixRevise: number | null;
  ecart: number | null;
  nonRepercute: number | null;
  prixSansFixe: number | null;
  ecartPoids: number | null;
  cout0: number | null;
  cout1: number | null;
  margeFerme: number | null;
  margeClause: number | null;
  top: number | null;
  verdict: RevisionVerdict;
  conseils: string[];
  recap: string;
};

const NB = "\u00a0";

function num(v: number | string | null | undefined, min: number, max: number | null, fallback: number) {
  const parsed = v === "" || v == null ? NaN : Number(v);
  let n = Number.isFinite(parsed) ? parsed : fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number) {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
}

export function fmtEur(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  let neg = n < 0;
  const a = Math.abs(n);
  let txt: string;
  if (Math.round(a * 100) % 100 !== 0) {
    const c = Math.round(a * 100);
    txt = groupe(Math.floor(c / 100)) + "," + String(c % 100).padStart(2, "0");
  } else {
    txt = groupe(Math.round(a));
  }
  if (txt === "0") neg = false;
  return (neg ? "-" : "") + txt + NB + "€";
}

export function fmtEurSigne(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const t = fmtEur(n);
  if (t.charAt(0) === "-" || t === "0" + NB + "€") return t;
  return "+" + t;
}

function fmtDec(n: number | null, maxDec: number) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const f = 10 ** maxDec;
  let neg = n < 0;
  const d = Math.round(Math.abs(n) * f);
  const ent = Math.floor(d / f);
  const dec = d % f;
  if (d === 0) neg = false;
  const decTxt = dec ? String(dec).padStart(maxDec, "0").replace(/0+$/, "") : "";
  return (neg ? "-" : "") + groupe(ent) + (decTxt ? "," + decTxt : "");
}

export function fmtNum(n: number | null) {
  return fmtDec(n, 1);
}

export function fmtIdx(n: number | null) {
  return fmtDec(n, 4);
}

export function fmtCoef(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const d = Math.round(n * 10000);
  return Math.floor(d / 10000) + "," + String(d % 10000).padStart(4, "0");
}

export function fmtVar(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const t = fmtDec(n, 2);
  if (t === "0") return "0" + NB + "%";
  return (t.charAt(0) === "-" ? t : "+" + t) + NB + "%";
}

type WorkingIndice = RevisionIndice & { _ratio: number | null };

function readField(input: RevisionInput, key: string) {
  return (input as Record<string, number | string | null | undefined>)[key];
}

export function computeRevisionPrix(input: RevisionInput): RevisionResult {
  const prix = num(input.prix, 0, 1e9, 0);
  const fixe = num(input.fixe, 0, 100, 0);
  const marge = num(input.marge, 0, 100, 0);
  const seuil = num(input.seuil, 0, 100, 0);
  const plafond = num(input.plafond, 0, 100, 0);
  const variable = 100 - fixe;

  const indices: WorkingIndice[] = [1, 2, 3].map((k) => {
    const w = num(readField(input, "w" + k), 0, 100, 0);
    const i0 = num(readField(input, "i0" + k), 0, 100000, 0);
    const i1 = num(readField(input, "i1" + k), 0, 100000, 0);
    const used = w > 0;
    const valide = used && i0 > 0 && i1 > 0;
    const ratio = valide ? i1 / i0 : null;
    return {
      k,
      w,
      i0,
      i1,
      used,
      valide,
      ratio: ratio === null ? null : r6(ratio),
      variation: ratio === null ? null : r6((ratio - 1) * 100),
      poidsPrix: r6((variable * w) / 100),
      effet: null,
      _ratio: ratio,
    };
  });

  const wSum = r6(indices.reduce((s, x) => s + x.w, 0));
  const used = indices.filter((x) => x.used);
  const invalide = used.some((x) => !x.valide);
  const poidsOk = Math.abs(wSum - 100) < 1e-9;

  let etat: RevisionEtat;
  if (prix === 0) etat = "sansPrix";
  else if (fixe === 100) etat = "ferme";
  else if (wSum === 0) etat = "sansPoids";
  else if (invalide) etat = "valeurs";
  else etat = "ok";

  const calc = etat === "ok";
  let S: number | null = null;
  let indVar: number | null = null;
  let coefBrut: number | null = null;
  let varBrute: number | null = null;
  let coefApplique: number | null = null;
  let dansSeuil = false;
  let plafonne = false;
  let prixRevise: number | null = null;
  let ecart: number | null = null;
  let nonRepercute: number | null = null;
  let prixSansFixe: number | null = null;
  let ecartPoids: number | null = null;
  let cout0: number | null = null;
  let cout1: number | null = null;
  let margeFerme: number | null = null;
  let margeClause: number | null = null;
  let top: WorkingIndice | null = null;

  if (etat === "ferme") {
    coefBrut = 1;
    coefApplique = 1;
    varBrute = 0;
    prixRevise = prix;
    ecart = 0;
    nonRepercute = 0;
  }

  if (calc) {
    S = used.reduce((s, x) => s + (x.w / 100) * (x._ratio ?? 0), 0);
    const moyenne = used.reduce((s, x) => s + x.w * (x._ratio ?? 0), 0) / wSum;
    indVar = r6((moyenne - 1) * 100);
    coefBrut = fixe / 100 + (variable / 100) * S;
    varBrute = r6((coefBrut - 1) * 100);
    for (const x of used) {
      x.effet = r6(prix * (variable / 100) * (x.w / 100) * ((x._ratio ?? 0) - 1));
    }
    ecartPoids = poidsOk ? 0 : r6(prix * (variable / 100) * (wSum / 100 - 1));
    if (seuil > 0 && Math.abs(varBrute) < seuil - 1e-9) {
      dansSeuil = true;
      coefApplique = 1;
    } else if (plafond > 0 && Math.abs(varBrute) > plafond + 1e-9) {
      plafonne = true;
      coefApplique = 1 + (varBrute > 0 ? 1 : -1) * (plafond / 100);
    } else {
      coefApplique = coefBrut;
    }
    prixRevise = r6(prix * coefApplique);
    ecart = r6(prixRevise - prix);
    nonRepercute = r6(prix * (coefBrut - coefApplique));
    prixSansFixe = r6(prix * moyenne);
    cout0 = prix * (1 - marge / 100);
    cout1 = cout0 * moyenne;
    margeFerme = r6(((prix - cout1) / prix) * 100);
    margeClause = prixRevise > 0 ? r6(((prixRevise - cout1) / prixRevise) * 100) : null;
    cout0 = r6(cout0);
    cout1 = r6(cout1);
    for (const x of used) {
      if (top === null || Math.abs(x.effet ?? 0) > Math.abs(top.effet ?? 0) + 1e-9) top = x;
    }
    if (top && Math.abs(top.effet ?? 0) < 1e-9) top = null;
    coefBrut = r6(coefBrut);
    coefApplique = r6(coefApplique);
    S = r6(S);
  }

  let verdict: RevisionVerdict;
  if (etat === "sansPrix") {
    verdict = { tone: "neutral", text: "Saisissez le prix initial HT du devis pour lancer le calcul." };
  } else if (etat === "ferme") {
    verdict = {
      tone: "neutral",
      text: "Avec une partie fixe de 100" + NB + "%, rien ne suit les indices : c'est un prix ferme.",
    };
  } else if (etat === "sansPoids") {
    verdict = { tone: "neutral", text: "Saisissez le poids d'au moins un indice dans la partie variable." };
  } else if (etat === "valeurs") {
    verdict = {
      tone: "neutral",
      text: "Saisissez les valeurs de départ et d'arrivée de chaque indice utilisé, supérieures à 0.",
    };
  } else if (!poidsOk) {
    verdict = {
      tone: "bad",
      text:
        "Les poids des indices font " +
        fmtNum(wSum) +
        NB +
        "% de la partie variable au lieu de 100" +
        NB +
        "% : le prix changerait de " +
        fmtVar((variable * (wSum - 100)) / 100) +
        " même si aucun indice ne bougeait. Corrigez les poids avant d'écrire la clause.",
    };
  } else if (dansSeuil) {
    verdict = {
      tone: "ok",
      text:
        "Variation de " +
        fmtVar(varBrute) +
        ", sous le seuil de déclenchement de " +
        fmtNum(seuil) +
        NB +
        "% : le prix reste à " +
        fmtEur(prix) +
        " HT.",
    };
  } else if (plafonne) {
    verdict = {
      tone: "warn",
      text:
        "La variation calculée (" +
        fmtVar(varBrute) +
        ") dépasse le plafond de " +
        fmtNum(plafond) +
        NB +
        "% : le prix révisé est limité à " +
        fmtEur(prixRevise) +
        " HT et " +
        fmtEur(Math.abs(nonRepercute ?? 0)) +
        " ne sont pas répercutés. Prévoyez dans la clause ce qui se passe quand le plafond est atteint.",
    };
  } else {
    verdict = {
      tone: "ok",
      text:
        "Prix révisé : " +
        fmtEur(prixRevise) +
        " HT (" +
        fmtVar(varBrute) +
        "). Les poids font bien 100" +
        NB +
        "% de la partie variable.",
    };
  }

  const conseils: string[] = [];
  if (calc) {
    if (top) {
      conseils.push(
        "L'indice " +
          top.k +
          " pèse le plus dans la variation : " +
          fmtEurSigne(top.effet) +
          " sur le prix. C'est lui qu'il faut choisir avec le plus de soin.",
      );
    }
    if (fixe > 0 && poidsOk && Math.abs((prixSansFixe ?? 0) - (prixRevise ?? 0)) > 0.005 && !dansSeuil && !plafonne) {
      conseils.push(
        "La partie fixe de " +
          fmtNum(fixe) +
          NB +
          "% ne suit pas les indices : sans elle, le prix révisé serait de " +
          fmtEur(prixSansFixe) +
          " HT.",
      );
    }
    const baisse = used.find((x) => (x._ratio ?? 0) < 1 - 1e-12);
    if (baisse) {
      conseils.push(
        "La clause joue aussi à la baisse : l'indice " +
          baisse.k +
          " recule de " +
          fmtDec(Math.abs(baisse.variation ?? 0), 2) +
          NB +
          "% et retire " +
          fmtEur(Math.abs(baisse.effet ?? 0)) +
          " au prix.",
      );
    }
    if (marge > 0 && margeFerme !== null && margeClause !== null) {
      conseils.push(
        "Si vos coûts suivent ces indices, votre marge de " +
          fmtNum(marge) +
          NB +
          "% passerait à " +
          fmtNum(margeFerme) +
          NB +
          "% en prix ferme, et à " +
          fmtNum(margeClause) +
          NB +
          "% avec la clause.",
      );
    }
  }
  conseils.push(
    "Utilisez les valeurs définitives des indices, aux mois prévus par la clause. Un index BT ou TP paraît plusieurs semaines après le mois concerné : celui d'août 2026 est paru le 15 octobre 2026.",
  );
  conseils.push(
    "Dans QuoteBuilder, la fourchette affichée vient de votre catalogue et de vos règles, et elle est enregistrée à l'envoi de chaque demande. Mettez à jour vous-même les prix et les fourchettes de règles ; la clause s'écrit dans votre devis.",
  );

  function ligneIndice(x: WorkingIndice) {
    const t = "Indice " + x.k + " : ";
    if (!x.used) return t + "non utilisé.";
    if (!x.valide) return t + "poids " + fmtNum(x.w) + NB + "%, valeurs à compléter.";
    return (
      t +
      "poids " +
      fmtNum(x.w) +
      NB +
      "%, de " +
      fmtIdx(x.i0) +
      " à " +
      fmtIdx(x.i1) +
      " (" +
      fmtVar(x.variation) +
      ")."
    );
  }

  let lignePrix: string;
  if (prixRevise === null) lignePrix = "Prix révisé : n/a.";
  else if (dansSeuil) lignePrix = "Prix révisé : " + fmtEur(prixRevise) + " HT, inchangé (variation sous le seuil).";
  else if (plafonne) {
    lignePrix =
      "Prix révisé : " +
      fmtEur(prixRevise) +
      " HT (" +
      fmtEurSigne(ecart) +
      "), limité par le plafond ; " +
      fmtEur(Math.abs(nonRepercute ?? 0)) +
      " non répercutés.";
  } else lignePrix = "Prix révisé : " + fmtEur(prixRevise) + " HT (" + fmtEurSigne(ecart) + ").";

  const recap = [
    "Prix initial : " +
      fmtEur(prix) +
      " HT, partie fixe " +
      fmtNum(fixe) +
      NB +
      "%, partie variable " +
      fmtNum(variable) +
      NB +
      "%.",
    ligneIndice(indices[0] as WorkingIndice),
    ligneIndice(indices[1] as WorkingIndice),
    ligneIndice(indices[2] as WorkingIndice),
    "Coefficient : " +
      (coefBrut === null ? "n/a" : fmtCoef(coefBrut) + " (" + fmtVar(varBrute) + ")") +
      ", seuil de déclenchement " +
      (seuil > 0 ? fmtNum(seuil) + NB + "%" : "aucun") +
      ", plafond " +
      (plafond > 0 ? fmtNum(plafond) + NB + "%" : "aucun") +
      ".",
    lignePrix,
    "Marge si les coûts suivent les indices : " +
      (margeFerme === null
        ? "n/a."
        : fmtNum(marge) +
          NB +
          "% au départ, " +
          fmtNum(margeFerme) +
          NB +
          "% en prix ferme, " +
          fmtNum(margeClause) +
          NB +
          "% avec la clause."),
    "Calcul : quotebuilder.co/outils/calculateur-revision-prix-devis",
  ].join("\n");

  return {
    prix,
    fixe,
    variable,
    marge,
    seuil,
    plafond,
    indices: indices.map((indice) => ({
      k: indice.k,
      w: indice.w,
      i0: indice.i0,
      i1: indice.i1,
      used: indice.used,
      valide: indice.valide,
      ratio: indice.ratio,
      variation: indice.variation,
      poidsPrix: indice.poidsPrix,
      effet: indice.effet,
    })),
    wSum,
    poidsOk,
    etat,
    S,
    indVar,
    coefBrut,
    varBrute,
    coefApplique,
    dansSeuil,
    plafonne,
    prixRevise,
    ecart,
    nonRepercute,
    prixSansFixe,
    ecartPoids,
    cout0,
    cout1,
    margeFerme,
    margeClause,
    top: top ? top.k : null,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: RevisionInput) {
  return computeRevisionPrix(input).recap;
}
