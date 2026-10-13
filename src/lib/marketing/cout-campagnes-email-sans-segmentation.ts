import { fmtEur, fmtNum } from "@/lib/marketing/charge-relances-manuelles-vs-autopilote";

export { fmtEur, fmtNum };

export type CampaignWasteTone = "neutral" | "bad" | "warn" | "ok";

export type CampaignWasteInput = {
  campagnesParMois?: number | string | null;
  tailleListe?: number | string | null;
  pctSansSegment?: number | string | null;
  minutesPreparation?: number | string | null;
  pctPlaintes?: number | string | null;
  minutesParPlainte?: number | string | null;
  pctDejaAutopilote?: number | string | null;
  tauxHoraire?: number | string | null;
  panierMoyen?: number | string | null;
  pctDealsFroids?: number | string | null;
};

export type CampaignWasteVerdict = {
  tone: CampaignWasteTone;
  text: string;
};

export type CampaignWasteResult = {
  campagnes: number;
  tailleListe: number;
  pctSansSegment: number;
  minutesPreparation: number;
  pctPlaintes: number;
  minutesParPlainte: number;
  pctDejaAutopilote: number;
  tauxHoraire: number;
  panier: number;
  pctDealsFroids: number;
  contactsEnvoyes: number;
  contactsMalCibles: number;
  contactsDejaAutopilote: number;
  plaintes: number;
  heuresPerdues: number;
  coutTemps: number;
  dealsFroids: number;
  opportunites: number;
  coutMensuel: number;
  verdict: CampaignWasteVerdict;
  conseils: string[];
  recap: string;
};

/**
 * Exemple de l'article : 2 campagnes, liste de 250, 75 % sans segment, 40 min,
 * 3 % de plaintes, 8 min par plainte, 40 % déjà en parcours Autopilote,
 * 45 €/h, panier 4 800 €, 1,5 % d'affaires qui refroidissent.
 */
