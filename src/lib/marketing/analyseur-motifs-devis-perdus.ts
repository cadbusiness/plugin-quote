export type DevisPerdusTone = "neutral" | "ok" | "warn" | "bad";

export type MotifKey = "prix" | "delai" | "concurrent" | "silence" | "annule" | "horsCible" | "inconnu";

export type GroupeKey = "leviers" | "choix" | "qualification" | "inconnu";

export type DevisPerdusInput = {
  gagnes?: number | string | null;
  prix?: number | string | null;
  delai?: number | string | null;
  concurrent?: number | string | null;
  silence?: number | string | null;
  annule?: number | string | null;
  horsCible?: number | string | null;
  inconnu?: number | string | null;
  panier?: number | string | null;
  marge?: number | string | null;
  heures?: number | string | null;
  coutHoraire?: number | string | null;
  recup?: number | string | null;
};

export const DEVIS_PERDUS_DEFAULTS = {
  gagnes: 18,
  prix: 14,
  delai: 6,
  concurrent: 9,
  silence: 16,
  annule: 7,
  horsCible: 5,
  inconnu: 5,
  panier: 8000,
  marge: 30,
  heures: 3,
  coutHoraire: 55,
  recup: 20,
} as const;

export const MOTIFS: readonly {
  key: MotifKey;
  label: string;
  court: string;
  groupe: GroupeKey;
}[] = [
  { key: "prix", label: "Prix", court: "prix", groupe: "leviers" },
  { key: "delai", label: "Délai", court: "délai", groupe: "leviers" },
  { key: "concurrent", label: "Concurrent préféré", court: "concurrent préféré", groupe: "choix" },
  { key: "silence", label: "Pas de réponse", court: "pas de réponse", groupe: "leviers" },
  { key: "annule", label: "Projet annulé ou reporté", court: "projet annulé ou reporté", groupe: "choix" },
  { key: "horsCible", label: "Hors cible", court: "hors cible", groupe: "qualification" },
  { key: "inconnu", label: "Sans motif", court: "sans motif", groupe: "inconnu" },
];

export const GROUPES: Record<GroupeKey, string> = {
  leviers: "Vos leviers",
  choix: "Choix du client",
  qualification: "Qualification",
  inconnu: "Sans motif",
};

export type DevisPerdusLigne = {
  key: MotifKey;
  label: string;
  court: string;
  groupe: GroupeKey;
  count: number;
  part: number | null;
};

export type DevisPerdusGroupe = {
  count: number;
  part: number | null;
};

export type DevisPerdusVerdict = {
  tone: DevisPerdusTone;
  text: string;
};

