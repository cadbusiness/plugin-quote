import type { Answers } from "@/lib/wizard/types";

const NO_CONSTRAINT = new Set(["none", "aucune", "aucun"]);

/** « Aucune particulière » is stored as `none` in templates and `aucune` in older copy. */
export function hasRealConstraint(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((item) => {
    const token = String(item ?? "").trim().toLowerCase();
    return token.length > 0 && !NO_CONSTRAINT.has(token);
  });
}

/** Template funnels store the load as a band; the Quickly seed stores kilograms. */
const LOAD_BAND_KG: Record<string, number> = { light: 150, medium: 500, heavy: 900 };

export function loadKg(value: unknown): number {
  const band = LOAD_BAND_KG[String(value ?? "").trim().toLowerCase()];
  if (band !== undefined) return band;
  const kg = Number(value ?? 0);
  return Number.isFinite(kg) ? kg : 0;
}

export function scoreQuote(answers: Answers): { score: number; label: "hot" | "warm" | "cold" } {
  let score = 30;
  const surface = Number(answers.surface ?? 0);
  const load = loadKg(answers.load);
  const access = String(answers.access ?? "");
  const project = String(answers.project_type ?? "");

  if (surface >= 400) score += 25;
  else if (surface >= 100) score += 15;
  else if (surface > 0) score += 8;

  if (load >= 600) score += 15;
  else if (load >= 200) score += 8;

  if (access === "haute") score += 15;
  else if (access === "moyenne") score += 8;

  if (["entrepot", "cuisine_pro", "commerce"].includes(project)) score += 10;

  if (hasRealConstraint(answers.constraints)) {
    score += 5;
  }

  const need = String(answers.need ?? answers.besoin ?? "").trim();
  if (need.length >= 80) score += 15;
  else if (need.length >= 20) score += 8;

  score = Math.max(0, Math.min(100, score));
  const label = score >= 70 ? "hot" : score >= 45 ? "warm" : "cold";
  return { score, label };
}

export function scoreReasons(answers: Answers): string[] {
  const reasons: string[] = [];
  const surface = Number(answers.surface ?? 0);
  const load = loadKg(answers.load);
  const access = String(answers.access ?? "");
  const project = String(answers.project_type ?? "");
  if (surface >= 400) reasons.push("Grande surface (≥ 400 m²)");
  else if (surface >= 100) reasons.push("Surface significative");
  else if (surface > 0) reasons.push("Surface renseignée");

  if (load >= 600) reasons.push("Charge lourde");
  else if (load >= 200) reasons.push("Charge moyenne");

  // `access` is the picking frequency (faible / moyenne / haute), not site access.
  if (access === "haute") reasons.push("Rotation élevée (picking quotidien)");
  else if (access === "moyenne") reasons.push("Rotation régulière");

  if (["entrepot", "cuisine_pro", "commerce"].includes(project)) {
    reasons.push("Projet professionnel");
  }

  if (hasRealConstraint(answers.constraints)) {
    reasons.push("Contraintes techniques");
  }

  const need = String(answers.need ?? answers.besoin ?? "").trim();
  if (need.length >= 80) reasons.push("Brief détaillé");
  else if (need.length >= 20) reasons.push("Besoin renseigné");

  return reasons;
}
