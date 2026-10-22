export const PALIERS_TABLE = [0.5, 1, 1.5, 2, 3] as const;

export const DEFAULTS = {
  montant: 24000,
  escompte: 2,
  delaiNormal: 45,
  delaiEscompte: 10,
  tauxFinancement: 6,
} as const;

export type EscompteTone = "ok" | "warn" | "bad" | "neutral";

export type EscompteInput = {
  montant?: unknown;
  escompte?: unknown;
  delaiNormal?: unknown;
  delaiEscompte?: unknown;
  tauxFinancement?: unknown;
};

export type EscompteLigne = {
  escompte: number;
  montant: number;
  simple: number | null;
  compose: number | null;
  courant: boolean;
};

export type EscompteResult = {
  montant: number;
  escompte: number;
  delaiNormal: number;
  delaiEscompte: number;
  tauxFinancement: number;
  jours: number;
  valide: boolean;
  montantEscompte: number | null;
  net: number | null;
  tauxSimple: number | null;
  tauxCompose: number | null;
  coutFinancement: number | null;
  ecart: number | null;
  escompteMax: number | null;
  lignes: EscompteLigne[];
  etat: EscompteTone;
  verdict: string;
  conseils: string[];
  mention: string;
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

/** Taux annuel équivalent, en %, d'un escompte e (en %) pour j jours d'avance. */
export function tauxAnnuelSimple(e: number, j: number): number | null {
  if (!(j > 0) || !(e > 0) || e >= 100) return null;
  const f = e / 100;
  return r6((f / (1 - f)) * (365 / j) * 100);
}

export function tauxAnnuelCompose(e: number, j: number): number | null {
  if (!(j > 0) || !(e > 0) || e >= 100) return null;
  const f = e / 100;
  return r6((Math.pow(1 / (1 - f), 365 / j) - 1) * 100);
}

/** Escompte maximum (en %) dont le taux simple égale le taux de financement r (en %). */
export function escompteMaximum(r: number, j: number): number | null {
  if (!(j > 0)) return null;
  const x = (r / 100) * (j / 365);
  return r6((x / (1 + x)) * 100);
}

export function mentionFacture(e: number, delaiEscompte: number): string {
  if (!(e > 0)) return "Escompte pour paiement anticipé : néant.";
  const quand =
    delaiEscompte > 0
      ? "sous " + fmtJours(delaiEscompte) + " à compter de la date de facture"
      : "comptant, à réception de la facture";
  return "Escompte de " + fmtPct(e) + " pour paiement " + quand + ".";
}

export function computeEscompte(input?: EscompteInput): EscompteResult {
  const o = input ?? {};
  const montant = num(o.montant, 0, null, 0);
  const escompte = num(o.escompte, 0, 50, 0);
  const delaiNormal = Math.round(num(o.delaiNormal, 0, 365, 0));
  const delaiEscompte = Math.round(num(o.delaiEscompte, 0, 365, 0));
  const tauxFinancement = num(o.tauxFinancement, 0, 100, 0);

  const jours = Math.max(0, delaiNormal - delaiEscompte);
  const valide = montant > 0;
  const montantEscompte = valide ? r2((montant * escompte) / 100) : null;
  const net = valide && montantEscompte != null ? r2(montant - montantEscompte) : null;
  const tauxSimple = tauxAnnuelSimple(escompte, jours);
  const tauxCompose = tauxAnnuelCompose(escompte, jours);
  const coutFinancement = valide && jours > 0 && net != null ? r2((net * tauxFinancement) / 100 * (jours / 365)) : null;
  const ecart = valide && coutFinancement != null && montantEscompte != null ? r2(montantEscompte - coutFinancement) : null;
  const escompteMax = escompteMaximum(tauxFinancement, jours);

  const lignes: EscompteLigne[] = [];
  if (valide && jours > 0) {
    const paliers: number[] = [...PALIERS_TABLE];
    if (escompte > 0 && !paliers.includes(escompte)) paliers.push(escompte);
    paliers.sort((a, b) => a - b);
    for (const p of paliers) {
      lignes.push({
        escompte: p,
        montant: r2((montant * p) / 100),
        simple: tauxAnnuelSimple(p, jours),
        compose: tauxAnnuelCompose(p, jours),
        courant: p === escompte,
      });
    }
  }

  let etat: EscompteTone;
  let verdict: string;
  if (!valide) {
    etat = "neutral";
    verdict = "Renseignez le montant de la facture.";
  } else if (escompte === 0) {
    etat = "neutral";
    verdict =
      "Pas d'escompte : la facture doit tout de même le dire, avec une mention du type « Escompte pour paiement anticipé : néant ».";
  } else if (jours === 0) {
    etat = "bad";
    verdict =
      "Le délai d'escompte n'est pas plus court que l'échéance normale : le client gagne " +
      fmtEur(montantEscompte) +
      " sans payer plus tôt.";
  } else if (tauxFinancement === 0) {
    etat = "neutral";
    verdict =
      "Escompte de " +
      fmtEur(montantEscompte) +
      " pour " +
      fmtJours(jours) +
      " d'avance, soit " +
      fmtPct(tauxSimple) +
      " par an. Renseignez votre taux de financement pour comparer.";
  } else if (tauxSimple != null && tauxSimple > tauxFinancement * 2) {
    etat = "bad";
    verdict =
      "Cet escompte revient à emprunter à " +
      fmtPct(tauxSimple) +
      " par an, plus du double de votre financement à " +
      fmtPct(tauxFinancement) +
      ". Il vous coûte " +
      fmtEur(montantEscompte) +
      ", contre " +
      fmtEur(coutFinancement) +
      " pour financer la même attente.";
  } else if (tauxSimple != null && tauxSimple > tauxFinancement) {
    etat = "warn";
    verdict =
      "Cet escompte revient à " +
      fmtPct(tauxSimple) +
      " par an, au-dessus de votre financement à " +
      fmtPct(tauxFinancement) +
      ". Il se justifie seulement si le risque d'impayé ou le besoin de trésorerie est réel.";
  } else {
    etat = "ok";
    verdict =
      "Cet escompte revient à " +
      fmtPct(tauxSimple) +
      " par an, sous votre financement à " +
      fmtPct(tauxFinancement) +
      " : être payé " +
      fmtJours(jours) +
      " plus tôt vous coûte moins cher que d'attendre.";
  }

  const conseils: string[] = [];
  if (valide && escompte > 0 && jours > 0) {
    conseils.push(
      "Pour le fournisseur, l'escompte est le prix payé pour encaisser " +
        fmtJours(jours) +
        " plus tôt. Pour le client, c'est le rendement de sa trésorerie s'il paie en avance : " +
        fmtPct(tauxSimple) +
        " par an ici.",
    );
    if (escompteMax != null && tauxFinancement > 0) {
      conseils.push(
        "À " +
          fmtPct(tauxFinancement) +
          " de coût de financement et " +
          fmtJours(jours) +
          " d'avance, l'escompte qui ne vous coûte rien de plus est de " +
          fmtPct(escompteMax) +
          ".",
      );
    }
  }
  conseils.push(
    "La facture entre professionnels doit indiquer les conditions d'escompte en cas de paiement anticipé (article L441-9 du Code de commerce), ou dire qu'il n'y en a pas.",
  );
  conseils.push(
    "Si le client prend l'escompte, le prix payé baisse : faites valider avec votre expert-comptable la façon de le traiter sur la facture et pour la TVA.",
  );
  conseils.push(
    "Un escompte réduit le délai de paiement, il ne garantit pas le paiement. Un acompte à la commande et une clause de réserve de propriété dans le devis signé protègent la créance.",
  );
  conseils.push(
    "QuoteBuilder ne gère ni la facturation ni les paiements : écrivez vos conditions d'escompte dans votre devis final et vos factures.",
  );

  const mention = mentionFacture(escompte, delaiEscompte);
  const recap = [
    "Escompte pour paiement anticipé (B2B)",
    "Facture : " + fmtEur(montant) + ", échéance normale à " + fmtJours(delaiNormal),
    "Escompte : " + fmtPct(escompte) + " si paiement sous " + fmtJours(delaiEscompte) + ", soit " + fmtEur(montantEscompte),
    "Montant payé avec l'escompte : " + fmtEur(net) + ", " + fmtJours(jours) + " plus tôt",
    "Taux annuel équivalent : " + fmtPct(tauxSimple) + " (simple), " + fmtPct(tauxCompose) + " (composé)",
    "Financement à " + fmtPct(tauxFinancement) + " sur la même durée : " + fmtEur(coutFinancement),
    "Escompte maximum à ce taux : " + fmtPct(escompteMax),
    "Mention : " + mention,
    "Calcul : quotebuilder.co/outils/calculateur-escompte-paiement-anticipe",
  ].join("\n");

  return {
    montant,
    escompte,
    delaiNormal,
    delaiEscompte,
    tauxFinancement,
    jours,
    valide,
    montantEscompte,
    net,
    tauxSimple,
    tauxCompose,
    coutFinancement,
    ecart,
    escompteMax,
    lignes,
    etat,
    verdict,
    conseils,
    mention,
    recap,
  };
}

export function buildRecap(input?: EscompteInput): string {
  return computeEscompte(input).recap;
}
