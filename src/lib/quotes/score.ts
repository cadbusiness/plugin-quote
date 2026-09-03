import type { Answers } from "@/lib/wizard/types";

export function scoreQuote(answers: Answers): { score: number; label: "hot" | "warm" | "cold" } {
  let score = 30;
  const surface = Number(answers.surface ?? 0);
  const load = Number(answers.load ?? 0);
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

  const constraints = answers.constraints;
  if (Array.isArray(constraints) && constraints.length > 0 && !constraints.includes("aucune")) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));
  const label = score >= 70 ? "hot" : score >= 45 ? "warm" : "cold";
  return { score, label };
}

export function scoreReasons(answers: Answers): string[] {
  const reasons: string[] = [];
  const surface = Number(answers.surface ?? 0);
  const load = Number(answers.load ?? 0);
  const access = String(answers.access ?? "");
  const project = String(answers.project_type ?? "");
  const constraints = answers.constraints;

  if (surface >= 400) reasons.push("Grande surface (≥ 400 m²)");
  else if (surface >= 100) reasons.push("Surface significative");
  else if (surface > 0) reasons.push("Surface renseignée");

  if (load >= 600) reasons.push("Charge lourde");
  else if (load >= 200) reasons.push("Charge moyenne");

  if (access === "haute") reasons.push("Accès difficile");
  else if (access === "moyenne") reasons.push("Accès contraint");

  if (["entrepot", "cuisine_pro", "commerce"].includes(project)) {
    reasons.push("Projet professionnel");
  }

  if (Array.isArray(constraints) && constraints.length > 0 && !constraints.includes("aucune")) {
    reasons.push("Contraintes techniques");
  }

  return reasons;
}
