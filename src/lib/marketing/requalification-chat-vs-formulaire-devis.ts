function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function round1(n: number) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function fmtEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function fmtNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export const REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS = {
  demandes: 80,
  pctChat: 30,
  reqChat: 40,
  reqForm: 25,
  minutes: 15,
  taux: 55,
} as const;

export const REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS = {
  demandes: "Demandes de devis / mois",
  pctChat: "% des demandes qui arrivent par le chat",
  reqChat: "% des dossiers chat à requalifier",
  reqForm: "% des dossiers formulaire à requalifier",
  minutes: "Minutes par requalification",
  taux: "Taux horaire chargé (€)",
  dossiers: "Dossiers / mois (chat · formulaire)",
  req: "Dossiers à requalifier / mois (chat · formulaire)",
  heures: "Heures de requalification / mois (chat · formulaire)",
  cout: "Coût de requalification / mois (chat · formulaire)",
  total: "Total indicatif mensuel",
  an: "Sur 12 mois (indicatif)",
  ecart: "Écart attribuable au chat / mois (dossiers chat × écart de taux)",
} as const;

export type RequalificationChatVsFormulaireInput = {
  demandes: number;
  pctChat: number;
  reqChat: number;
  reqForm: number;
  minutes: number;
  taux: number;
};

export type RequalificationChatVsFormulaireTone = "ok" | "warn" | "bad" | "neutral";

export type RequalificationChatVsFormulaireResult = {
  demandes: number;
  pctChat: number;
  reqChat: number;
  reqForm: number;
  minutes: number;
  taux: number;
  dChat: number;
  dForm: number;
  rChat: number;
  rForm: number;
  hChat: number;
  hForm: number;
  cChat: number;
  cForm: number;
  total: number;
  an: number;
  ecartDossiers: number;
  ecartHeures: number;
  ecartCout: number;
  alertTone: RequalificationChatVsFormulaireTone;
  totalTone: RequalificationChatVsFormulaireTone;
  ecartTone: RequalificationChatVsFormulaireTone;
  alert: string;
  tip: string;
  dossiersLabel: string;
  reqLabel: string;
  heuresLabel: string;
  coutLabel: string;
  totalLabel: string;
  anLabel: string;
  ecartLabel: string;
  recap: string;
};

