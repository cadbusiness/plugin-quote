export type FraisDeplacementTone = "neutral" | "ok" | "warn" | "bad";

export type FraisDeplacementInput = {
  coutKm?: number | string | null;
  vitesse?: number | string | null;
  personnes?: number | string | null;
  coutHoraire?: number | string | null;
  allers?: number | string | null;
  d1?: number | string | null;
  p1?: number | string | null;
  d2?: number | string | null;
  p2?: number | string | null;
  d3?: number | string | null;
  p3?: number | string | null;
  panier?: number | string | null;
  marge?: number | string | null;
  seuil?: number | string | null;
};

export const FRAIS_DEPLACEMENT_DEFAULTS = {
  coutKm: 0.5,
  vitesse: 60,
  personnes: 2,
  coutHoraire: 45,
  allers: 2,
  d1: 20,
  p1: 0,
  d2: 50,
  p2: 0,
  d3: 100,
  p3: 20,
  panier: 6000,
  marge: 30,
  seuil: 10,
} as const;

export type FraisDeplacementVerdict = {
  tone: FraisDeplacementTone;
  text: string;
};

export type FraisDeplacementZone = {
  zone: number;
  distance: number;
  peages: number;
  km: number;
  heures: number;
  vehicule: number;
  temps: number;
  parAR: number;
  chantier: number;
  tempsChantier: number;
  part: number | null;
  absorbe: number;
  aFacturer: number;
  forfaitAuDela: number;
  forfaitComplet: number;
  panierMin: number | null;
  tone: FraisDeplacementTone;
};

export type FraisDeplacementResult = {
  coutKm: number;
  vitesse: number;
  personnes: number;
  coutHoraire: number;
  allers: number;
  panier: number;
  marge: number;
  seuil: number;
  tempsKm: number;
  kmAR: number;
  margeChantier: number;
  partAcceptee: number;
  distanceSeuil: number | null;
  distanceTotale: number | null;
  zones: FraisDeplacementZone[];
  verdict: FraisDeplacementVerdict;
  conseils: string[];
  recap: string;
};

const NB = "\u00a0";

