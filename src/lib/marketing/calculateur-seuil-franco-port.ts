export const PARTS_TABLE = [10, 15, 20, 25, 30, 40, 50] as const;

export const ARRONDIS = [1, 10, 50, 100] as const;

export const DEFAULTS = {
  coutTransport: 45,
  tauxMarge: 35,
  partMax: 25,
  panierMoyen: 380,
  arrondi: 10,
} as const;

export type FrancoTone = "ok" | "warn" | "bad" | "neutral";

export type FrancoInput = {
  coutTransport?: unknown;
  tauxMarge?: unknown;
  partMax?: unknown;
  panierMoyen?: unknown;
  arrondi?: unknown;
};

export type FrancoLigne = {
  part: number;
  seuil: number | null;
  arrondi: number | null;
  partPrix: number;
  courant: boolean;
};

export type FrancoResult = {
  coutTransport: number;
  tauxMarge: number;
  partMax: number;
  panierMoyen: number;
  arrondi: number;
  valide: boolean;
  seuilExact: number | null;
  seuilArrondi: number | null;
  ventesPourUneLivraison: number | null;
  margePanier: number | null;
  partTransport: number | null;
  partPrix: number | null;
  margeApresPort: number | null;
  tauxMargeApresPort: number | null;
  participation: number | null;
  partAuSeuil: number | null;
  prixAuSeuil: number | null;
  lignes: FrancoLigne[];
  etat: FrancoTone;
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

export function fmtHt(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtEur(n) + " HT";
}

/** Seuil franco : montant HT de commande dont la marge, à la part acceptée, paie la livraison. */
export function seuilFranco(cout: number, marge: number, part: number): number | null {
  if (!(cout > 0) || !(marge > 0) || !(part > 0)) return null;
  return r2(cout / ((marge / 100) * (part / 100)));
}

export function arrondirSeuil(seuil: number | null, pas: number): number | null {
  if (seuil == null) return null;
  const p = pas > 0 ? pas : 1;
  return Math.ceil(r2(seuil) / p - 1e-9) * p;
}

export function mentionDevis(seuilArrondi: number | null, participation: number | null, cout: number): string {
  if (seuilArrondi == null) return "Frais de transport : à préciser dans le devis.";
  const dessous =
    participation != null && participation > 0 && participation < cout
      ? "participation aux frais de transport de " + fmtHt(participation) + " par livraison"
      : "frais de transport facturés " + fmtHt(cout) + " par livraison";
  return (
    "Franco de port à partir de " +
    fmtHt(seuilArrondi) +
    " de commande, pour une livraison en [zone à préciser]. En dessous de ce montant : " +
    dessous +
    "."
  );
}

export function computeFranco(input?: FrancoInput): FrancoResult {
  const o = input ?? {};
  const coutTransport = num(o.coutTransport, 0, 100000, 0);
  const tauxMarge = num(o.tauxMarge, 0, 100, 0);
  const partMax = num(o.partMax, 0, 100, 0);
  const panierMoyen = num(o.panierMoyen, 0, null, 0);
  let arrondi = num(o.arrondi, 1, 100, 10);
  if (!(ARRONDIS as readonly number[]).includes(arrondi)) arrondi = 10;

  const valide = coutTransport > 0 && tauxMarge > 0 && partMax > 0;
  const seuilExact = valide ? seuilFranco(coutTransport, tauxMarge, partMax) : null;
  const seuilArrondi = valide ? arrondirSeuil(seuilExact, arrondi) : null;
  const ventesPourUneLivraison = coutTransport > 0 && tauxMarge > 0 ? r2(coutTransport / (tauxMarge / 100)) : null;
  const avecPanier = valide && panierMoyen > 0;
  const margePanier = avecPanier ? r2((panierMoyen * tauxMarge) / 100) : null;
  const partTransport = avecPanier ? r6((coutTransport / ((panierMoyen * tauxMarge) / 100)) * 100) : null;
  const partPrix = avecPanier ? r6((coutTransport / panierMoyen) * 100) : null;
  const margeApresPort = avecPanier && margePanier != null ? r2(margePanier - coutTransport) : null;
  const tauxMargeApresPort = avecPanier && margeApresPort != null ? r6((margeApresPort / panierMoyen) * 100) : null;
  let participation: number | null = null;
  if (valide && seuilExact != null) {
    participation =
      avecPanier && panierMoyen < seuilExact
        ? r2(Math.max(0, coutTransport - ((panierMoyen * tauxMarge) / 100) * (partMax / 100)))
        : coutTransport;
  }
  const partAuSeuil =
    valide && seuilArrondi != null && seuilArrondi > 0
      ? r6((coutTransport / ((seuilArrondi * tauxMarge) / 100)) * 100)
      : null;
  const prixAuSeuil =
    valide && seuilArrondi != null && seuilArrondi > 0 ? r6((coutTransport / seuilArrondi) * 100) : null;

  const lignes: FrancoLigne[] = [];
  if (valide) {
    const parts: number[] = [...PARTS_TABLE];
    if (!parts.includes(partMax)) parts.push(partMax);
    parts.sort((a, b) => a - b);
    for (const p of parts) {
      const s = seuilFranco(coutTransport, tauxMarge, p);
      lignes.push({
        part: p,
        seuil: s,
        arrondi: arrondirSeuil(s, arrondi),
        partPrix: r6((tauxMarge * p) / 100),
        courant: p === partMax,
      });
    }
  }

  let etat: FrancoTone;
  let verdict: string;
  if (!(coutTransport > 0)) {
    etat = "neutral";
    verdict = "Renseignez le coût moyen d'une livraison.";
  } else if (!(tauxMarge > 0)) {
    etat = "neutral";
    verdict = "Renseignez votre marge brute : sans marge, aucun transport ne peut être offert.";
  } else if (!(partMax > 0)) {
    etat = "neutral";
    verdict = "Renseignez la part de marge que vous acceptez de consacrer au transport.";
  } else if (!avecPanier) {
    etat = "neutral";
    verdict =
      "Seuil franco à " +
      fmtHt(seuilExact) +
      ", soit " +
      fmtHt(seuilArrondi) +
      " arrondi. Renseignez votre panier moyen pour comparer.";
  } else if (partTransport != null && partTransport <= partMax) {
    etat = "ok";
    verdict =
      "Sur un panier moyen de " +
      fmtHt(panierMoyen) +
      ", la livraison prend " +
      fmtPct(partTransport) +
      " de la marge, sous votre plafond de " +
      fmtPct(partMax) +
      ". Le franco tient à ce niveau de commande.";
  } else if (partTransport != null && partTransport <= partMax * 2) {
    etat = "warn";
    verdict =
      "Sur un panier moyen de " +
      fmtHt(panierMoyen) +
      ", la livraison prend " +
      fmtPct(partTransport) +
      " de la marge, au-dessus de votre plafond de " +
      fmtPct(partMax) +
      ". Un franco à " +
      fmtHt(seuilArrondi) +
      " et une participation de " +
      fmtHt(participation) +
      " sous ce seuil vous ramènent au plafond.";
  } else {
    etat = "bad";
    verdict =
      "Sur un panier moyen de " +
      fmtHt(panierMoyen) +
      ", la livraison prend " +
      fmtPct(partTransport) +
      " de la marge, plus du double de votre plafond de " +
      fmtPct(partMax) +
      "." +
      (margePanier != null && coutTransport >= margePanier ? " Elle coûte plus que toute la marge de la commande." : "") +
      " Offrir le port à ce niveau de commande vous coûte cher.";
  }

  const conseils: string[] = [];
  if (ventesPourUneLivraison != null) {
    conseils.push(
      "À " +
        fmtPct(tauxMarge) +
        " de marge, une livraison à " +
        fmtHt(coutTransport) +
        " absorbe toute la marge de " +
        fmtHt(ventesPourUneLivraison) +
        " de ventes. Le seuil se raisonne sur la marge, pas sur le chiffre d'affaires.",
    );
  }
  if (partAuSeuil != null) {
    conseils.push(
      "Au seuil arrondi de " +
        fmtHt(seuilArrondi) +
        ", le transport représente " +
        fmtPct(prixAuSeuil) +
        " du prix et " +
        fmtPct(partAuSeuil) +
        " de la marge.",
    );
  }
  conseils.push(
    "Un coût moyen cache des écarts : si une zone, un poids ou un volume coûte nettement plus cher, prévoyez un seuil par zone ou limitez le franco à une zone écrite dans le devis.",
  );
  conseils.push(
    "Franco dit qui paie le transport, pas qui porte les risques. Précisez le lieu de livraison et le moment où les risques passent au client, ou citez l'Incoterm avec son lieu et son édition (Incoterms® 2020).",
  );
  conseils.push(
    "À la réception, les réserves sur le bon de livraison ne suffisent pas : la protestation motivée doit être notifiée au transporteur dans les trois jours, par lettre recommandée ou acte extrajudiciaire (article L133-3 du Code de commerce).",
  );
  conseils.push("QuoteBuilder ne calcule ni frais de port ni franco : écrivez le seuil et la participation dans votre devis final.");

  const mention = mentionDevis(seuilArrondi, participation, coutTransport);
  const recap = [
    "Seuil franco de port (B2B)",
    "Coût moyen d'une livraison : " + fmtHt(coutTransport),
    "Marge brute : " + fmtPct(tauxMarge) + ", part de marge consacrée au transport : " + fmtPct(partMax) + " au plus",
    "Seuil franco : " + fmtHt(seuilExact) + ", arrondi à " + fmtHt(seuilArrondi),
    "Panier moyen : " +
      (avecPanier
        ? fmtHt(panierMoyen) + ", marge " + fmtEur(margePanier) + ", transport " + fmtPct(partTransport) + " de la marge"
        : "non renseigné"),
    "Marge après transport : " +
      (avecPanier ? fmtEur(margeApresPort) + " (" + fmtPct(tauxMargeApresPort) + " du panier)" : "n/a"),
    "Participation suggérée sous le seuil : " + fmtHt(participation),
    "Mention : " + mention,
    "Calcul : quotebuilder.co/outils/calculateur-seuil-franco-port",
  ].join("\n");

  return {
    coutTransport,
    tauxMarge,
    partMax,
    panierMoyen,
    arrondi,
    valide,
    seuilExact,
    seuilArrondi,
    ventesPourUneLivraison,
    margePanier,
    partTransport,
    partPrix,
    margeApresPort,
    tauxMargeApresPort,
    participation,
    partAuSeuil,
    prixAuSeuil,
    lignes,
    etat,
    verdict,
    conseils,
    mention,
    recap,
  };
}

export function buildRecap(input?: FrancoInput): string {
  return computeFranco(input).recap;
}
