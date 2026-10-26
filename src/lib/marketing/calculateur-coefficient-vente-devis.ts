export const BENEF_TABLE = [0, 3, 5, 7, 10, 12, 15];

export const MARQUE_TABLE = [10, 15, 20, 25, 30, 35, 40, 50];

export const ARRONDIS = [1, 10, 50, 100];

export const DEFAULTS = {
  achats: 4200,
  autresFrais: 300,
  heures: 32,
  tauxHoraire: 38,
  fraisGeneraux: 18,
  benefice: 7,
  prixEnvisage: 7500,
  arrondi: 10,
};

export type CoefficientTone = "ok" | "warn" | "bad" | "neutral";

export type CoefficientInput = {
  achats?: unknown;
  autresFrais?: unknown;
  heures?: unknown;
  tauxHoraire?: unknown;
  fraisGeneraux?: unknown;
  benefice?: unknown;
  prixEnvisage?: unknown;
  arrondi?: unknown;
};

export type CoefficientLigne = {
  benefice: number;
  coefficient: number | null;
  prix: number | null;
  tauxMarque: number;
  tauxMarge: number | null;
  courant: boolean;
};

export type ConversionLigne = {
  tauxMarque: number;
  tauxMarge: number | null;
  coefficient: number;
};

export type CoefficientResult = {
  achats: number;
  autresFrais: number;
  heures: number;
  tauxHoraire: number;
  fraisGeneraux: number;
  benefice: number;
  prixEnvisage: number;
  arrondi: number;
  valide: boolean;
  mainOeuvre: number;
  deboursSec: number;
  coefficient: number | null;
  prixExact: number | null;
  prixArrondi: number | null;
  fraisGenerauxEur: number | null;
  beneficeEur: number | null;
  tauxMarque: number | null;
  tauxMarge: number | null;
  margeBrute: number | null;
  plancher: number | null;
  remiseMax: number | null;
  beneficeArrondi: number | null;
  coefEnvisage: number | null;
  marqueEnvisage: number | null;
  margeEnvisage: number | null;
  fgEnvisage: number | null;
  beneficeEnvisage: number | null;
  tauxBeneficeEnvisage: number | null;
  ecartPrix: number | null;
  lignes: CoefficientLigne[];
  conversion: ConversionLigne[];
  etat: CoefficientTone;
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
  const x = Math.round(n * 100) / 100;
  return x === 0 ? 0 : x;
}

function r6(n: number): number {
  const x = Math.round(n * 1e6) / 1e6;
  return x === 0 ? 0 : x;
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

export function fmtCoef(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const d = Math.round(n * 1000);
  const ent = Math.floor(d / 1000);
  const dec = String(d % 1000).padStart(3, "0");
  return ent + "," + dec;
}

export function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtNum(n) + "\u00a0%";
}

export function fmtHt(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtEur(n) + " HT";
}

/** Coefficient de vente quand frais généraux et bénéfice sont exprimés en % du prix de vente HT. */
export function coefficientVente(fg: number, b: number): number | null {
  if (!(fg >= 0) || !(b >= 0) || fg + b >= 100) return null;
  return r6(100 / (100 - fg - b));
}

export function prixDeVente(deboursSec: number, fg: number, b: number): number | null {
  if (!(deboursSec > 0) || !(fg >= 0) || !(b >= 0) || fg + b >= 100) return null;
  return r2((deboursSec * 100) / (100 - fg - b));
}

/** Taux de marque : part du prix de vente qui n'est pas du déboursé sec. Taux de marge : la même somme rapportée au coût. */
export function margeVersMarque(tauxMarge: number): number | null {
  if (!(tauxMarge >= 0)) return null;
  return r6((tauxMarge / (100 + tauxMarge)) * 100);
}

export function marqueVersMarge(tauxMarque: number): number | null {
  if (!(tauxMarque >= 0) || tauxMarque >= 100) return null;
  return r6((tauxMarque / (100 - tauxMarque)) * 100);
}