export type DevisPerdusResult = {
  gagnes: number;
  counts: Record<MotifKey, number>;
  panier: number;
  marge: number;
  heures: number;
  coutHoraire: number;
  recup: number;
  perdus: number;
  decides: number;
  tauxGain: number | null;
  lignes: DevisPerdusLigne[];
  groupes: Record<GroupeKey, DevisPerdusGroupe>;
  top: DevisPerdusLigne | null;
  caPerdu: number;
  margePerdue: number;
  heuresPerdues: number;
  coutChiffragePerdus: number;
  heuresHorsCible: number;
  coutHorsCible: number;
  recupClients: number;
  recupCa: number;
  recupMarge: number;
  tauxApres: number | null;
  verdict: DevisPerdusVerdict;
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

export function fmtPct(n: number | null | undefined) {
  return n == null ? "n/a" : fmtNum(n) + NB + "%";
}

function pl(n: number, one: string, many: string) {
  return Math.abs(n) >= 2 ? many : one;
}

export function computeDevisPerdus(input: DevisPerdusInput): DevisPerdusResult {
  const gagnes = Math.floor(num(input.gagnes, 0, 100000, 0));
  const counts = {} as Record<MotifKey, number>;
  let perdus = 0;
  for (const motif of MOTIFS) {
    counts[motif.key] = Math.floor(num(input[motif.key], 0, 100000, 0));
    perdus += counts[motif.key];
  }
  const panier = num(input.panier, 0, null, 0);
  const marge = num(input.marge, 0, 100, 0);
  const heures = num(input.heures, 0, 200, 0);
  const coutHoraire = num(input.coutHoraire, 0, 1000, 0);
  const recup = num(input.recup, 0, 100, 0);

  const decides = gagnes + perdus;
  const tauxGain = decides > 0 ? r6((gagnes / decides) * 100) : null;

  const lignes: DevisPerdusLigne[] = MOTIFS.map((motif) => ({
    key: motif.key,
    label: motif.label,
    court: motif.court,
    groupe: motif.groupe,
    count: counts[motif.key],
    part: perdus > 0 ? r6((counts[motif.key] / perdus) * 100) : null,
  }));

  const groupes = {} as Record<GroupeKey, DevisPerdusGroupe>;
  for (const key of Object.keys(GROUPES) as GroupeKey[]) {
    let count = 0;
    for (const ligne of lignes) {
      if (ligne.groupe === key) count += ligne.count;
    }
    groupes[key] = { count, part: perdus > 0 ? r6((count / perdus) * 100) : null };
  }

  let top: DevisPerdusLigne | null = null;
  for (const ligne of lignes) {
    if (ligne.key === "inconnu" || ligne.count === 0) continue;
    if (top === null || ligne.count > top.count) top = ligne;
  }

  const caPerdu = r6(perdus * panier);
  const margePerdue = r6((caPerdu * marge) / 100);
  const coutDevis = heures * coutHoraire;
  const heuresPerdues = r6(perdus * heures);
  const coutChiffragePerdus = r6(perdus * coutDevis);
  const heuresHorsCible = r6(counts.horsCible * heures);
  const coutHorsCible = r6(counts.horsCible * coutDevis);

  const recupClients = r6((groupes.leviers.count * recup) / 100);
  const recupCa = r6(recupClients * panier);
  const recupMarge = r6((recupCa * marge) / 100);
  const tauxApres = decides > 0 ? r6(((gagnes + recupClients) / decides) * 100) : null;

  const partInconnu = groupes.inconnu.part;
  let verdict: DevisPerdusVerdict;
  if (perdus === 0) {
    verdict = { tone: "neutral", text: "Saisissez vos devis perdus, motif par motif, pour lancer l'analyse." };
  } else if (partInconnu != null && partInconnu > 30) {
    verdict = {
      tone: "bad",
      text:
        fmtPct(partInconnu) +
        " des pertes n'ont pas de motif : le classement des autres motifs ne dit pas grand-chose. Première action : noter le motif à chaque passage en Perdu.",
    };
  } else if ((partInconnu != null && partInconnu > 15) || decides < 20) {
    verdict = {
      tone: "warn",
      text:
        "Analyse à confirmer : " +
        (partInconnu != null && partInconnu > 15
          ? fmtPct(partInconnu) + " des pertes sans motif"
          : "seulement " + fmtNum(decides) + pl(decides, " devis tranché", " devis tranchés")) +
        ". Un ou deux dossiers de plus peuvent changer le classement. Continuez à noter les motifs avant de décider.",
    };
  } else {
    verdict = {
      tone: "ok",
      text:
        "Analyse exploitable : " +
        fmtNum(perdus) +
        pl(perdus, " devis perdu", " devis perdus") +
        ", " +
        fmtPct(partInconnu) +
        " sans motif. Premier motif : " +
        (top ? top.court : "") +
        " (" +
        fmtNum(top ? top.count : null) +
        ", " +
        fmtPct(top ? top.part : null) +
        " des pertes). Vos leviers (prix, délai, pas de réponse) pèsent " +
        fmtPct(groupes.leviers.part) +
        " des pertes.",
    };
  }

  const conseils: string[] = [];
  function part(key: MotifKey) {
    return lignes.find((ligne) => ligne.key === key)?.part ?? null;
  }
  if (perdus > 0) {
    const partPrix = part("prix");
    const partDelai = part("delai");
    const partConcurrent = part("concurrent");
    const partSilence = part("silence");
    const partAnnule = part("annule");
    if (partPrix != null && partPrix >= 20) {
      conseils.push(
        "Prix : " +
          fmtPct(partPrix) +
          " des pertes. Avant de baisser un tarif, relisez quelques dossiers : même périmètre que le concurrent ? Le client connaissait-il l'ordre de grandeur avant le devis ? Une fourchette indicative dans la demande trie plus tôt.",
      );
    }
    if (partDelai != null && partDelai >= 15) {
      conseils.push(
        "Délai : " +
          fmtPct(partDelai) +
          " des pertes. Séparez le délai de réponse (organisation du chiffrage) du délai de réalisation (production, ou au moins information dès la demande).",
      );
    }
    if (partConcurrent != null && partConcurrent >= 15) {
      conseils.push(
        "Concurrent préféré : " +
          fmtPct(partConcurrent) +
          " des pertes. Demandez au client, en une question, ce qui a fait la différence. Ces réponses ne se devinent pas.",
      );
    }
    if (partSilence != null && partSilence >= 20) {
      conseils.push(
        "Pas de réponse : " +
          fmtPct(partSilence) +
          " des pertes. Comptez les relances avant de conclure : un devis relancé une fois n'est pas un devis perdu. Fixez une règle d'équipe avant tout passage en Perdu.",
      );
    }
    if (partAnnule != null && partAnnule >= 15) {
      conseils.push(
        "Projet annulé ou reporté : " +
          fmtPct(partAnnule) +
          " des pertes. Rien à corriger dans l'offre : notez la date de reprise et prévoyez le rappel.",
      );
    }
    if (counts.horsCible > 0) {
      conseils.push(
        "Hors cible : " +
          fmtNum(counts.horsCible) +
          pl(counts.horsCible, " devis", " devis") +
          ", " +
          fmtNum(heuresHorsCible) +
          NB +
          "h de chiffrage (" +
          fmtEur(coutHorsCible) +
          "). Ces demandes se trient avant de chiffrer : une question de zone, de type de projet ou de volume dans la demande.",
      );
    }
    if (partInconnu != null && partInconnu > 15) {
      conseils.push(
        "Sans motif : " +
          fmtPct(partInconnu) +
          " des pertes. Une ligne « Motif : … » en tête d'une note, au moment du classement, suffit.",
      );
    }
  }
  conseils.push(
    "Dans QuoteBuilder, le statut Perdu n'a pas de champ motif et les statistiques ne comptent pas les pertes : notez le motif en première ligne d'une note interne, puis comptez à partir de la liste des demandes filtrée sur Perdu (l'export CSV ne contient pas les notes).",
  );

  const recapMotifs = lignes.map((ligne) => ligne.court + " " + fmtNum(ligne.count) + " (" + fmtPct(ligne.part) + ")").join(", ");
  const recap = [
    "Devis tranchés : " +
      fmtNum(decides) +
      " (" +
      fmtNum(gagnes) +
      pl(gagnes, " gagné", " gagnés") +
      ", " +
      fmtNum(perdus) +
      pl(perdus, " perdu", " perdus") +
      "), taux de gain " +
      fmtPct(tauxGain) +
      ".",
    "Motifs : " + recapMotifs + ".",
    "Groupes : vos leviers " +
      fmtNum(groupes.leviers.count) +
      " (" +
      fmtPct(groupes.leviers.part) +
      "), choix du client " +
      fmtNum(groupes.choix.count) +
      " (" +
      fmtPct(groupes.choix.part) +
      "), qualification " +
      fmtNum(groupes.qualification.count) +
      " (" +
      fmtPct(groupes.qualification.part) +
      "), sans motif " +
      fmtNum(groupes.inconnu.count) +
      " (" +
      fmtPct(groupes.inconnu.part) +
      ").",
    "Devis perdus : " +
      fmtEur(caPerdu) +
      " HT de commandes possibles, " +
      fmtEur(margePerdue) +
      " de marge, " +
      fmtNum(heuresPerdues) +
      NB +
      "h de chiffrage (" +
      fmtEur(coutChiffragePerdus) +
      "), dont hors cible " +
      fmtNum(heuresHorsCible) +
      NB +
      "h (" +
      fmtEur(coutHorsCible) +
      ").",
    "Récupérer " +
      fmtPct(recup) +
      " des pertes sur vos leviers : " +
      fmtNum(recupClients) +
      pl(recupClients, " affaire", " affaires") +
      ", " +
      fmtEur(recupCa) +
      " HT, " +
      fmtEur(recupMarge) +
      " de marge, taux de gain " +
      fmtPct(tauxApres) +
      ".",
    "Lecture : " + verdict.text,
    "Calcul : quotebuilder.co/outils/analyseur-motifs-devis-perdus",
  ].join("\n");

  return {
    gagnes,
    counts,
    panier,
    marge,
    heures,
    coutHoraire,
    recup,
    perdus,
    decides,
    tauxGain,
    lignes,
    groupes,
    top,
    caPerdu,
    margePerdue,
    heuresPerdues,
    coutChiffragePerdus,
    heuresHorsCible,
    coutHorsCible,
    recupClients,
    recupCa,
    recupMarge,
    tauxApres,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: DevisPerdusInput) {
  return computeDevisPerdus(input).recap;
}
