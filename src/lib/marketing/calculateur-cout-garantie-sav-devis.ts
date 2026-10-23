export const DUREES_TABLE = [6, 12, 24, 36, 60] as const;

export const SEUILS_MARGE = { ok: 5, warn: 15 } as const;

export const DEFAULTS = {
  prix: 12000,
  marge: 30,
  duree: 24,
  taux: 8,
  parDossier: 1.5,
  heures: 3,
  tauxHoraire: 55,
  deplacement: 60,
  pieces: 150,
  couvrePieces: true,
  couvreMO: true,
  couvreDeplacement: true,
} as const;

export type GarantieTone = "ok" | "warn" | "bad" | "neutral";

export type Couverture = {
  couvrePieces: boolean;
  couvreMO: boolean;
  couvreDeplacement: boolean;
};

export type GarantieInput = {
  prix?: unknown;
  marge?: unknown;
  duree?: unknown;
  taux?: unknown;
  parDossier?: unknown;
  heures?: unknown;
  tauxHoraire?: unknown;
  deplacement?: unknown;
  pieces?: unknown;
  couvrePieces?: unknown;
  couvreMO?: unknown;
  couvreDeplacement?: unknown;
};

export type GarantieLigne = {
  mois: number;
  provision: number;
  partPrix: number;
  partMarge: number | null;
  courant: boolean;
};

export type GarantieResult = {
  prix: number;
  marge: number;
  duree: number;
  taux: number;
  parDossier: number;
  heures: number;
  tauxHoraire: number;
  deplacement: number;
  pieces: number;
  couverture: Couverture;
  valide: boolean;
  coutIntervention: number;
  attendues: number;
  provision: number;
  margeEur: number | null;
  partPrix: number | null;
  partMarge: number | null;
  coutAnnee: number;
  prixAnnee: number | null;
  lignes: GarantieLigne[];
  etat: GarantieTone;
  verdict: string;
  conseils: string[];
  ligne: string;
  recap: string;
};