export const CAMPAIGN_WASTE_DEFAULTS = {
  campagnesParMois: 2,
  tailleListe: 250,
  pctSansSegment: 75,
  minutesPreparation: 40,
  pctPlaintes: 3,
  minutesParPlainte: 8,
  pctDejaAutopilote: 40,
  tauxHoraire: 45,
  panierMoyen: 4800,
  pctDealsFroids: 1.5,
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

/** Coût d'écrire à une liste brute. Calculs internes non arrondis, r6 en sortie. */
export function computeCampaignWaste(input: CampaignWasteInput): CampaignWasteResult {
  const campagnes = num(input.campagnesParMois, 0, null, 0);
  const tailleListe = num(input.tailleListe, 0, null, 0);
  const pctSansSegment = num(input.pctSansSegment, 0, 100, 0);
  const minutesPreparation = num(input.minutesPreparation, 0, null, 0);
  const pctPlaintes = num(input.pctPlaintes, 0, 100, 0);
  const minutesParPlainte = num(input.minutesParPlainte, 0, null, 0);
  const pctDejaAutopilote = num(input.pctDejaAutopilote, 0, 100, 0);
  const tauxHoraire = num(input.tauxHoraire, 0, null, 0);
  const panier = num(input.panierMoyen, 0, null, 0);
  const pctDealsFroids = num(input.pctDealsFroids, 0, 100, 0);

  const envoyes = campagnes * tailleListe;
  const mal = (envoyes * pctSansSegment) / 100;
  const deja = (envoyes * pctDejaAutopilote) / 100;
  const plaintesN = (envoyes * pctPlaintes) / 100;
  const hm = (campagnes * minutesPreparation + plaintesN * minutesParPlainte) / 60;
  const deals = (mal * pctDealsFroids) / 100;
  const ca = deals * panier;
  const cout = hm * tauxHoraire;

  const contactsEnvoyes = r6(envoyes);
  const contactsMalCibles = r6(mal);
  const contactsDejaAutopilote = r6(deja);
  const plaintes = r6(plaintesN);
  const heuresPerdues = r6(hm);
  const coutTemps = r6(cout);
  const dealsFroids = r6(deals);
  const opportunites = r6(ca);
  const coutMensuel = r6(cout + ca);

  let verdict: CampaignWasteVerdict;
  if (campagnes === 0 || tailleListe === 0) {
    verdict = {
      tone: "neutral",
      text: "Indiquez un nombre de campagnes et une taille de liste pour lancer le calcul.",
    };
  } else if (coutMensuel >= 2000) {
    verdict = {
      tone: "ok",
      text:
        "Sur ces hypothèses, écrire sans segment coûte environ " +
        fmtEur(coutMensuel) +
        " par mois. Le temps de préparation pèse peu à côté des affaires qui refroidissent.",
    };
  } else if (coutMensuel >= 400) {
    verdict = {
      tone: "warn",
      text:
        "Écart modéré : environ " +
        fmtEur(coutMensuel) +
        " par mois. Le segment vaut surtout pour arrêter d'écrire aux mauvaises personnes. Vérifiez le taux d'affaires refroidies avant de conclure.",
    };
  } else {
    verdict = {
      tone: "bad",
      text:
        "Écart faible sur ces hypothèses (" +
        fmtEur(coutMensuel) +
        " par mois). Mesurez d'abord qui ouvre, qui se plaint, et quelles affaires étaient encore ouvertes.",
    };
  }

  const conseils: string[] = [];
  if (campagnes > 0 && tailleListe > 0 && envoyes < 50) {
    conseils.push(
      "Moins de 50 envois par mois : une affaire de plus ou de moins change le résultat. Jugez le taux d'affaires refroidies sur au moins trois mois.",
    );
  }
  if (pctSansSegment >= 60 && envoyes > 0) {
    conseils.push(
      "Au moins 60 % de la liste part sans segment : la campagne écrit surtout à des gens qui n'ont pas le même besoin. Une règle sur le funnel, le score ou la réponse change qui reçoit le message.",
    );
  }
  if (pctDejaAutopilote >= 25 && envoyes > 0) {
    conseils.push(
      "Au moins un quart de la liste est déjà dans un parcours Autopilote. Ce parcours suit une demande. La campagne, elle, ne le voit pas : la fenêtre « déjà contacté » ne compte que les campagnes marketing.",
    );
  }
  if (pctPlaintes >= 2 && envoyes > 0) {
    conseils.push(
      "2 % ou plus de plaintes ou de désabonnements : sur une liste de demandeurs de devis, c'est déjà beaucoup. Réduisez la fréquence ou resserrez le segment avant d'écrire plus.",
    );
  }
  if (envoyes > 0 && pctDealsFroids === 0) {
    conseils.push(
      "Vous estimez qu'aucune affaire ne refroidit : le calcul ne compte que le temps de préparation et de traitement des plaintes.",
    );
  } else if (opportunites > 0 && opportunites > coutTemps * 3) {
    conseils.push(
      "Les opportunités pèsent plus de trois fois le temps passé : c'est le taux d'affaires refroidies qui fait le chiffre. Une erreur sur ce taux change beaucoup le résultat.",
    );
  }
  if (minutesPreparation > 90) {
    conseils.push(
      "Plus de 90 minutes de préparation par campagne : le builder assemble des blocs (titre, texte, bouton, récap, pied de page). Le temps long vient souvent de la liste, pas de la mise en page.",
    );
  }
  if (envoyes > 0 && pctSansSegment === 0) {
    conseils.push(
      "Vous estimez que personne ne part sans segment : les contacts mal ciblés sont à zéro. Vérifiez que la campagne a bien un segment, et que ses règles ne sont pas vides.",
    );
  }
  conseils.push(
    "Une campagne écrit à un groupe. L'Autopilote suit une demande. Les deux ne se remplacent pas, et ce module n'envoie ni SMS ni WhatsApp.",
  );

  const affaire =
    dealsFroids >= 2 ? " affaires refroidies et " : " affaire refroidie et ";
  const recap = [
    "Hypothèses : " +
      fmtNum(campagnes) +
      " campagnes par mois, liste de " +
      fmtNum(tailleListe) +
      " contacts, " +
      fmtNum(pctSansSegment) +
      " % sans segment, " +
      fmtNum(minutesPreparation) +
      " min de préparation, " +
      fmtNum(pctPlaintes) +
      " % de plaintes ou désabonnements, " +
      fmtNum(minutesParPlainte) +
      " min par plainte, " +
      fmtNum(pctDejaAutopilote) +
      " % déjà en parcours Autopilote, coût horaire " +
      fmtEur(tauxHoraire) +
      ", panier " +
      fmtEur(panier) +
      ", " +
      fmtNum(pctDealsFroids) +
      " % d'affaires qui refroidissent.",
    "Envois : " +
      fmtNum(contactsEnvoyes) +
      " contacts touchés, " +
      fmtNum(contactsMalCibles) +
      " mal ciblés, " +
      fmtNum(contactsDejaAutopilote) +
      " déjà en parcours Autopilote, " +
      fmtNum(plaintes) +
      " plaintes ou désabonnements.",
    "Temps : " +
      fmtNum(heuresPerdues) +
      " h, soit " +
      fmtEur(coutTemps) +
      ".",
    "Opportunités : " +
      fmtNum(dealsFroids) +
      affaire +
      fmtEur(opportunites) +
      ".",
    "Coût mensuel (temps + opportunités) : " + fmtEur(coutMensuel) + ".",
    "Calcul : quotebuilder.co/outils/estimateur-cout-campagnes-email-sans-segmentation",
  ].join("\n");

  return {
    campagnes,
    tailleListe,
    pctSansSegment,
    minutesPreparation,
    pctPlaintes,
    minutesParPlainte,
    pctDejaAutopilote,
    tauxHoraire,
    panier,
    pctDealsFroids,
    contactsEnvoyes,
    contactsMalCibles,
    contactsDejaAutopilote,
    plaintes,
    heuresPerdues,
    coutTemps,
    dealsFroids,
    opportunites,
    coutMensuel,
    verdict,
    conseils,
    recap,
  };
}

export function buildCampaignWasteRecap(input: CampaignWasteInput) {
  return computeCampaignWaste(input).recap;
}
