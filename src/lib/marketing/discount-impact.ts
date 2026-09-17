function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type DiscountImpactInput = {
  ca: number;
  cout: number;
  remise: number;
  volume: number;
  txAvant: number;
  txApres: number;
};

export type DiscountImpactResult = {
  ca: number;
  cout: number;
  remise: number;
  volume: number;
  txAvant: number;
  txApres: number;
  margeAvantE: number;
  margeAvantP: number;
  caApres: number;
  margeApresE: number;
  margeApresP: number;
  perteUnite: number;
  impactSimple: number;
  impactNet: number;
  wonSans: number | null;
  margeEspereeSans: number | null;
  margeEspereeAvec: number | null;
  acceptUseful: boolean;
  tip: string;
};

export function discountImpactTip({
  ca,
  cout,
  margeApresE,
  margeApresP,
  impactNet,
  perteUnite,
  txAvant,
  txApres,
}: {
  ca: number;
  cout: number;
  margeApresE: number;
  margeApresP: number;
  impactNet: number;
  perteUnite: number;
  txAvant: number;
  txApres: number;
}): string {
  if (ca === 0) {
    return "Indiquez un CA devis HT pour démarrer.";
  }
  if (cout > ca) {
    return "Le coût dépasse déjà le CA avant remise. Traiter la structure de coût avant de parler discount.";
  }
  if (margeApresE < 0) {
    return "Après remise, la marge est négative. Vous payez pour signer. Plafonnez la remise ou retirez du scope plutôt que de « gagner » à perte.";
  }
  if (margeApresP < 10) {
    return "Marge sous 10 % après remise. Fragile dès qu’il y a une reprise chantier ou un oubli pose. Tracez la remise en version de devis, ne la laissez pas orale.";
  }
  if (impactNet < -5000) {
    return "Sur l’année, cette habitude de remise mange une vraie poche de marge. Gardez la remise pour les Hot stratégiques, pas en réflexe.";
  }
  if (txApres > txAvant && impactNet >= 0) {
    return "La hausse d’acceptation semble compenser la perte unitaire (ordre de grandeur). Vérifiez que le taux après est réaliste, pas un souhait.";
  }
  if (perteUnite > 0 && txApres - txAvant < 3) {
    return "Vous perdez de la marge pour un gain d’acceptation faible. Souvent mieux : défendre le prix, ajuster une option, ou versionner une contre-proposition cadrée.";
  }
  return "Remise tenable sur ce scénario, à condition de la tracer (v2) et de ne pas la généraliser à tous les Warm.";
}

export function computeDiscountImpact(input: DiscountImpactInput): DiscountImpactResult {
  const ca = Math.max(0, input.ca);
  const cout = Math.max(0, input.cout);
  const remise = clamp(input.remise, 0, 100);
  const volume = Math.max(0, input.volume);
  const txAvant = clamp(input.txAvant, 0, 100);
  const txApres = clamp(input.txApres, 0, 100);

  const margeAvantE = ca - cout;
  const margeAvantP = ca > 0 ? (margeAvantE / ca) * 100 : 0;

  const caApres = ca * (1 - remise / 100);
  const margeApresE = caApres - cout;
  const margeApresP = caApres > 0 ? (margeApresE / caApres) * 100 : 0;

  const perteUnite = margeAvantE - margeApresE;
  const impactSimple = -perteUnite * volume;

  const acceptUseful = txApres > 0;
  let impactNet = impactSimple;
  let wonSans: number | null = null;
  let margeEspereeSans: number | null = null;
  let margeEspereeAvec: number | null = null;

  if (acceptUseful) {
    wonSans = volume * (txAvant / txApres);
    margeEspereeSans = wonSans * margeAvantE;
    margeEspereeAvec = volume * margeApresE;
    impactNet = margeEspereeAvec - margeEspereeSans;
  }

  return {
    ca,
    cout,
    remise,
    volume,
    txAvant,
    txApres,
    margeAvantE,
    margeAvantP,
    caApres,
    margeApresE,
    margeApresP,
    perteUnite,
    impactSimple,
    impactNet,
    wonSans,
    margeEspereeSans,
    margeEspereeAvec,
    acceptUseful,
    tip: discountImpactTip({
      ca,
      cout,
      margeApresE,
      margeApresP,
      impactNet,
      perteUnite,
      txAvant,
      txApres,
    }),
  };
}