function num(v: unknown, min: number, max: number | null, fallback: number): number {
  let n = v === "" || v == null ? Number.NaN : Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function bool(v: unknown, fallback: boolean): boolean {
  return v == null ? fallback : v === true || v === "true" || v === "on" || v === 1;
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

export function fmtMois(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtNum(n) + " mois";
}

export function couvertureTexte(c: Couverture): string {
  const parts: string[] = [];
  if (c.couvrePieces) parts.push("pièces");
  if (c.couvreMO) parts.push("main-d'œuvre");
  if (c.couvreDeplacement) parts.push("déplacement");
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0] ?? "";
  return parts.slice(0, -1).join(", ") + " et " + parts[parts.length - 1];
}

export function ligneGarantie(duree: number, c: Couverture): string {
  const couv = couvertureTexte(c);
  if (!(duree > 0) || !couv) {
    return "Garantie contractuelle : néant. Les garanties légales restent applicables, dont la garantie des vices cachés (articles 1641 et suivants du Code civil).";
  }
  return (
    "Garantie contractuelle : " +
    fmtMois(duree) +
    " à compter de la mise en service, " +
    couv +
    ". Exclusions : usure normale, consommables, utilisation non conforme à la notice, défaut d'entretien. Cette garantie s'ajoute à la garantie légale des vices cachés (articles 1641 et suivants du Code civil)."
  );
}

export function provisionPour(mois: number, coutIntervention: number, taux: number, parDossier: number): number {
  return r2(coutIntervention * (taux / 100) * (mois / 12) * parDossier);
}

export function computeGarantie(input?: GarantieInput): GarantieResult {
  const o = input ?? {};
  const prix = num(o.prix, 0, null, 0);
  const marge = num(o.marge, 0, 95, 0);
  const duree = Math.round(num(o.duree, 0, 120, 0));
  const taux = num(o.taux, 0, 100, 0);
  const parDossier = num(o.parDossier, 0, 20, 0);
  const heures = num(o.heures, 0, 100, 0);
  const tauxHoraire = num(o.tauxHoraire, 0, 1000, 0);
  const deplacement = num(o.deplacement, 0, 10000, 0);
  const pieces = num(o.pieces, 0, 1000000, 0);
  const couverture: Couverture = {
    couvrePieces: bool(o.couvrePieces, true),
    couvreMO: bool(o.couvreMO, true),
    couvreDeplacement: bool(o.couvreDeplacement, true),
  };

  const coutIntervention = r2(
    (couverture.couvreMO ? heures * tauxHoraire : 0) +
      (couverture.couvreDeplacement ? deplacement : 0) +
      (couverture.couvrePieces ? pieces : 0),
  );
  const attendues = r6((taux / 100) * (duree / 12) * parDossier);
  const provision = provisionPour(duree, coutIntervention, taux, parDossier);
  const valide = prix > 0;
  const margeEur = valide ? r2((prix * marge) / 100) : null;
  const partPrix = valide ? r6((provision / prix) * 100) : null;
  const partMarge = valide && margeEur != null && margeEur > 0 ? r6((provision / margeEur) * 100) : null;
  const coutAnnee = provisionPour(12, coutIntervention, taux, parDossier);
  const prixAnnee = marge < 100 ? r2(coutAnnee / (1 - marge / 100)) : null;

  const lignes: GarantieLigne[] = [];
  if (valide) {
    const durees: number[] = [...DUREES_TABLE];
    if (duree > 0 && !durees.includes(duree)) durees.push(duree);
    durees.sort((a, b) => a - b);
    for (const mois of durees) {
      const p = provisionPour(mois, coutIntervention, taux, parDossier);
      lignes.push({
        mois,
        provision: p,
        partPrix: r6((p / prix) * 100),
        partMarge: margeEur != null && margeEur > 0 ? r6((p / margeEur) * 100) : null,
        courant: mois === duree,
      });
    }
  }

  let etat: GarantieTone;
  let verdict: string;
  if (!valide) {
    etat = "neutral";
    verdict = "Renseignez le prix de vente.";
  } else if (duree === 0 || !couvertureTexte(couverture)) {
    etat = "neutral";
    verdict = "Pas de garantie contractuelle : rien à provisionner pour elle. Les garanties légales, elles, restent dues.";
  } else if (provision === 0) {
    etat = "neutral";
    verdict =
      "Avec un taux d'intervention ou un coût d'intervention à zéro, la provision est nulle. Vérifiez vos chiffres avec votre historique.";
  } else if (partMarge == null) {
    etat = "warn";
    verdict = "Sans marge, chaque euro de garantie est une perte : " + fmtEur(provision) + " par vente.";
  } else if (partMarge < SEUILS_MARGE.ok) {
    etat = "ok";
    verdict =
      "La garantie coûte " + fmtEur(provision) + " par vente, " + fmtPct(partMarge) + " de votre marge. Elle tient dans le prix.";
  } else if (partMarge <= SEUILS_MARGE.warn) {
    etat = "warn";
    verdict =
      "La garantie coûte " +
      fmtEur(provision) +
      " par vente, " +
      fmtPct(partMarge) +
      " de votre marge. Intégrez-la au prix, ou vendez une partie de la durée en extension.";
  } else {
    etat = "bad";
    verdict =
      "La garantie coûte " +
      fmtEur(provision) +
      " par vente, " +
      fmtPct(partMarge) +
      " de votre marge. Raccourcissez la durée incluse, réduisez la couverture ou vendez l'extension à part.";
  }

  const conseils: string[] = [];
  if (valide && provision > 0) {
    conseils.push(
      "Sur 100 ventes, attendez-vous à environ " +
        fmtNum(r2(attendues * 100)) +
        " interventions pendant la garantie, pour un coût total de " +
        fmtEur(r2(provision * 100)) +
        ".",
    );
    if (!couverture.couvreDeplacement && deplacement > 0) {
      conseils.push("Le déplacement n'est pas couvert : écrivez dans le devis qu'il est facturé, et à quel prix.");
    }
  }
  conseils.push(
    "Repères de l'outil, pas des normes : moins de " +
      SEUILS_MARGE.ok +
      " % de la marge, la garantie tient dans le prix ; au-delà de " +
      SEUILS_MARGE.warn +
      " %, elle mérite d'être réduite ou vendue à part.",
  );
  conseils.push(
    "Le taux le plus fiable est le vôtre : interventions sous garantie de l'an dernier divisées par le nombre d'équipements sous garantie.",
  );
  conseils.push(
    "La garantie contractuelle ne remplace pas la garantie des vices cachés, qui joue aussi entre professionnels et n'est pas comptée ici.",
  );
  conseils.push(
    "QuoteBuilder ne gère pas le SAV. Vous pouvez mettre vos conditions de garantie en lien sur la fiche produit (document « Garantie ») et créer l'extension comme un produit avec son prix.",
  );

  const ligne = ligneGarantie(duree, couverture);
  const couv = couvertureTexte(couverture) || "rien de couvert";
  const recap = [
    "Coût de garantie et de SAV (devis B2B)",
    "Prix de vente : " + fmtEur(prix) + " HT, marge brute " + fmtPct(marge) + " (" + fmtEur(margeEur) + ")",
    "Garantie : " + fmtMois(duree) + ", " + couv,
    "Coût couvert par intervention : " + fmtEur(coutIntervention),
    "Interventions attendues par vente : " + fmtNum(attendues) + " (" + fmtPct(taux) + " par an, " + fmtNum(parDossier) + " par dossier)",
    "Provision par vente : " + fmtEur(provision) + ", soit " + fmtPct(partPrix) + " du prix",
    "Part de la marge : " + fmtPct(partMarge),
    "Année supplémentaire : coût " + fmtEur(coutAnnee) + ", prix à " + fmtPct(marge) + " de marge " + fmtEur(prixAnnee),
    "Calcul : quotebuilder.co/outils/calculateur-cout-garantie-sav-devis",
  ].join("\n");

  return {
    prix,
    marge,
    duree,
    taux,
    parDossier,
    heures,
    tauxHoraire,
    deplacement,
    pieces,
    couverture,
    valide,
    coutIntervention,
    attendues,
    provision,
    margeEur,
    partPrix,
    partMarge,
    coutAnnee,
    prixAnnee,
    lignes,
    etat,
    verdict,
    conseils,
    ligne,
    recap,
  };
}

export function buildRecap(input?: GarantieInput): string {
  return computeGarantie(input).recap;
}