function num(v: number | string | null | undefined, min: number, max: number | null, fallback: number) {
  const parsed = v === "" || v == null ? Number.NaN : Number(v);
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

export function fmtEur(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  let neg = n < 0;
  const a = Math.abs(n);
  let txt: string;
  if (a < 1000 && Math.round(a * 100) % 100 !== 0) {
    const c = Math.round(a * 100);
    txt = groupe(Math.floor(c / 100)) + "," + String(c % 100).padStart(2, "0");
  } else {
    txt = groupe(Math.round(a));
  }
  if (txt === "0") neg = false;
  return (neg ? "-" : "") + txt + NB + "€";
}

export function fmtNum(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  let neg = n < 0;
  const d = Math.round(Math.abs(n) * 10);
  const ent = Math.floor(d / 10);
  const dec = d % 10;
  if (d === 0) neg = false;
  return (neg ? "-" : "") + groupe(ent) + (dec ? "," + dec : "");
}

export function fmtDuree(h: number | null | undefined) {
  if (h == null || !Number.isFinite(h)) return "n/a";
  const m = Math.round(h * 60);
  if (m < 60) return m + NB + "min";
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return hh + NB + "h" + (mm ? NB + String(mm).padStart(2, "0") : "");
}

export function ceil10(x: number) {
  return x <= 0 ? 0 : Math.ceil(x / 10 - 1e-9) * 10;
}

function pl(n: number, one: string, many: string) {
  return Math.abs(n) >= 2 ? many : one;
}

function listeZones(idx: number[]) {
  if (idx.length === 1) return "Zone " + idx[0];
  return "Zones " + idx.slice(0, -1).join(", ") + " et " + idx[idx.length - 1];
}

export function computeFraisDeplacement(input: FraisDeplacementInput = {}): FraisDeplacementResult {
  const coutKm = num(input.coutKm, 0, 10, 0);
  const vitesse = num(input.vitesse, 5, 130, 0);
  const personnes = Math.floor(num(input.personnes, 0, 20, 0));
  const coutHoraire = num(input.coutHoraire, 0, 1000, 0);
  const allers = Math.floor(num(input.allers, 0, 20, 0));
  const panier = num(input.panier, 0, null, 0);
  const marge = num(input.marge, 0, 100, 0);
  const seuil = num(input.seuil, 0, 100, 0);

  const tempsKm = r6((2 * personnes * coutHoraire) / vitesse);
  const kmAR = r6(2 * coutKm + tempsKm);
  const margeChantier = r6((panier * marge) / 100);
  const partAcceptee = r6((margeChantier * seuil) / 100);
  const parKmChantier = allers * kmAR;
  const distanceSeuil = parKmChantier > 0 && partAcceptee > 0 ? r6(partAcceptee / parKmChantier) : null;
  const distanceTotale = parKmChantier > 0 && margeChantier > 0 ? r6(margeChantier / parKmChantier) : null;

  const bornes = [
    { d: input.d1, p: input.p1 },
    { d: input.d2, p: input.p2 },
    { d: input.d3, p: input.p3 },
  ];

  const zones: FraisDeplacementZone[] = bornes.map((borne, index) => {
    const d = num(borne.d, 0, 1000, 0);
    const p = num(borne.p, 0, 10000, 0);
    const km = 2 * d;
    const heures = km / vitesse;
    const vehicule = km * coutKm;
    const temps = heures * personnes * coutHoraire;
    const parAR = vehicule + temps + p;
    const chantier = parAR * allers;
    const part = margeChantier > 0 ? r6((chantier / margeChantier) * 100) : null;
    const absorbe = Math.min(chantier, partAcceptee);
    const aFacturer = chantier - absorbe;
    const panierMin = marge > 0 && seuil > 0 ? r6(chantier / ((marge / 100) * (seuil / 100))) : null;
    let tone: FraisDeplacementTone;
    if (part === null) tone = "neutral";
    else if (part <= seuil + 1e-9) tone = "ok";
    else if (part <= 50 + 1e-9) tone = "warn";
    else tone = "bad";
    return {
      zone: index + 1,
      distance: d,
      peages: p,
      km: r6(km),
      heures: r6(heures),
      vehicule: r6(vehicule),
      temps: r6(temps),
      parAR: r6(parAR),
      chantier: r6(chantier),
      tempsChantier: r6(temps * allers),
      part,
      absorbe: r6(absorbe),
      aFacturer: r6(aFacturer),
      forfaitAuDela: ceil10(r6(aFacturer)),
      forfaitComplet: ceil10(r6(chantier)),
      panierMin,
      tone,
    };
  });

  const totalCout = zones.reduce((sum, zone) => sum + zone.chantier, 0);
  const bads = zones.filter((zone) => zone.tone === "bad");
  const warns = zones.filter((zone) => zone.tone === "warn");
  let verdict: FraisDeplacementVerdict;
  if (totalCout === 0) {
    verdict = {
      tone: "neutral",
      text: "Saisissez le coût du véhicule ou du temps d'équipe, et le nombre d'allers-retours par chantier, pour lancer le calcul.",
    };
  } else if (margeChantier === 0) {
    verdict = {
      tone: "neutral",
      text: "Saisissez le montant d'un chantier type et sa marge pour comparer le trajet à ce qu'il rapporte.",
    };
  } else if (bads.length) {
    const pmax = Math.max(...bads.map((zone) => zone.part ?? 0));
    verdict = {
      tone: "bad",
      text:
        listeZones(bads.map((zone) => zone.zone)) +
        " : le trajet coûte plus de la moitié de la marge d'un chantier type (jusqu'à " +
        fmtNum(pmax) +
        NB +
        "%). Facturez le déplacement au réel, fixez un montant minimum de commande, ou traitez cette zone comme hors secteur.",
    };
  } else if (warns.length) {
    verdict = {
      tone: "warn",
      text:
        listeZones(warns.map((zone) => zone.zone)) +
        " : le trajet dépasse " +
        fmtNum(seuil) +
        NB +
        "% de la marge d'un chantier type. Affichez un forfait de déplacement par zone, ou un montant minimum de commande.",
    };
  } else {
    verdict = {
      tone: "ok",
      text:
        "Sur ces hypothèses, le trajet reste sous " +
        fmtNum(seuil) +
        NB +
        "% de la marge d'un chantier type dans les trois zones. Vous pouvez l'inclure dans vos prix ; écrivez-le quand même sur le devis.",
    };
  }

  const conseils: string[] = [];
  if (kmAR > 0) {
    conseils.push(
      "Un kilomètre de distance en plus vous coûte " +
        fmtEur(kmAR) +
        " par aller-retour, dont " +
        fmtEur(tempsKm) +
        " de temps d'équipe.",
    );
  }
  if (distanceTotale !== null) {
    conseils.push(
      (distanceSeuil !== null
        ? "Au-delà de " +
          fmtNum(distanceSeuil) +
          NB +
          "km à l'aller, le trajet d'un chantier type dépasse " +
          fmtNum(seuil) +
          NB +
          "% de sa marge ; au-delà de "
        : "Au-delà de ") +
        fmtNum(distanceTotale) +
        NB +
        "km, il mange toute la marge (péages non compris).",
    );
  }
  const z3 = zones[2];
  if (z3 && z3.chantier > 0 && z3.tempsChantier >= 0.5 * z3.chantier) {
    conseils.push(
      "Le temps de route pèse plus que le véhicule : " +
        fmtNum((z3.tempsChantier / z3.chantier) * 100) +
        NB +
        "% du coût du déplacement en zone 3. Regrouper les chantiers d'une même zone sur une même tournée réduit d'abord ce poste.",
    );
  }
  if (!(zones[0]!.distance < zones[1]!.distance && zones[1]!.distance < zones[2]!.distance)) {
    conseils.push("Les distances des zones ne vont pas en croissant : vérifiez les bornes.");
  }
  if (z3 && z3.panierMin !== null && z3.tone !== "ok" && z3.tone !== "neutral") {
    conseils.push(
      "Pour garder le trajet sous " +
        fmtNum(seuil) +
        NB +
        "% de la marge, un chantier en zone 3 doit faire au moins " +
        fmtEur(z3.panierMin) +
        " HT.",
    );
  }
  conseils.push(
    "Dans QuoteBuilder, posez la zone en « Choix visuel » avec des noms de lieux, et créez un produit « Forfait déplacement » par zone, proposé par une règle qui combine solution et zone. Le funnel ne calcule pas de distance : c'est le prospect qui choisit sa zone.",
  );

  function ligneZone(zone: FraisDeplacementZone) {
    let text = "Zone " + zone.zone + " (jusqu'à " + fmtNum(zone.distance) + NB + "km) : " + fmtEur(zone.chantier) + " par chantier";
    if (zone.part === null) return text + ".";
    text += ", " + fmtNum(zone.part) + NB + "% de la marge, ";
    if (zone.tone === "ok") return text + "absorbé.";
    return (
      text +
      "forfait " +
      fmtEur(zone.forfaitAuDela) +
      " au-delà de la part absorbée ou " +
      fmtEur(zone.forfaitComplet) +
      " en coût complet."
    );
  }

  const recap = [
    "Trajet : véhicule " +
      fmtEur(coutKm) +
      " par km, " +
      fmtNum(personnes) +
      pl(personnes, " personne", " personnes") +
      " à " +
      fmtEur(coutHoraire) +
      " de l'heure, " +
      fmtNum(vitesse) +
      NB +
      "km/h de moyenne, " +
      fmtNum(allers) +
      pl(allers, " aller-retour", " allers-retours") +
      " par chantier.",
    "Chantier type : " +
      fmtEur(panier) +
      " HT, marge " +
      fmtNum(marge) +
      NB +
      "% (" +
      fmtEur(margeChantier) +
      "), part acceptée pour le trajet " +
      fmtNum(seuil) +
      NB +
      "% (" +
      fmtEur(partAcceptee) +
      ").",
    ligneZone(zones[0]!),
    ligneZone(zones[1]!),
    ligneZone(zones[2]!),
    "Distance où le trajet atteint " +
      fmtNum(seuil) +
      NB +
      "% de la marge : " +
      (distanceSeuil === null ? "n/a" : fmtNum(distanceSeuil) + NB + "km") +
      " ; où il la mange entière : " +
      (distanceTotale === null ? "n/a" : fmtNum(distanceTotale) + NB + "km") +
      ".",
    "Calcul : quotebuilder.co/outils/calculateur-frais-deplacement-devis",
  ].join("\n");

  return {
    coutKm,
    vitesse,
    personnes,
    coutHoraire,
    allers,
    panier,
    marge,
    seuil,
    tempsKm,
    kmAR,
    margeChantier,
    partAcceptee,
    distanceSeuil,
    distanceTotale,
    zones,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: FraisDeplacementInput = {}) {
  return computeFraisDeplacement(input).recap;
}
