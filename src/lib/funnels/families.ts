import type { Json } from "@/lib/db/database.types";

export const FUNNEL_FAMILY_IDS = [
  "racking",
  "habitat",
  "events",
  "industry",
  "services",
  "property",
  "health",
  "tech",
  "custom",
] as const;

export type FunnelFamilyId = (typeof FUNNEL_FAMILY_IDS)[number];

export type FunnelFamily = {
  id: FunnelFamilyId;
  label: string;
  blurb: string;
  pitch: string;
  tint: string;
};

export const FUNNEL_FAMILIES: FunnelFamily[] = [
  {
    id: "racking",
    label: "Rayonnage & stockage",
    blurb: "Entrepôt, réserve, charge, gammes.",
    pitch:
      "Le prospect compose les travées, la charge et la surface. Vous recevez un brief chiffrable, puis l’autopilote relance et assigne.",
    tint: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  {
    id: "habitat",
    label: "Habitat & aménagement",
    blurb: "Cuisine, menuiserie, jardin.",
    pitch:
      "Pièce, style, budget. La demande arrive cadrée ; le suivi (confirmation, J+1, J+3) part sans vous.",
    tint: "bg-rose-50 text-rose-800 ring-rose-200",
  },
  {
    id: "events",
    label: "Location & événementiel",
    blurb: "Matériel, traiteur, chapiteaux.",
    pitch:
      "Durée, lieu, capacité, options. Une demande complète, assignation, rappel si non traité.",
    tint: "bg-sky-50 text-sky-800 ring-sky-200",
  },
  {
    id: "industry",
    label: "Industrie & fabrication",
    blurb: "Site, pièces, emballages, labos.",
    pitch:
      "Série, matière, délai. Vous rappelez pour proposer, pas pour découvrir le besoin.",
    tint: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  },
  {
    id: "services",
    label: "Services professionnels",
    blurb: "Espaces, formation, studios.",
    pitch:
      "Besoin, volume, échéance. Coworking, formation ou studio : le même brief, des libellés adaptés.",
    tint: "bg-violet-50 text-violet-800 ring-violet-200",
  },
  {
    id: "property",
    label: "Immobilier & construction",
    blurb: "Promoteur, architecte, géomètre.",
    pitch:
      "Type de mission, échéance, contexte. Le dossier arrive avec le cadre, pas un appel à vide.",
    tint: "bg-stone-100 text-stone-800 ring-stone-200",
  },
  {
    id: "health",
    label: "Santé & bien-être",
    blurb: "Clinique, bilan, équipement.",
    pitch:
      "Acte ou équipement, contraintes, budget. Le prospect se qualifie avant le rendez-vous.",
    tint: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  {
    id: "tech",
    label: "Tech & services",
    blurb: "Agence, ESN, conseil, logiciel.",
    pitch:
      "Besoin, volume, échéance. Agence, conseil ou logiciel sur mesure : un brief, pas un cahier des charges vide.",
    tint: "bg-slate-100 text-slate-800 ring-slate-200",
  },
  {
    id: "custom",
    label: "Sur mesure",
    blurb: "Cadrage générique, vous affinez.",
    pitch:
      "Le funnel se construit sur votre catalogue. On part d’un cadrage générique, vous affinez ensuite.",
    tint: "bg-orange-50 text-orange-800 ring-orange-200",
  },
];

export function isFunnelFamilyId(value: string): value is FunnelFamilyId {
  return (FUNNEL_FAMILY_IDS as readonly string[]).includes(value);
}

export function getFunnelFamily(id: string | null | undefined): FunnelFamily {
  const found = FUNNEL_FAMILIES.find((family) => family.id === id);
  return found ?? FUNNEL_FAMILIES[FUNNEL_FAMILIES.length - 1]!;
}

export function parseOrgFamily(branding: Json | Record<string, unknown> | null | undefined): FunnelFamilyId | null {
  if (!branding || typeof branding !== "object" || Array.isArray(branding)) return null;
  const family = (branding as { family?: unknown }).family;
  return typeof family === "string" && isFunnelFamilyId(family) ? family : null;
}

export function mergeOrgFamily(branding: Json | null | undefined, family: FunnelFamilyId): Json {
  const base =
    branding && typeof branding === "object" && !Array.isArray(branding)
      ? { ...(branding as Record<string, unknown>) }
      : {};
  return { ...base, family } as Json;
}
