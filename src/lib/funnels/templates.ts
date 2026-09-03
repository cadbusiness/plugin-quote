import type { Json } from "@/lib/db/database.types";
import type { QuestionType, ScreenType } from "@/lib/wizard/types";

export type TemplateQuestion = {
  key: string;
  label: string;
  help_text: string | null;
  type: QuestionType;
  required: boolean;
  options: Json;
};

export type TemplateStep = {
  title: string;
  subtitle: string | null;
  screen_type: ScreenType;
  questions?: TemplateQuestion[];
};

export type FunnelTemplate = {
  id: string;
  label: string;
  blurb: string;
  defaultName: string;
  accent: string;
  tint: string;
  steps: TemplateStep[];
};

const contactStep: TemplateStep = {
  title: "Vos coordonnées",
  subtitle: "Recevez le récapitulatif de votre projet",
  screen_type: "contact",
};

const suggestionsStep = (subtitle: string): TemplateStep => ({
  title: "Solutions recommandées",
  subtitle,
  screen_type: "suggestions",
});

const customizeStep: TemplateStep = {
  title: "Personnalisation",
  subtitle: "Quantités, options et précisions",
  screen_type: "customize",
};

function choices(items: { value: string; label: string; description?: string }[]): Json {
  return { choices: items };
}

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  {
    id: "racking",
    label: "Rayonnage & stockage",
    blurb: "Type d’espace, surface, charge — puis les gammes adaptées.",
    defaultName: "Funnel rayonnage",
    accent: "#D97706",
    tint: "bg-amber-50 text-amber-800 ring-amber-200",
    steps: [
      {
        title: "Type de projet",
        subtitle: "Quel espace souhaitez-vous équiper ?",
        screen_type: "questions",
        questions: [
          {
            key: "project_type",
            label: "Type d’espace",
            help_text: "Choisissez le contexte le plus proche",
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "entrepot", label: "Entrepôt", description: "Palettes, allées, hauteur utile" },
              { value: "commerce", label: "Commerce", description: "Réserve, picking fréquent" },
              { value: "atelier", label: "Atelier", description: "Pièces, outillage, charges ponctuelles" },
              { value: "archive", label: "Archives", description: "Dossiers, rayonnage léger" },
            ]),
          },
        ],
      },
      {
        title: "Dimensionnement",
        subtitle: "Surface, hauteur et contraintes",
        screen_type: "questions",
        questions: [
          {
            key: "surface",
            label: "Surface au sol (m²)",
            help_text: "Surface approximative à équiper",
            type: "number",
            required: true,
            options: { min: 10, max: 20000, step: 10, unit: "m²", placeholder: "600" },
          },
          {
            key: "height",
            label: "Hauteur disponible (m)",
            help_text: "Hauteur sous plafond ou sous poutre",
            type: "number",
            required: true,
            options: { min: 2, max: 16, step: 0.5, unit: "m", placeholder: "8" },
          },
          {
            key: "load",
            label: "Charge par niveau",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "light", label: "Légère (< 250 kg)" },
              { value: "medium", label: "Moyenne (250–800 kg)" },
              { value: "heavy", label: "Lourde (> 800 kg)" },
            ]),
          },
        ],
      },
      suggestionsStep("2 à 3 configurations adaptées à votre brief"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "kitchen",
    label: "Cuisiniste",
    blurb: "Pièce, style, budget — le prospect compose avant l’appel.",
    defaultName: "Funnel cuisine",
    accent: "#E11D48",
    tint: "bg-rose-50 text-rose-800 ring-rose-200",
    steps: [
      {
        title: "Votre cuisine",
        subtitle: "Cadrer le projet en quelques choix",
        screen_type: "questions",
        questions: [
          {
            key: "project_type",
            label: "Type de projet",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "complete", label: "Cuisine complète", description: "Pièce à équiper ou rénover" },
              { value: "ilot", label: "Îlot / snack", description: "Ajout ou remplacement" },
              { value: "partial", label: "Partiel", description: "Meubles ou plan de travail" },
            ]),
          },
          {
            key: "style",
            label: "Style souhaité",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "modern", label: "Contemporain" },
              { value: "classic", label: "Classique" },
              { value: "industrial", label: "Industriel" },
              { value: "undecided", label: "Pas encore tranché" },
            ]),
          },
          {
            key: "budget",
            label: "Budget indicatif",
            help_text: "Fourchette, pas un devis",
            type: "select",
            required: false,
            options: choices([
              { value: "10k", label: "Moins de 10 000 €" },
              { value: "20k", label: "10 000 – 20 000 €" },
              { value: "40k", label: "20 000 – 40 000 €" },
              { value: "40k+", label: "Plus de 40 000 €" },
            ]),
          },
        ],
      },
      suggestionsStep("Compositions à partir de votre catalogue"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "wood",
    label: "Menuisier",
    blurb: "Usage, essence, dimensions — uniquement ce que vous fabriquez.",
    defaultName: "Funnel menuiserie",
    accent: "#B45309",
    tint: "bg-orange-50 text-orange-800 ring-orange-200",
    steps: [
      {
        title: "Votre ouvrage",
        subtitle: "Ce que vous voulez faire réaliser",
        screen_type: "questions",
        questions: [
          {
            key: "usage",
            label: "Type d’ouvrage",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "furniture", label: "Meuble", description: "Table, dressing, bibliothèque" },
              { value: "opening", label: "Ouverture", description: "Fenêtre, porte, store" },
              { value: "stair", label: "Escalier / garde-corps" },
              { value: "fitout", label: "Agencement", description: "Sur-mesure pièce" },
            ]),
          },
          {
            key: "essence",
            label: "Essence ou finition",
            help_text: "Si vous avez une préférence",
            type: "select",
            required: false,
            options: choices([
              { value: "oak", label: "Chêne" },
              { value: "walnut", label: "Noyer" },
              { value: "ash", label: "Frêne" },
              { value: "painted", label: "Laqué / peint" },
              { value: "open", label: "À conseiller" },
            ]),
          },
          {
            key: "notes",
            label: "Dimensions ou contraintes",
            help_text: "Cotes approximatives, accès, délais",
            type: "text",
            required: false,
            options: { placeholder: "Ex. 3,20 m de linéaire, pièce mansardée" },
          },
        ],
      },
      suggestionsStep("Pièces et finitions de votre catalogue"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "garden",
    label: "Paysagiste",
    blurb: "Surface, usage, entretien — le projet se compose avant le RDV.",
    defaultName: "Funnel jardin",
    accent: "#059669",
    tint: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    steps: [
      {
        title: "Votre extérieur",
        subtitle: "Surface, usage et niveau d’entretien",
        screen_type: "questions",
        questions: [
          {
            key: "usage",
            label: "Usage principal",
            help_text: "Plusieurs choix possibles",
            type: "multi_select",
            required: true,
            options: choices([
              { value: "terrace", label: "Terrasse / salon d’été" },
              { value: "lawn", label: "Pelouse / massifs" },
              { value: "pool", label: "Tour de piscine" },
              { value: "full", label: "Jardin complet" },
            ]),
          },
          {
            key: "surface",
            label: "Surface (m²)",
            help_text: null,
            type: "number",
            required: true,
            options: { min: 10, max: 5000, step: 10, unit: "m²", placeholder: "120" },
          },
          {
            key: "upkeep",
            label: "Niveau d’entretien souhaité",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "low", label: "Minimal" },
              { value: "medium", label: "Régulier" },
              { value: "high", label: "Jardin soigné" },
            ]),
          },
        ],
      },
      suggestionsStep("Aménagements à partir de vos gammes"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "rental",
    label: "Location matériel",
    blurb: "Durée, capacité, options — une demande complète, pas un appel à vide.",
    defaultName: "Funnel location",
    accent: "#0284C7",
    tint: "bg-sky-50 text-sky-800 ring-sky-200",
    steps: [
      {
        title: "Votre location",
        subtitle: "Matériel, durée et conditions de chantier",
        screen_type: "questions",
        questions: [
          {
            key: "category",
            label: "Famille de matériel",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "lift", label: "Levage / Nacelle" },
              { value: "earth", label: "Terrassement" },
              { value: "power", label: "Énergie / Groupe" },
              { value: "other", label: "Autre" },
            ]),
          },
          {
            key: "duration",
            label: "Durée",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "day", label: "1 jour" },
              { value: "week", label: "1 semaine" },
              { value: "month", label: "1 mois et +" },
            ]),
          },
          {
            key: "when",
            label: "Date souhaitée",
            help_text: "Approximative si besoin",
            type: "text",
            required: false,
            options: { placeholder: "Ex. semaine du 14" },
          },
        ],
      },
      suggestionsStep("Matériel disponible dans votre parc"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "fitout",
    label: "Aménagement industriel",
    blurb: "Site, contraintes, gammes — vous rappelez pour proposer, pas pour découvrir.",
    defaultName: "Funnel aménagement",
    accent: "#4F46E5",
    tint: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    steps: [
      {
        title: "Le site",
        subtitle: "Usage et contraintes d’implantation",
        screen_type: "questions",
        questions: [
          {
            key: "site",
            label: "Type de site",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "warehouse", label: "Entrepôt / logistique" },
              { value: "workshop", label: "Atelier de production" },
              { value: "office", label: "Bureaux / vestiaires" },
              { value: "other", label: "Autre" },
            ]),
          },
          {
            key: "constraints",
            label: "Contraintes",
            help_text: "Plusieurs choix possibles",
            type: "multi_select",
            required: false,
            options: choices([
              { value: "food", label: "Normes alimentaires" },
              { value: "height", label: "Hauteur limitée" },
              { value: "access", label: "Accès / quai" },
              { value: "none", label: "Aucune particulière" },
            ]),
          },
        ],
      },
      suggestionsStep("Ensembles adaptés à votre site"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "general",
    label: "Sur mesure",
    blurb: "Un funnel générique : cadrage, catalogue, contact. Vous affinez ensuite.",
    defaultName: "Nouveau funnel",
    accent: "#E85D04",
    tint: "bg-orange-50 text-orange-800 ring-orange-200",
    steps: [
      {
        title: "Votre projet",
        subtitle: "Quelques questions pour cadrer le besoin",
        screen_type: "questions",
        questions: [
          {
            key: "project_type",
            label: "Quel est votre projet ?",
            help_text: null,
            type: "text",
            required: true,
            options: { placeholder: "Décrivez en une phrase" },
          },
          {
            key: "timeline",
            label: "Échéance",
            help_text: null,
            type: "select",
            required: false,
            options: choices([
              { value: "asap", label: "Dès que possible" },
              { value: "month", label: "Dans le mois" },
              { value: "quarter", label: "Ce trimestre" },
              { value: "explore", label: "Je me renseigne" },
            ]),
          },
        ],
      },
      suggestionsStep("Produits de votre catalogue"),
      customizeStep,
      contactStep,
    ],
  },
];

const LEGACY: Record<string, string> = {
  rayonnage: "racking",
  general: "general",
};

export function getFunnelTemplate(id: string) {
  const normalized = LEGACY[id] ?? id;
  return FUNNEL_TEMPLATES.find((t) => t.id === normalized) ?? FUNNEL_TEMPLATES[FUNNEL_TEMPLATES.length - 1];
}
