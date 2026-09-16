function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type QuotingTimeInput = {
  volTotal: number;
  pctHot: number;
  pctWarm: number;
  pctCold: number;
  volHot: number;
  volWarm: number;
  volCold: number;
  useDirect: boolean;
  minHot: number;
  minWarm: number;
  minCold: number;
  minQual: number;
  minRev: number;
  people: number;
  hoursPerMonth: number;
};

export type QuotingTimeVolumes = {
  hot: number;
  warm: number;
  cold: number;
};

export type QuotingTimeResult = {
  volumes: QuotingTimeVolumes;
  totalDemands: number;
  chiffrageHours: number;
  qualHours: number;
  revHours: number;
  chargeHours: number;
  capacityHours: number;
  deltaHours: number;
  utilization: number;
  mixTotal: number;
  mixOk: boolean;
  mixWarn: string;
  tip: string;
};

export function quotingTimeVolumes(input: Pick<
  QuotingTimeInput,
  "volTotal" | "pctHot" | "pctWarm" | "pctCold" | "volHot" | "volWarm" | "volCold" | "useDirect"
>): QuotingTimeVolumes {
  if (input.useDirect) {
    return {
      hot: Math.max(0, input.volHot),
      warm: Math.max(0, input.volWarm),
      cold: Math.max(0, input.volCold),
    };
  }
  const total = Math.max(0, input.volTotal);
  const ph = input.pctHot;
  const pw = input.pctWarm;
  const pc = input.pctCold;
  const sum = ph + pw + pc;
  if (sum <= 0) return { hot: 0, warm: 0, cold: 0 };
  return {
    hot: Math.round((total * ph) / 100),
    warm: Math.round((total * pw) / 100),
    cold: Math.round((total * pc) / 100),
  };
}

export function quotingTimeTip({
  people,
  hoursPerMonth,
  chargeHours,
  deltaHours,
  utilization,
}: {
  people: number;
  hoursPerMonth: number;
  chargeHours: number;
  deltaHours: number;
  utilization: number;
}): string {
  if (people === 0 || hoursPerMonth === 0) {
    return "Indiquez le nombre de personnes qui chiffrent et leurs heures / mois pour voir la capacité.";
  }
  if (chargeHours === 0) {
    return "Renseignez un volume et des minutes par seau pour estimer la charge de chiffrage.";
  }
  if (deltaHours < -10) {
    return "Surcharge nette. Réduisez les minutes Cold (mieux qualifier), plafonnez les revisions (versions), ou ajoutez de la capacité avant d’augmenter le volume d’entrée.";
  }
  if (deltaHours < 0) {
    return "Légère surcharge. Surveillez le temps passé en v2 / v3. Un journal de versions et une seule version active évitent les doubles chiffrages.";
  }
  if (utilization < 50) {
    return "Surplus de capacité chiffrage. Vous pouvez absorber plus de Warm/Hot, ou resserrer le délai de premier chiffrage sans recruter.";
  }
  if (utilization > 90) {
    return "Utilisation très haute. Fragile dès qu’il y a du scope creep. Mesurez les minutes revisions et versionnez pour éviter les PDF orphelins.";
  }
  return "Charge dans une zone tenable. Gardez de la marge pour les pics et les dossiers à plusieurs versions.";
}

export function computeQuotingTime(input: QuotingTimeInput): QuotingTimeResult {
  const volumes = quotingTimeVolumes(input);
  const mH = Math.max(0, input.minHot);
  const mW = Math.max(0, input.minWarm);
  const mC = Math.max(0, input.minCold);
  const mQ = Math.max(0, input.minQual);
  const mR = Math.max(0, input.minRev);
  const people = Math.max(0, input.people);
  const hoursPerMonth = Math.max(0, input.hoursPerMonth);

  const chiffrageMin = volumes.hot * mH + volumes.warm * mW + volumes.cold * mC;
  const totalDemands = volumes.hot + volumes.warm + volumes.cold;
  const qualMin = totalDemands * mQ;
  const revMin = totalDemands * mR;
  const chargeHours = (chiffrageMin + qualMin + revMin) / 60;
  const capacityHours = people * hoursPerMonth;
  const deltaHours = capacityHours - chargeHours;
  const utilization =
    capacityHours > 0 ? (chargeHours / capacityHours) * 100 : chargeHours > 0 ? 999 : 0;

  const pctHot = clamp(input.pctHot, 0, 100);
  const pctWarm = clamp(input.pctWarm, 0, 100);
  const pctCold = clamp(input.pctCold, 0, 100);
  const mixTotal = pctHot + pctWarm + pctCold;
  const mixOk = mixTotal === 100;

  let mixWarn = "";
  if (!input.useDirect && mixTotal > 0 && !mixOk) {
    mixWarn = `Le mix fait ${mixTotal} % (visez 100 %).`;
  } else if (!input.useDirect && mixOk) {
    mixWarn = "Mix à 100 %. OK.";
  } else if (input.useDirect) {
    mixWarn = "Mode volumes directs (mix % ignoré).";
  }

  return {
    volumes,
    totalDemands,
    chiffrageHours: chiffrageMin / 60,
    qualHours: qualMin / 60,
    revHours: revMin / 60,
    chargeHours,
    capacityHours,
    deltaHours,
    utilization,
    mixTotal,
    mixOk,
    mixWarn,
    tip: quotingTimeTip({
      people,
      hoursPerMonth,
      chargeHours,
      deltaHours,
      utilization,
    }),
  };
}
