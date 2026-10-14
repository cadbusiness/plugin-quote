export type SuiviClientsTone = "neutral" | "bad" | "warn" | "ok";

export type SuiviClientsInput = {
  clientsActifs?: number | string | null;
  questionsParClient?: number | string | null;
  minutesParQuestion?: number | string | null;
  partRecente?: number | string | null;
  partLibreService?: number | string | null;
  documentsRenvoyes?: number | string | null;
  minutesParRenvoi?: number | string | null;
  tauxHoraire?: number | string | null;
  heuresMiseEnPlace?: number | string | null;
  minutesEntretien?: number | string | null;
};

export type SuiviClientsVerdict = {
  tone: SuiviClientsTone;
  text: string;
};

export type SuiviClientsResult = {
  clients: number;
  questionsParClient: number;
  minutesParQuestion: number;
  partRecente: number;
  partLibreService: number;
  documents: number;
  minutesParRenvoi: number;
  tauxHoraire: number;
  heuresMiseEnPlace: number;
  minutesEntretien: number;
  questionsMois: number;
  heuresQuestions: number;
  heuresDocuments: number;
  heuresActuelles: number;
  coutActuel: number;
  questionsEvitees: number;
  heuresEvitees: number;
  coutEvite: number;
  partTempsRendu: number;
  heuresEntretien: number;
  coutEntretien: number;
  heuresMiseEnPlaceMensuel: number;
  coutMiseEnPlaceMensuel: number;
  coutEntretienEtMiseEnPlace: number;
  heuresNettes: number;
  gainNetMensuel: number;
  gainNetAnnuel: number;
  moisRetour: number | null;
  verdict: SuiviClientsVerdict;
  conseils: string[];
  recap: string;
};

/**
 * Exemple de l'article : 30 clients, 2 questions, 8 min, 70 % de demandes
 * de moins de 30 jours, 50 % en libre-service, 12 documents, 5 min,
 * 45 €/h, mise en place 4 h, entretien 30 min.
 */
export const SUIVI_CLIENTS_DEFAULTS = {
  clientsActifs: 30,
  questionsParClient: 2,
  minutesParQuestion: 8,
  partRecente: 70,
  partLibreService: 50,
  documentsRenvoyes: 12,
  minutesParRenvoi: 5,
  tauxHoraire: 45,
  heuresMiseEnPlace: 4,
  minutesEntretien: 30,
} as const;

function num(v: unknown, min: number, max: number | null, fallback: number) {
  let n = v === "" || v == null ? Number.NaN : Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number) {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
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
  return (neg ? "-" : "") + txt + "\u00a0€";
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
  return n >= 2 ? many : one;
}