export function computeRequalificationChatVsFormulaire(
  input: RequalificationChatVsFormulaireInput,
): RequalificationChatVsFormulaireResult {
  const demandes = clamp(finite(input.demandes), 0, 100000);
  const pctChat = clamp(finite(input.pctChat), 0, 100);
  const reqChat = clamp(finite(input.reqChat), 0, 100);
  const reqForm = clamp(finite(input.reqForm), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const taux = clamp(finite(input.taux), 0, 10000);

  const dChat = round1((demandes * pctChat) / 100);
  const dForm = round1(demandes - dChat);
  const rChat = round1((dChat * reqChat) / 100);
  const rForm = round1((dForm * reqForm) / 100);
  const hChat = round1((rChat * minutes) / 60);
  const hForm = round1((rForm * minutes) / 60);
  const cChat = Math.round(hChat * taux);
  const cForm = Math.round(hForm * taux);
  const total = cChat + cForm;
  const an = total * 12;
  const ecartDossiers = round1((dChat * (reqChat - reqForm)) / 100);
  const ecartHeures = round1((ecartDossiers * minutes) / 60);
  const ecartCout = Math.round(ecartHeures * taux);

  let alertTone: RequalificationChatVsFormulaireTone = "neutral";
  let alert: string;
  let tip: string;
  if (demandes <= 0) {
    alert = "Indiquez un volume de demandes / mois pour estimer le temps de requalification.";
    tip =
      "Partez du mois dernier : combien de demandes, et combien ont demandé un rappel pour une information de base ?";
  } else if (pctChat <= 0) {
    alert = `Aucune demande par le chat : l'estimation ne porte que sur le formulaire (${fmtEuro(total)} / mois).`;
    tip = "Si vous testez le chat, mesurez la requalification par canal sur la même période avant de comparer.";
  } else if (total >= 2000) {
    alertTone = "bad";
    alert = `Enjeu important · environ ${fmtEuro(total)} / mois de requalification (indicatif, selon vos hypothèses).`;
    tip = tipForEcart(ecartCout);
  } else if (total >= 500) {
    alertTone = "warn";
    alert = `Enjeu notable · environ ${fmtEuro(total)} / mois de requalification (indicatif, selon vos hypothèses).`;
    tip = tipForEcart(ecartCout);
  } else {
    alert = `Enjeu modeste · environ ${fmtEuro(total)} / mois de requalification (indicatif, selon vos hypothèses).`;
    tip = tipForEcart(ecartCout);
  }

  const totalTone: RequalificationChatVsFormulaireTone =
    total >= 2000 ? "bad" : total >= 500 ? "warn" : "neutral";
  const ecartTone: RequalificationChatVsFormulaireTone =
    ecartCout > 0 ? "bad" : ecartCout < 0 ? "ok" : "neutral";

  const dossiersLabel = `${fmtNumber(dChat, 1)} · ${fmtNumber(dForm, 1)}`;
  const reqLabel = `${fmtNumber(rChat, 1)} · ${fmtNumber(rForm, 1)}`;
  const heuresLabel = `${fmtNumber(hChat, 1)} h · ${fmtNumber(hForm, 1)} h`;
  const coutLabel = `${fmtEuro(cChat)} · ${fmtEuro(cForm)}`;
  const totalLabel = fmtEuro(total);
  const anLabel = fmtEuro(an);
  const ecartLabel = `${fmtNumber(ecartHeures, 1)} h · ${fmtEuro(ecartCout)}`;

  const recap = [
    "Récap requalification chat vs formulaire (indicatif)",
    `Demandes / mois : ${fmtNumber(demandes, 0)} (${fmtNumber(pctChat, 0)} % par le chat)`,
    `Dossiers chat · formulaire : ${fmtNumber(dChat, 1)} · ${fmtNumber(dForm, 1)}`,
    `Taux de requalification chat · formulaire : ${fmtNumber(reqChat, 0)} % · ${fmtNumber(reqForm, 0)} %`,
    `Dossiers à requalifier : ${fmtNumber(rChat, 1)} · ${fmtNumber(rForm, 1)}`,
    `Heures : ${fmtNumber(hChat, 1)} h · ${fmtNumber(hForm, 1)} h (${fmtNumber(minutes, 0)} min par reprise)`,
    `Coût : ${fmtEuro(cChat)} · ${fmtEuro(cForm)} (${fmtEuro(taux)} / h)`,
    `Total indicatif mensuel : ${fmtEuro(total)}`,
    `Sur 12 mois : ${fmtEuro(an)}`,
    `Écart attribuable au chat : ${fmtNumber(ecartHeures, 1)} h · ${fmtEuro(ecartCout)} / mois`,
    `Statut : ${alert}`,
    "",
    "Checklist dossiers issus du chat :",
    "- Questions du funnel écrites même en mode chat (ce sont les clés que l'agent remplit)",
    "- Choix explicites plutôt que texte libre ; surface en type mesure, pas en texte",
    "- Préremplir seulement ce qui est sûr : la réponse de formulaire prime sur le chat",
    "- La conversation n'est pas reprise sur la fiche devis : contexte utile en note interne",
    "- Même formule de score pour tous les canaux, calculée à la soumission",
    "",
    "Calcul local · vos hypothèses, pas un benchmark · fourchettes indicatives, pas de TVA.",
  ].join("\n");

  return {
    demandes,
    pctChat,
    reqChat,
    reqForm,
    minutes,
    taux,
    dChat,
    dForm,
    rChat,
    rForm,
    hChat,
    hForm,
    cChat,
    cForm,
    total,
    an,
    ecartDossiers,
    ecartHeures,
    ecartCout,
    alertTone,
    totalTone,
    ecartTone,
    alert,
    tip,
    dossiersLabel,
    reqLabel,
    heuresLabel,
    coutLabel,
    totalLabel,
    anLabel,
    ecartLabel,
    recap,
  };
}

function tipForEcart(ecartCout: number) {
  if (ecartCout > 0) {
    return `Le chat coûte environ ${fmtEuro(ecartCout)} / mois de plus que le formulaire sur ces hypothèses. Vérifiez les clés que l'agent doit remplir : questions précises, choix explicites, surface en type mesure.`;
  }
  if (ecartCout < 0) {
    return `Sur ces hypothèses, le chat demande moins de reprises que le formulaire (${fmtEuro(-ecartCout)} / mois d'écart). Regardez quelles questions du formulaire sont souvent mal remplies.`;
  }
  return "Pas d'écart entre les canaux sur ces hypothèses. Le choix se fait alors sur le confort du prospect et la nature de vos demandes.";
}
