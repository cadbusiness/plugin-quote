export type RoiSalonTone = "neutral" | "bad" | "warn" | "ok";

export type RoiSalonInput = {
  stand?: number | string | null;
  deplacements?: number | string | null;
  supports?: number | string | null;
  coutJour?: number | string | null;
  personnes?: number | string | null;
  jours?: number | string | null;
  contacts?: number | string | null;
  partAvant?: number | string | null;
  partApres?: number | string | null;
  tauxSignature?: number | string | null;
  panier?: number | string | null;
  marge?: number | string | null;
};

export const ROI_SALON_DEFAULTS = {
  stand: 8000,
  deplacements: 2500,
  supports: 1000,
  coutJour: 400,
  personnes: 3,
  jours: 3,
  contacts: 120,
  partAvant: 15,
  partApres: 30,
  tauxSignature: 20,
  panier: 12000,
  marge: 30,
} as const;

export type RoiSalonVerdict = {
  tone: RoiSalonTone;
  text: string;
};

export type RoiSalonScenario = {
  demandes: number;
  clients: number;
  ca: number;
  margeBrute: number;
  resultat: number;
  coutParDemande: number | null;
  coutParClient: number | null;
  roi: number | null;
};

export type RoiSalonResult = {
  stand: number;
  deplacements: number;
  supports: number;
  coutJour: number;
  personnes: number;
  jours: number;
  contacts: number;
  partAvant: number;
  partApres: number;
  tauxSignature: number;
  panier: number;
  marge: number;
  coutEquipe: number;
  coutTotal: number;
  coutParContact: number | null;
  avant: RoiSalonScenario;
  apres: RoiSalonScenario;
  ecartDemandes: number;
  ecartClients: number;
  ecartMarge: number;
  clientsEquilibre: number | null;
  demandesEquilibre: number | null;
  partEquilibre: number | null;
  verdict: RoiSalonVerdict;
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

function pl(n: number, one: string, many: string) {
  return Math.abs(n) >= 2 ? many : one;
}

function scenario(
  contacts: number,
  part: number,
  sig: number,
  panier: number,
  marge: number,
  total: number,
): RoiSalonScenario {
  const demandes = (contacts * part) / 100;
  const clients = (demandes * sig) / 100;
  const ca = clients * panier;
  const margeBrute = (ca * marge) / 100;
  const resultat = margeBrute - total;
  return {
    demandes: r6(demandes),
    clients: r6(clients),
    ca: r6(ca),
    margeBrute: r6(margeBrute),
    resultat: r6(resultat),
    coutParDemande: demandes > 0 ? r6(total / demandes) : null,
    coutParClient: clients > 0 ? r6(total / clients) : null,
    roi: total > 0 ? r6((resultat / total) * 100) : null,
  };
}

export function computeRoiSalon(input: RoiSalonInput = {}): RoiSalonResult {
  const stand = num(input.stand, 0, null, 0);
  const deplacements = num(input.deplacements, 0, null, 0);
  const supports = num(input.supports, 0, null, 0);
  const coutJour = num(input.coutJour, 0, null, 0);
  const personnes = Math.floor(num(input.personnes, 0, 50, 0));
  const jours = Math.floor(num(input.jours, 0, 15, 0));
  const contacts = Math.floor(num(input.contacts, 0, null, 0));
  const partAvant = num(input.partAvant, 0, 100, 0);
  const partApres = num(input.partApres, 0, 100, 0);
  const tauxSignature = num(input.tauxSignature, 0, 100, 0);
  const panier = num(input.panier, 0, null, 0);
  const marge = num(input.marge, 0, 100, 0);

  const coutEquipe = r6(personnes * jours * coutJour);
  const coutTotal = r6(stand + deplacements + supports + coutEquipe);
  const coutParContact = contacts > 0 ? r6(coutTotal / contacts) : null;
  const avant = scenario(contacts, partAvant, tauxSignature, panier, marge, coutTotal);
  const apres = scenario(contacts, partApres, tauxSignature, panier, marge, coutTotal);
  const ecartDemandes = r6(apres.demandes - avant.demandes);
  const ecartClients = r6(apres.clients - avant.clients);
  const ecartMarge = r6(apres.margeBrute - avant.margeBrute);

  const margeParClient = (panier * marge) / 100;
  const clientsEquilibre = margeParClient > 0 ? r6(coutTotal / margeParClient) : null;
  const demandesEquilibre =
    clientsEquilibre !== null && tauxSignature > 0 ? r6(clientsEquilibre / (tauxSignature / 100)) : null;
  let partEquilibre: number | null = null;
  if (demandesEquilibre !== null && contacts > 0) {
    const x = (demandesEquilibre / contacts) * 100;
    if (x <= 100 + 1e-9) partEquilibre = r6(Math.min(100, x));
  }

  let verdict: RoiSalonVerdict;
  if (coutTotal === 0) {
    verdict = { tone: "neutral", text: "Saisissez les coûts du salon pour lancer le calcul." };
  } else if (contacts === 0) {
    verdict = { tone: "neutral", text: "Saisissez le nombre de contacts recueillis sur le salon." };
  } else if (apres.roi != null && apres.roi >= 20) {
    verdict = {
      tone: "ok",
      text:
        "Sur ces hypothèses, le salon rapporte " +
        fmtEur(apres.resultat) +
        " de marge au-delà de ses coûts (ROI " +
        fmtNum(apres.roi) +
        NB +
        "%), à condition que " +
        fmtNum(partApres) +
        NB +
        "% des contacts deviennent une demande de devis.",
    };
  } else if (apres.roi != null && apres.roi >= 0) {
    verdict = {
      tone: "warn",
      text:
        "Le salon couvre ses coûts de justesse (ROI " +
        fmtNum(apres.roi) +
        NB +
        "%). Le levier principal : la part des contacts qui deviennent une vraie demande de devis.",
    };
  } else {
    verdict = {
      tone: "bad",
      text:
        "Sur ces hypothèses, le salon coûte plus qu'il ne rapporte (" +
        fmtEur(apres.resultat) +
        "). Avant de réserver, revoyez le stand, la marge ou la part des contacts transformés en demande.",
    };
  }

  const conseils: string[] = [];
  if (contacts > 0 && partApres < partAvant) {
    conseils.push(
      "Vous visez une part de demandes plus basse qu'aujourd'hui. Vérifiez les deux taux : prendre la demande sur le stand sert justement à en perdre moins.",
    );
  }
  if (partApres > 60) {
    conseils.push(
      "Plus de 60 % des contacts transformés en demande : hypothèse forte. Beaucoup de visiteurs passent sur un stand sans projet en cours.",
    );
  }
  if (coutTotal > 0 && coutEquipe >= 0.4 * coutTotal) {
    conseils.push(
      "Le temps de l'équipe représente " +
        fmtNum((coutEquipe / coutTotal) * 100) +
        NB +
        "% du coût du salon. Chaque journée sur le stand doit produire des demandes, pas seulement des badges.",
    );
  }
  if (coutParContact !== null && coutTotal > 0) {
    conseils.push(
      "Chaque contact vous coûte " +
        fmtEur(coutParContact) +
        " avant toute relance. Un contact jamais rappelé, c'est cette somme perdue.",
    );
  }
  if (coutTotal > 0 && contacts > 0) {
    if (clientsEquilibre === null) {
      conseils.push("Sans panier ni marge, aucun nombre de clients ne rembourse le salon.");
    } else if (partEquilibre === null) {
      conseils.push(
        "Pour rembourser le salon, il faut " +
          fmtNum(clientsEquilibre) +
          pl(clientsEquilibre, " client", " clients") +
          ". Même si tous les contacts devenaient une demande, le compte n'y serait pas avec ce taux de signature.",
      );
    } else {
      conseils.push(
        "Seuil de rentabilité : " +
          fmtNum(clientsEquilibre) +
          pl(clientsEquilibre, " client", " clients") +
          ", soit " +
          fmtNum(demandesEquilibre) +
          pl(demandesEquilibre ?? 0, " demande", " demandes") +
          " de devis, soit " +
          fmtNum(partEquilibre) +
          NB +
          "% des contacts transformés en demande.",
      );
    }
  }
  conseils.push(
    "Dans QuoteBuilder, taguez le lien du QR code avec utm_source=salon et utm_campaign au nom du salon : les demandes du stand gardent leur source. Les coûts d'un salon ne remontent pas dans les statistiques, d'où ce calcul à part.",
  );

  let seuilTxt: string;
  if (clientsEquilibre === null) {
    seuilTxt = "aucun nombre de clients ne rembourse le salon sur ces hypothèses.";
  } else if (partEquilibre === null) {
    seuilTxt =
      fmtNum(clientsEquilibre) +
      pl(clientsEquilibre, " client", " clients") +
      ", hors de portée avec ce nombre de contacts.";
  } else {
    seuilTxt =
      fmtNum(clientsEquilibre) +
      pl(clientsEquilibre, " client", " clients") +
      ", soit " +
      fmtNum(demandesEquilibre) +
      pl(demandesEquilibre ?? 0, " demande", " demandes") +
      " ou " +
      fmtNum(partEquilibre) +
      NB +
      "% des contacts.";
  }

  function ligne(nom: string, part: number, s: RoiSalonScenario) {
    return (
      nom +
      " : " +
      fmtNum(part) +
      NB +
      "% des contacts en demande, " +
      fmtNum(s.demandes) +
      pl(s.demandes, " demande", " demandes") +
      ", " +
      fmtNum(s.clients) +
      pl(s.clients, " client", " clients") +
      ", marge " +
      fmtEur(s.margeBrute) +
      ", résultat " +
      fmtEur(s.resultat) +
      " (ROI " +
      (s.roi === null ? "n/a" : fmtNum(s.roi) + NB + "%") +
      ")."
    );
  }

  const recap = [
    "Coûts : stand " +
      fmtEur(stand) +
      ", déplacements " +
      fmtEur(deplacements) +
      ", supports " +
      fmtEur(supports) +
      ", équipe " +
      fmtNum(personnes) +
      pl(personnes, " personne", " personnes") +
      " × " +
      fmtNum(jours) +
      pl(jours, " jour", " jours") +
      " à " +
      fmtEur(coutJour) +
      " (" +
      fmtEur(coutEquipe) +
      "), total " +
      fmtEur(coutTotal) +
      ".",
    "Hypothèses : " +
      fmtNum(contacts) +
      pl(contacts, " contact", " contacts") +
      " (" +
      fmtEur(coutParContact) +
      " par contact), " +
      fmtNum(tauxSignature) +
      NB +
      "% des demandes signées, commande moyenne " +
      fmtEur(panier) +
      ", marge " +
      fmtNum(marge) +
      NB +
      "%.",
    ligne("Aujourd'hui", partAvant, avant),
    ligne("Demande prise sur le stand", partApres, apres),
    "Coût par demande : " +
      fmtEur(avant.coutParDemande) +
      " puis " +
      fmtEur(apres.coutParDemande) +
      " ; par client : " +
      fmtEur(avant.coutParClient) +
      " puis " +
      fmtEur(apres.coutParClient) +
      ".",
    "Seuil de rentabilité : " + seuilTxt,
    "Calcul : quotebuilder.co/outils/calculateur-roi-salon-professionnel-devis",
  ].join("\n");

  return {
    stand,
    deplacements,
    supports,
    coutJour,
    personnes,
    jours,
    contacts,
    partAvant,
    partApres,
    tauxSignature,
    panier,
    marge,
    coutEquipe,
    coutTotal,
    coutParContact,
    avant,
    apres,
    ecartDemandes,
    ecartClients,
    ecartMarge,
    clientsEquilibre,
    demandesEquilibre,
    partEquilibre,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: RoiSalonInput = {}) {
  return computeRoiSalon(input).recap;
}