export function arrondirPrix(prix: number | null, pas: number): number | null {
  if (prix == null) return null;
  const p = pas > 0 ? pas : 1;
  return Math.ceil(r2(prix) / p - 1e-9) * p;
}

export function computeCoefficient(input?: CoefficientInput): CoefficientResult {
  const o = input || {};
  const achats = num(o.achats, 0, 10000000, 0);
  const autresFrais = num(o.autresFrais, 0, 10000000, 0);
  const heures = num(o.heures, 0, 100000, 0);
  const tauxHoraire = num(o.tauxHoraire, 0, 10000, 0);
  const fraisGeneraux = num(o.fraisGeneraux, 0, 95, 0);
  const benefice = num(o.benefice, 0, 95, 0);
  const prixEnvisage = num(o.prixEnvisage, 0, 100000000, 0);
  let arrondi = num(o.arrondi, 1, 100, 10);
  if (!ARRONDIS.includes(arrondi)) arrondi = 10;

  const mainOeuvre = r2(heures * tauxHoraire);
  const deboursSec = r2(achats + autresFrais + mainOeuvre);
  const tauxOk = fraisGeneraux + benefice < 100;
  const valide = deboursSec > 0 && tauxOk;

  const coefficient = valide ? coefficientVente(fraisGeneraux, benefice) : null;
  const prixExact = valide ? prixDeVente(deboursSec, fraisGeneraux, benefice) : null;
  const prixArrondi = valide && prixExact != null ? arrondirPrix(prixExact, arrondi) : null;
  const fraisGenerauxEur = valide && prixExact != null ? r2((prixExact * fraisGeneraux) / 100) : null;
  const beneficeEur =
    valide && prixExact != null && fraisGenerauxEur != null
      ? r2(prixExact - deboursSec - fraisGenerauxEur)
      : null;
  const tauxMarque = valide ? r6(fraisGeneraux + benefice) : null;
  const tauxMarge = valide ? marqueVersMarge(fraisGeneraux + benefice) : null;
  const margeBrute = valide && prixExact != null ? r2(prixExact - deboursSec) : null;
  const plancher = valide ? prixDeVente(deboursSec, fraisGeneraux, 0) : null;
  const remiseMax =
    valide && plancher != null && prixArrondi != null
      ? r6(Math.max(0, (1 - plancher / prixArrondi) * 100))
      : null;
  const beneficeArrondi =
    valide && prixArrondi != null ? r2((prixArrondi * (100 - fraisGeneraux)) / 100 - deboursSec) : null;

  const avecPrix = valide && prixEnvisage > 0;
  const coefEnvisage = avecPrix ? r6(prixEnvisage / deboursSec) : null;
  const marqueEnvisage = avecPrix ? r6(((prixEnvisage - deboursSec) / prixEnvisage) * 100) : null;
  const margeEnvisage = avecPrix ? r6(((prixEnvisage - deboursSec) / deboursSec) * 100) : null;
  const fgEnvisage = avecPrix ? r2((prixEnvisage * fraisGeneraux) / 100) : null;
  const beneficeEnvisage =
    avecPrix && fgEnvisage != null ? r2(prixEnvisage - deboursSec - fgEnvisage) : null;
  const tauxBeneficeEnvisage =
    avecPrix && beneficeEnvisage != null ? r6((beneficeEnvisage / prixEnvisage) * 100) : null;
  const ecartPrix = avecPrix && prixExact != null ? r2(prixEnvisage - prixExact) : null;

  const lignes: CoefficientLigne[] = [];
  if (valide) {
    const bs = BENEF_TABLE.slice();
    if (!bs.includes(benefice)) bs.push(benefice);
    bs.sort((a, b) => a - b);
    for (const b of bs) {
      if (fraisGeneraux + b >= 100) continue;
      lignes.push({
        benefice: b,
        coefficient: coefficientVente(fraisGeneraux, b),
        prix: prixDeVente(deboursSec, fraisGeneraux, b),
        tauxMarque: r6(fraisGeneraux + b),
        tauxMarge: marqueVersMarge(fraisGeneraux + b),
        courant: b === benefice,
      });
    }
  }

  const conversion: ConversionLigne[] = MARQUE_TABLE.map((m) => ({
    tauxMarque: m,
    tauxMarge: marqueVersMarge(m),
    coefficient: r6(100 / (100 - m)),
  }));

  let etat: CoefficientTone;
  let verdict: string;
  if (!(deboursSec > 0)) {
    etat = "neutral";
    verdict = "Renseignez au moins un coût direct : achats, heures ou autres coûts.";
  } else if (!tauxOk) {
    etat = "neutral";
    verdict =
      "Frais généraux et bénéfice atteignent ou dépassent ensemble 100\u00a0% du prix de vente : aucun prix ne peut les couvrir. Vérifiez vos taux.";
  } else if (!avecPrix) {
    etat = "neutral";
    verdict =
      "Prix de vente calculé : " +
      fmtHt(prixExact) +
      ", soit " +
      fmtHt(prixArrondi) +
      " arrondi. Renseignez un prix envisagé pour le comparer.";
  } else if (prixEnvisage < deboursSec) {
    etat = "bad";
    verdict =
      "À " +
      fmtHt(prixEnvisage) +
      ", le prix ne couvre même pas le déboursé sec de " +
      fmtHt(deboursSec) +
      ". Chaque devis signé à ce prix vous coûte " +
      fmtEur(r2(deboursSec - prixEnvisage)) +
      " avant tout frais général.";
  } else if (beneficeEnvisage != null && beneficeEnvisage < 0) {
    etat = "bad";
    verdict =
      "À " +
      fmtHt(prixEnvisage) +
      ", le déboursé sec est couvert mais pas la part de frais généraux : il manque " +
      fmtEur(-beneficeEnvisage) +
      ". Le prix plancher est de " +
      fmtHt(plancher) +
      ".";
  } else if (ecartPrix != null && ecartPrix < 0) {
    etat = "warn";
    verdict =
      "À " +
      fmtHt(prixEnvisage) +
      ", le bénéfice tombe à " +
      fmtEur(beneficeEnvisage) +
      ", soit " +
      fmtPct(tauxBeneficeEnvisage) +
      " du prix, sous votre objectif de " +
      fmtPct(benefice) +
      ". Il manque " +
      fmtEur(-ecartPrix) +
      " HT de prix pour l'atteindre.";
  } else {
    etat = "ok";
    verdict =
      "À " +
      fmtHt(prixEnvisage) +
      ", le bénéfice est de " +
      fmtEur(beneficeEnvisage) +
      ", soit " +
      fmtPct(tauxBeneficeEnvisage) +
      " du prix, au niveau de votre objectif de " +
      fmtPct(benefice) +
      " ou au-dessus.";
  }

  const conseils: string[] = [];
  if (
    valide &&
    coefficient != null &&
    prixExact != null &&
    tauxMarque != null &&
    tauxMarge != null &&
    margeBrute != null &&
    plancher != null &&
    remiseMax != null
  ) {
    conseils.push(
      "Votre coefficient de " +
        fmtCoef(coefficient) +
        " correspond à un taux de marque de " +
        fmtPct(tauxMarque) +
        " et à un taux de marge de " +
        fmtPct(tauxMarge) +
        ". C'est la même somme de " +
        fmtEur(margeBrute) +
        ", rapportée au prix ou au coût.",
    );
    conseils.push(
      "Ajouter " +
        fmtPct(fraisGeneraux + benefice) +
        " au déboursé sec donnerait " +
        fmtHt(r2((deboursSec * (100 + fraisGeneraux + benefice)) / 100)) +
        " : " +
        fmtEur(r2(prixExact - (deboursSec * (100 + fraisGeneraux + benefice)) / 100)) +
        " de moins que le prix calculé, parce que vos taux sont exprimés sur le prix de vente, pas sur le coût.",
    );
    conseils.push(
      "Au prix plancher de " +
        fmtHt(plancher) +
        ", les frais généraux sont couverts et le bénéfice est nul. Depuis le prix arrondi, la remise possible avant ce plancher est de " +
        fmtPct(remiseMax) +
        ".",
    );
  } else {
    conseils.push(
      "Le coefficient se calcule dès qu'il y a un déboursé sec et que frais généraux et bénéfice restent sous 100\u00a0% du prix de vente.",
    );
    conseils.push(
      "Le taux de marque se lit sur le prix de vente, le taux de marge sur le coût : pour une même somme gagnée, le second est toujours plus élevé.",
    );
    conseils.push(
      "Le prix plancher couvre le déboursé sec et les frais généraux, sans bénéfice. En dessous, chaque devis signé creuse le résultat.",
    );
  }
  conseils.push(
    "Le coût horaire chargé n'est pas le taux horaire facturé : il se calcule sur les heures réellement productives, sans les congés, les trajets non facturés ni le temps passé sur les devis.",
  );
  conseils.push(
    "Le taux de frais généraux se recalcule chaque année sur les comptes. S'il a été fixé il y a longtemps, le coefficient peut ne plus couvrir vos frais.",
  );
  conseils.push(
    "QuoteBuilder ne stocke ni coût d'achat, ni déboursé sec, ni coefficient : un produit n'a qu'un prix fixe, une fourchette ou « Sur devis ». Le calcul se fait avant, le prix obtenu va dans le catalogue ou dans votre devis final.",
  );

  const recap = [
    "Coefficient de vente et prix de vente HT (devis B2B)",
    "Déboursé sec : " +
      fmtHt(deboursSec) +
      " (achats " +
      fmtEur(achats) +
      ", main-d'œuvre " +
      fmtEur(mainOeuvre) +
      ", autres coûts " +
      fmtEur(autresFrais) +
      ")",
    "Frais généraux : " + fmtPct(fraisGeneraux) + " du prix de vente, bénéfice visé : " + fmtPct(benefice),
    "Coefficient de vente : " + fmtCoef(coefficient),
    "Prix de vente : " + fmtHt(prixExact) + ", arrondi à " + fmtHt(prixArrondi),
    "Taux de marque : " + fmtPct(tauxMarque) + ", taux de marge : " + fmtPct(tauxMarge),
    "Prix plancher : " + fmtHt(plancher) + ", remise possible depuis le prix arrondi : " + fmtPct(remiseMax),
    "Prix envisagé : " +
      (avecPrix
        ? fmtHt(prixEnvisage) +
          ", coefficient " +
          fmtCoef(coefEnvisage) +
          ", bénéfice " +
          fmtEur(beneficeEnvisage) +
          " (" +
          fmtPct(tauxBeneficeEnvisage) +
          ")"
        : "non renseigné"),
    "Calcul : quotebuilder.co/outils/calculateur-coefficient-vente-devis",
  ].join("\n");

  return {
    achats,
    autresFrais,
    heures,
    tauxHoraire,
    fraisGeneraux,
    benefice,
    prixEnvisage,
    arrondi,
    valide,
    mainOeuvre,
    deboursSec,
    coefficient,
    prixExact,
    prixArrondi,
    fraisGenerauxEur,
    beneficeEur,
    tauxMarque,
    tauxMarge,
    margeBrute,
    plancher,
    remiseMax,
    beneficeArrondi,
    coefEnvisage,
    marqueEnvisage,
    margeEnvisage,
    fgEnvisage,
    beneficeEnvisage,
    tauxBeneficeEnvisage,
    ecartPrix,
    lignes,
    conversion,
    etat,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input?: CoefficientInput): string {
  return computeCoefficient(input).recap;
}