/** Temps des demandes de suivi. Calculs internes non arrondis, r6 en sortie. */
export function computeSuiviClients(input: SuiviClientsInput): SuiviClientsResult {
  const clients = Math.floor(num(input.clientsActifs, 0, null, 0));
  const questionsParClient = num(input.questionsParClient, 0, 30, 0);
  const minutesParQuestion = num(input.minutesParQuestion, 0, 120, 0);
  const partRecente = num(input.partRecente, 0, 100, 0);
  const partLibreService = num(input.partLibreService, 0, 100, 0);
  const documents = num(input.documentsRenvoyes, 0, null, 0);
  const minutesParRenvoi = num(input.minutesParRenvoi, 0, 60, 0);
  const tauxHoraire = num(input.tauxHoraire, 0, null, 0);
  const heuresMiseEnPlace = num(input.heuresMiseEnPlace, 0, 40, 0);
  const minutesEntretien = num(input.minutesEntretien, 0, 600, 0);

  const qm = clients * questionsParClient;
  const hq = (qm * minutesParQuestion) / 60;
  const hd = (documents * minutesParRenvoi) / 60;
  const ha = hq + hd;
  const qe = ((qm * partRecente) / 100) * (partLibreService / 100);
  const hqe = (qe * minutesParQuestion) / 60;
  const hde = (hd * partLibreService) / 100;
  const he = hqe + hde;
  const hent = minutesEntretien / 60;
  const hmp = heuresMiseEnPlace / 12;
  const hn = he - hent - hmp;
  const gainBrutHoraire = he - hent;

  const questionsMois = r6(qm);
  const heuresQuestions = r6(hq);
  const heuresDocuments = r6(hd);
  const heuresActuelles = r6(ha);
  const coutActuel = r6(ha * tauxHoraire);
  const questionsEvitees = r6(qe);
  const heuresEvitees = r6(he);
  const coutEvite = r6(he * tauxHoraire);
  const partTempsRendu = ha > 0 ? r6((he / ha) * 100) : 0;
  const heuresEntretien = r6(hent);
  const coutEntretien = r6(hent * tauxHoraire);
  const heuresMiseEnPlaceMensuel = r6(hmp);
  const coutMiseEnPlaceMensuel = r6(hmp * tauxHoraire);
  const coutEntretienEtMiseEnPlace = r6((hent + hmp) * tauxHoraire);
  const heuresNettes = r6(Math.max(0, hn));
  const gainNetMensuel = r6(hn * tauxHoraire);
  const gainNetAnnuel = r6(hn * tauxHoraire * 12);
  const moisRetour = gainBrutHoraire > 0 ? r6(heuresMiseEnPlace / gainBrutHoraire) : null;

  let verdict: SuiviClientsVerdict;
  if (clients === 0) {
    verdict = { tone: "neutral", text: "Saisissez le nombre de clients concernés pour lancer le calcul." };
  } else if (gainNetMensuel >= 150) {
    verdict = {
      tone: "ok",
      text:
        "Sur ces hypothèses, un espace membres vous rend environ " +
        fmtEur(gainNetMensuel) +
        " de temps par mois, entretien déduit. Le temps de mise en place est rendu en " +
        fmtNum(moisRetour) +
        " mois.",
    };
  } else if (gainNetMensuel >= 50) {
    verdict = {
      tone: "warn",
      text:
        "Gain modeste : environ " +
        fmtEur(gainNetMensuel) +
        " par mois. L'espace vaut surtout pour les clients qui ont plusieurs demandes ouvertes en même temps, et pour les documents que vous renvoyez souvent.",
    };
  } else {
    verdict = {
      tone: "bad",
      text:
        "Gain faible sur ces hypothèses (" +
        fmtEur(gainNetMensuel) +
        " par mois). Un email de confirmation clair, avec le lien de suivi et le code PIN, couvre l'essentiel.",
    };
  }

  const conseils: string[] = [];
  if (clients > 0 && clients < 5) {
    conseils.push(
      "Moins de cinq clients concernés : un espace membres demande un peu d'entretien pour peu de questions. Le lien de suivi de chaque demande suffit souvent.",
    );
  }
  if (clients > 0 && partRecente < 50) {
    conseils.push(
      "Plus de la moitié des questions portent sur des demandes de plus de 30 jours. Dans l'espace membres, ces demandes restent listées avec leur statut, mais sans lien vers leur page de suivi, et leur code PIN n'ouvre plus l'espace.",
    );
  }
  if (partLibreService > 80) {
    conseils.push(
      "Plus de 80 % de questions réglées seul : hypothèse forte. L'espace montre un statut et un lien, il ne répond ni sur un prix, ni sur un délai, ni sur une question technique.",
    );
  }
  if (documents > 0) {
    conseils.push(
      "Les documents de l'espace sont les mêmes pour tous les clients connectés. Un fichier déposé est privé et s'ouvre par un lien signé. N'y mettez que des notices, guides ou conditions que vous pourriez envoyer à n'importe quel client.",
    );
  }
  if (clients > 0 && minutesEntretien === 0) {
    conseils.push(
      "Zéro minute d'entretien : prévoyez au moins une relecture mensuelle des documents et des liens, sinon l'espace finit par afficher une notice périmée.",
    );
  }
  if (clients > 0 && (moisRetour === null || moisRetour > 12)) {
    conseils.push(
      "La mise en place n'est pas rendue en 12 mois sur ces hypothèses : commencez par un espace simple, Accueil et Mes devis, sans pages supplémentaires.",
    );
  }
  conseils.push(
    "L'espace membres regroupe les demandes d'une même adresse email. Un client qui écrit depuis deux adresses a deux listes, et un relecteur invité sur une demande n'y a pas accès.",
  );

  const recap = [
    "Hypothèses : " +
      fmtNum(clients) +
      pl(clients, " client, ", " clients, ") +
      fmtNum(questionsParClient) +
      pl(questionsParClient, " question de suivi", " questions de suivi") +
      " par client et par mois, " +
      fmtNum(minutesParQuestion) +
      " min par question, " +
      fmtNum(partRecente) +
      "\u00a0% sur des demandes de moins de 30 jours, " +
      fmtNum(partLibreService) +
      "\u00a0% réglables seul dans l'espace, " +
      fmtNum(documents) +
      pl(documents, " document renvoyé", " documents renvoyés") +
      " par mois de " +
      fmtNum(minutesParRenvoi) +
      " min, coût horaire " +
      fmtEur(tauxHoraire) +
      ", mise en place " +
      fmtNum(heuresMiseEnPlace) +
      " h, entretien " +
      fmtNum(minutesEntretien) +
      " min par mois.",
    "Aujourd'hui : " +
      fmtNum(questionsMois) +
      pl(questionsMois, " question", " questions") +
      " et " +
      fmtNum(heuresActuelles) +
      " h de suivi par mois, soit " +
      fmtEur(coutActuel) +
      ".",
    "Avec l'espace membres : " +
      fmtNum(questionsEvitees) +
      pl(questionsEvitees, " question évitée", " questions évitées") +
      " et " +
      fmtNum(heuresEvitees) +
      " h rendues par mois, soit " +
      fmtEur(coutEvite) +
      ".",
    "Entretien et mise en place amortie sur 12 mois : " + fmtEur(coutEntretienEtMiseEnPlace) + " par mois.",
    "Gain net : " +
      fmtEur(gainNetMensuel) +
      " par mois (" +
      fmtEur(gainNetAnnuel) +
      " sur 12 mois), avec " +
      fmtNum(heuresNettes) +
      " h nettes rendues par mois.",
    "Calcul : quotebuilder.co/outils/estimateur-temps-demandes-suivi-devis-clients",
  ].join("\n");

  return {
    clients,
    questionsParClient,
    minutesParQuestion,
    partRecente,
    partLibreService,
    documents,
    minutesParRenvoi,
    tauxHoraire,
    heuresMiseEnPlace,
    minutesEntretien,
    questionsMois,
    heuresQuestions,
    heuresDocuments,
    heuresActuelles,
    coutActuel,
    questionsEvitees,
    heuresEvitees,
    coutEvite,
    partTempsRendu,
    heuresEntretien,
    coutEntretien,
    heuresMiseEnPlaceMensuel,
    coutMiseEnPlaceMensuel,
    coutEntretienEtMiseEnPlace,
    heuresNettes,
    gainNetMensuel,
    gainNetAnnuel,
    moisRetour,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: SuiviClientsInput) {
  return computeSuiviClients(input).recap;
}
