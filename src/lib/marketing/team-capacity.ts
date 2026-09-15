function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type TeamCapacityInput = {
  reps: number;
  hoursPerWeek: number;
  weeksPerMonth: number;
  minHot: number;
  minWarm: number;
  minCold: number;
  volHot: number;
  volWarm: number;
  volCold: number;
  mixOpen?: boolean;
  pctHot?: number;
  pctWarm?: number;
  pctCold?: number;
};

export type TeamCapacityMix = {
  volHot: number;
  volWarm: number;
  volCold: number;
};

export type TeamCapacityResult = {
  reps: number;
  hoursPerWeek: number;
  weeksPerMonth: number;
  capacityHours: number;
  chargeHot: number;
  chargeWarm: number;
  chargeCold: number;
  chargeHours: number;
  deltaHours: number;
  utilization: number;
  mixTotal: number;
  mixOk: boolean;
  mixWarn: string;
  tip: string;
};

export function applyTeamCapacityMix(
  total: number,
  pctHot: number,
  pctWarm: number,
  pctCold: number,
): TeamCapacityMix | null {
  const h = pctHot;
  const w = pctWarm;
  const c = pctCold;
  if (h + w + c !== 100) return null;
  const volume = Math.max(0, total);
  return {
    volHot: Math.round((volume * h) / 100),
    volWarm: Math.round((volume * w) / 100),
    volCold: Math.round((volume * c) / 100),
  };
}

export function teamCapacityTip({
  reps,
  hoursPerWeek,
  chargeHours,
  deltaHours,
  utilization,
}: {
  reps: number;
  hoursPerWeek: number;
  chargeHours: number;
  deltaHours: number;
  utilization: number;
}): string {
  if (reps === 0 || hoursPerWeek === 0) {
    return "Indiquez le nombre de commerciaux et les heures dispo par semaine pour voir la capacité.";
  }
  if (chargeHours === 0) {
    return "Renseignez un volume mensuel Hot / Warm / Cold (ou un mix %) pour estimer la charge.";
  }
  if (deltaHours < -8) {
    return "Surcharge nette. Avant de pousser le volume d’entrée, réduisez les minutes Cold (qualification), plafonnez les Hot par owner, ou ajoutez de la capacité.";
  }
  if (deltaHours < 0) {
    return "Légère surcharge. Surveillez les SLA Hot et les orphelins. Un peu de buffer (10–15 %) évite les week-ends catastrophiques.";
  }
  if (utilization < 55) {
    return "Surplus de capacité. Vous pouvez absorber plus de Warm/Hot, ou resserrer les SLA de première réponse sans recruter.";
  }
  if (utilization > 90) {
    return "Utilisation très haute. Fragile dès qu’un commercial est absent. Prévoir backup owner et file Cold séparée.";
  }
  return "Charge dans une zone tenable. Gardez un peu de marge pour les pics et les dossiers à visite de site.";
}

export function computeTeamCapacity(input: TeamCapacityInput): TeamCapacityResult {
  const reps = Math.max(0, input.reps);
  const hoursPerWeek = Math.max(0, input.hoursPerWeek);
  const weeksPerMonth = Math.max(0.1, input.weeksPerMonth);
  const capacityHours = reps * hoursPerWeek * weeksPerMonth;

  const minHot = Math.max(0, input.minHot);
  const minWarm = Math.max(0, input.minWarm);
  const minCold = Math.max(0, input.minCold);
  const volHot = Math.max(0, input.volHot);
  const volWarm = Math.max(0, input.volWarm);
  const volCold = Math.max(0, input.volCold);

  const chargeHot = (volHot * minHot) / 60;
  const chargeWarm = (volWarm * minWarm) / 60;
  const chargeCold = (volCold * minCold) / 60;
  const chargeHours = chargeHot + chargeWarm + chargeCold;
  const deltaHours = capacityHours - chargeHours;
  const utilization =
    capacityHours > 0 ? (chargeHours / capacityHours) * 100 : chargeHours > 0 ? 999 : 0;

  const pctHot = clamp(input.pctHot ?? 0, 0, 100);
  const pctWarm = clamp(input.pctWarm ?? 0, 0, 100);
  const pctCold = clamp(input.pctCold ?? 0, 0, 100);
  const mixTotal = pctHot + pctWarm + pctCold;
  const mixOk = mixTotal === 100;

  let mixWarn = "";
  if (input.mixOpen && mixTotal > 0 && !mixOk) {
    mixWarn = `Le mix fait ${mixTotal} % (visez 100 %).`;
  } else if (input.mixOpen && mixOk) {
    mixWarn = "Mix à 100 %. OK.";
  }

  return {
    reps,
    hoursPerWeek,
    weeksPerMonth,
    capacityHours,
    chargeHot,
    chargeWarm,
    chargeCold,
    chargeHours,
    deltaHours,
    utilization,
    mixTotal,
    mixOk,
    mixWarn,
    tip: teamCapacityTip({
      reps,
      hoursPerWeek,
      chargeHours,
      deltaHours,
      utilization,
    }),
  };
}
