function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type CoutBriefIncompletInput = {
  demandes: number;
  pctIncomplets: number;
  minutes: number;
  coutHoraire: number;
  pctMorts: number;
  panier: number;
};

export type CoutBriefIncompletResult = {
  briefs: number;
  heures: number;
  coutTemps: number;
  morts: number;
  caPerdu: number;
  total: number;
  caEstime: boolean;
  tip: string;
};

export function coutBriefIncompletTip({
  demandes,
  pctIncomplets,
  minutes,
  heures,
  coutTemps,
  caPerdu,
}: {
  demandes: number;
  pctIncomplets: number;
  minutes: number;
  heures: number;
  coutTemps: number;
  caPerdu: number;
}): string {
  if (demandes === 0) {
    return "Indiquez un volume de demandes pour obtenir une première estimation.";
  }
  if (pctIncomplets >= 50 && heures >= 10) {
    return "Plus de la moitié des briefs sont incomplets et le temps perdu est élevé. Priorisez un brief minimum obligatoire avant chiffrage (dimensions, budget indicatif, photos).";
  }
  if (caPerdu > coutTemps && caPerdu > 0) {
    return "Le CA perdu dépasse le coût temps. Qualifier plus tôt (score brief, questions bloquantes) sauve souvent plus que d’accélérer le chiffrage brut.";
  }
  if (minutes >= 45) {
    return "Chaque brief incomplet coûte beaucoup de minutes. Centralisez les questions manquantes dans un seul aller-retour plutôt que des fils mail dispersés.";
  }
  if (coutTemps > 0) {
    return "Le coût temps est déjà visible. Réduisez le % d’incomplets via un funnel ou une checklist avant d’ouvrir le chiffrage.";
  }
  return "Ajustez les entrées pour voir l’écart. Un point de brief plus propre compte souvent plus qu’une heure de chiffrage supplémentaire.";
}

export function computeCoutBriefIncomplet(input: CoutBriefIncompletInput): CoutBriefIncompletResult {
  const demandes = Math.max(0, input.demandes);
  const pctIncomplets = clamp(input.pctIncomplets, 0, 100);
  const minutes = Math.max(0, input.minutes);
  const coutHoraire = Math.max(0, input.coutHoraire);
  const pctMorts = clamp(input.pctMorts, 0, 100);
  const panier = Math.max(0, input.panier);

  const briefs = (demandes * pctIncomplets) / 100;
  const heures = (briefs * minutes) / 60;
  const coutTemps = heures * coutHoraire;
  const morts = (briefs * pctMorts) / 100;
  const caEstime = pctMorts > 0 && panier > 0;
  const caPerdu = caEstime ? morts * panier : 0;
  const total = coutTemps + caPerdu;

  return {
    briefs,
    heures,
    coutTemps,
    morts,
    caPerdu,
    total,
    caEstime,
    tip: coutBriefIncompletTip({
      demandes,
      pctIncomplets,
      minutes,
      heures,
      coutTemps,
      caPerdu,
    }),
  };
}
